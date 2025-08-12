const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;

    // Remove connection from DynamoDB
    await docClient.send(
      new DeleteCommand({
        TableName: process.env.CONNECTIONS_TABLE,
        Key: {
          PK: `CONNECTION#${connectionId}`,
          SK: `CONNECTION#${connectionId}`,
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Disconnected" }),
    };
  } catch (error) {
    console.error("WebSocket disconnect error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to disconnect" }),
    };
  }
};
