const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');
const { randomUUID } = require('crypto');

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    const body = JSON.parse(event.body || '{}');
    const { type, roomId, content } = body;

    // Initialize API Gateway Management API client
    const apiGateway = new ApiGatewayManagementApiClient({
      region: process.env.REGION,
      endpoint: process.env.WEBSOCKET_ENDPOINT,
    });

    if (type === 'message' && roomId && content) {
      const messageId = randomUUID();
      const now = new Date().toISOString();
      const userId = 'demo-user-id'; // In real app, extract from JWT

      // Save message to DynamoDB
      const message = {
        PK: `ROOM#${roomId}`,
        SK: `MESSAGE#${now}#${messageId}`,
        GSI1PK: `USER#${userId}`,
        GSI1SK: now,
        id: messageId,
        roomId,
        userId,
        content,
        messageType: 'text',
        attachments: [],
        createdAt: now,
      };

      await docClient.send(
        new PutCommand({
          TableName: process.env.MESSAGES_TABLE,
          Item: message,
        })
      );

      // Get all connections for the room
      const connectionsResult = await docClient.send(
        new QueryCommand({
          TableName: process.env.CONNECTIONS_TABLE,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :pk',
          ExpressionAttributeValues: {
            ':pk': 'CONNECTIONS',
          },
        })
      );

      // Broadcast message to all connected users
      const broadcastMessage = {
        type: 'message',
        data: {
          id: message.id,
          roomId: message.roomId,
          userId: message.userId,
          content: message.content,
          messageType: message.messageType,
          createdAt: message.createdAt,
        },
        timestamp: now,
      };

      const broadcastPromises = connectionsResult.Items?.map(async (connection) => {
        try {
          await apiGateway.send(
            new PostToConnectionCommand({
              ConnectionId: connection.connectionId,
              Data: JSON.stringify(broadcastMessage),
            })
          );
        } catch (error) {
          console.error(`Failed to send to connection ${connection.connectionId}:`, error);
          // Connection might be stale, could delete it here
        }
      }) || [];

      await Promise.all(broadcastPromises);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Message processed' }),
    };
  } catch (error) {
    console.error('WebSocket message error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process message' }),
    };
  }
};
