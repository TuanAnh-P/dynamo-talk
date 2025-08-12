const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

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

    // Check if room exists
    const roomResult = await docClient.send(
      new GetCommand({
        TableName: process.env.ROOMS_TABLE,
        Key: {
          PK: `ROOM#${roomId}`,
          SK: `ROOM#${roomId}`,
        },
      })
    );

    if (!roomResult.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Room not found",
        }),
      };
    }

    // Add user to room members if not already a member
    const currentMembers = roomResult.Item.members || [];
    if (currentMembers.includes(userId)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "User already in room",
        }),
      };
    }

    // Update room with new member
    await docClient.send(
      new UpdateCommand({
        TableName: process.env.ROOMS_TABLE,
        Key: {
          PK: `ROOM#${roomId}`,
          SK: `ROOM#${roomId}`,
        },
        UpdateExpression:
          "SET members = list_append(if_not_exists(members, :empty_list), :user)",
        ExpressionAttributeValues: {
          ":user": [userId],
          ":empty_list": [],
        },
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Successfully joined room",
      }),
    };
  } catch (error) {
    console.error("Join room error:", error);
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
