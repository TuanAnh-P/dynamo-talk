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

    // Query user's rooms using GSI
    const result = await docClient.send(
      new QueryCommand({
        TableName: process.env.ROOMS_TABLE,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pk",
        ExpressionAttributeValues: {
          ":pk": "ROOMS",
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
