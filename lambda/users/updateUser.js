const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "PUT,OPTIONS",
  };

  try {
    const userId = event.pathParameters?.userId;
    const body = JSON.parse(event.body || "{}");

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

    // Validate input
    const allowedFields = ["displayName", "avatar", "isOnline"];
    const updateFields = {};

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updateFields[key] = value;
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "No valid fields to update",
        }),
      };
    }

    // Build update expression
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    for (const [key, value] of Object.entries(updateFields)) {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    }

    // Update user in DynamoDB
    const result = await docClient.send(
      new UpdateCommand({
        TableName: process.env.USERS_TABLE,
        Key: {
          PK: `USER#${userId}`,
          SK: `USER#${userId}`,
        },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );

    const user = {
      id: result.Attributes.id,
      email: result.Attributes.email,
      username: result.Attributes.username,
      displayName: result.Attributes.displayName,
      avatar: result.Attributes.avatar,
      isOnline: result.Attributes.isOnline || false,
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
    console.error("Update user error:", error);
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
