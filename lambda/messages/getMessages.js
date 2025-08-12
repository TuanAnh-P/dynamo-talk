const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
  };

  try {
    const roomId = event.pathParameters?.roomId;
    const limit = event.queryStringParameters?.limit
      ? parseInt(event.queryStringParameters.limit)
      : 50;
    const lastKey = event.queryStringParameters?.lastKey;

    if (!roomId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Room ID is required",
        }),
      };
    }

    // Get user ID from Cognito authorizer context
    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: "User not authenticated",
        }),
      };
    }

    const queryParams = {
      TableName: process.env.MESSAGES_TABLE,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": `ROOM#${roomId}`,
      },
      ScanIndexForward: false, // Get newest messages first
      Limit: limit,
    };

    if (lastKey) {
      queryParams.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
    }

    // Query messages for the room
    const result = await docClient.send(new QueryCommand(queryParams));

    const messages =
      result.Items?.map((item) => ({
        id: item.id,
        roomId: item.roomId,
        userId: item.userId,
        content: item.content,
        messageType: item.messageType || "text",
        attachments: item.attachments || [],
        createdAt: item.createdAt,
        editedAt: item.editedAt,
      })) || [];

    const response = {
      success: true,
      data: {
        messages,
        hasMore: !!result.LastEvaluatedKey,
        lastKey: result.LastEvaluatedKey
          ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
          : null,
      },
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Get messages error:", error);
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
