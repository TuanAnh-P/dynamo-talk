const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    const now = new Date().toISOString();

    // Store connection in DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: process.env.CONNECTIONS_TABLE,
        Item: {
          PK: `CONNECTION#${connectionId}`,
          SK: `CONNECTION#${connectionId}`,
          GSI1PK: "CONNECTIONS",
          GSI1SK: now,
          connectionId,
          userId: null, // Will be set when user authenticates
          roomIds: [],
          connectedAt: now,
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Connected" }),
    };
  } catch (error) {
    console.error("WebSocket connect error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to connect" }),
    };
  }
};
