const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

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
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "User ID is required",
        }),
      };
    }

    // Get user from DynamoDB
    const result = await docClient.send(
      new GetCommand({
        TableName: process.env.USERS_TABLE,
        Key: {
          PK: `USER#${userId}`,
          SK: `USER#${userId}`,
        },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "User not found",
        }),
      };
    }

    const user = {
      id: result.Item.id,
      email: result.Item.email,
      username: result.Item.username,
      displayName: result.Item.displayName,
      avatar: result.Item.avatar,
      isOnline: result.Item.isOnline || false,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: user,
      }),
    };
  } catch (error) {
    console.error("Get user error:", error);
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
