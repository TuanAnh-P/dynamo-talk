const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  };

  try {
    const roomId = event.pathParameters?.roomId;
    const body = JSON.parse(event.body || "{}");
    const { content, messageType = "text", attachments = [] } = body;

    if (!roomId || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Room ID and content are required",
        }),
      };
    }

    // Extract user ID from JWT token (simplified for demo)
    const authHeader =
      event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Authorization header required",
        }),
      };
    }

    // For demo purposes, using a placeholder user ID
    const userId = "demo-user-id";
    const messageId = randomUUID();
    const now = new Date().toISOString();

    const message = {
      PK: `ROOM#${roomId}`,
      SK: `MESSAGE#${now}#${messageId}`,
      GSI1PK: `USER#${userId}`,
      GSI1SK: now,
      id: messageId,
      roomId,
      userId,
      content,
      messageType,
      attachments,
      createdAt: now,
    };

    // Save message to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: process.env.MESSAGES_TABLE,
        Item: message,
      })
    );

    const responseMessage = {
      id: message.id,
      roomId: message.roomId,
      userId: message.userId,
      content: message.content,
      messageType: message.messageType,
      attachments: message.attachments,
      createdAt: message.createdAt,
    };

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        data: responseMessage,
      }),
    };
  } catch (error) {
    console.error("Send message error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
    };
  }
};
