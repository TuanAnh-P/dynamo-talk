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
    const body = JSON.parse(event.body || "{}");
    const { name, description, type = "group" } = body;

    if (!name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Room name is required",
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

    const createdBy = userId;
    const roomId = randomUUID();
    const now = new Date().toISOString();

    const room = {
      PK: `ROOM#${roomId}`,
      SK: `ROOM#${roomId}`,
      GSI1PK: "ROOMS",
      GSI1SK: now,
      id: roomId,
      name,
      description: description || "",
      type,
      createdBy,
      members: [createdBy],
      createdAt: now,
    };

    // Create room in DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: process.env.ROOMS_TABLE,
        Item: room,
      })
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          id: room.id,
          name: room.name,
          description: room.description,
          type: room.type,
          createdBy: room.createdBy,
          members: room.members,
          createdAt: room.createdAt,
        },
      }),
    };
  } catch (error) {
    console.error("Create room error:", error);
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
