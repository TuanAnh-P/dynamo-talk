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

    // Query rooms created by the user using GSI
    const result = await docClient.send(
      new QueryCommand({
        TableName: process.env.ROOMS_TABLE,
        IndexName: "createdBy-index",
        KeyConditionExpression: "createdBy = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
    );

    const rooms =
      result.Items?.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.type,
        createdBy: item.createdBy,
        members: item.members || [],
        createdAt: item.createdAt,
      })) || [];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: rooms,
      }),
    };
  } catch (error) {
    console.error("Get rooms error:", error);
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
