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
    const createdBy = "demo-user-id";
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
