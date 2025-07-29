// DynamoDB Table Definitions for DynamoTalk Chat App

export interface TableConfig {
  TableName: string;
  KeySchema: Array<{ AttributeName: string; KeyType: string }>;
  AttributeDefinitions: Array<{ AttributeName: string; AttributeType: string }>;
  BillingMode: string;
  GlobalSecondaryIndexes?: Array<{
    IndexName: string;
    KeySchema: Array<{ AttributeName: string; KeyType: string }>;
    Projection: { ProjectionType: string };
  }>;
}

// Users Table
export const usersTableConfig: TableConfig = {
  TableName: "dynamo-talk-users",
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "email", AttributeType: "S" },
  ],
  BillingMode: "PAY_PER_REQUEST",
  GlobalSecondaryIndexes: [
    {
      IndexName: "email-index",
      KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
      Projection: { ProjectionType: "ALL" },
    },
  ],
};

// Rooms Table
export const roomsTableConfig: TableConfig = {
  TableName: "dynamo-talk-rooms",
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  AttributeDefinitions: [
    { AttributeName: "id", AttributeType: "S" },
    { AttributeName: "createdBy", AttributeType: "S" },
  ],
  BillingMode: "PAY_PER_REQUEST",
  GlobalSecondaryIndexes: [
    {
      IndexName: "createdBy-index",
      KeySchema: [{ AttributeName: "createdBy", KeyType: "HASH" }],
      Projection: { ProjectionType: "ALL" },
    },
  ],
};

// Messages Table
export const messagesTableConfig: TableConfig = {
  TableName: "dynamo-talk-messages",
  KeySchema: [
    { AttributeName: "roomId", KeyType: "HASH" },
    { AttributeName: "sortKey", KeyType: "RANGE" }, // timestamp#messageId
  ],
  AttributeDefinitions: [
    { AttributeName: "roomId", AttributeType: "S" },
    { AttributeName: "sortKey", AttributeType: "S" },
    { AttributeName: "userId", AttributeType: "S" },
  ],
  BillingMode: "PAY_PER_REQUEST",
  GlobalSecondaryIndexes: [
    {
      IndexName: "userId-index",
      KeySchema: [
        { AttributeName: "userId", KeyType: "HASH" },
        { AttributeName: "sortKey", KeyType: "RANGE" },
      ],
      Projection: { ProjectionType: "ALL" },
    },
  ],
};

// Connections Table (for WebSocket management)
export const connectionsTableConfig: TableConfig = {
  TableName: "dynamo-talk-connections",
  KeySchema: [{ AttributeName: "connectionId", KeyType: "HASH" }],
  AttributeDefinitions: [
    { AttributeName: "connectionId", AttributeType: "S" },
    { AttributeName: "userId", AttributeType: "S" },
    { AttributeName: "roomId", AttributeType: "S" },
  ],
  BillingMode: "PAY_PER_REQUEST",
  GlobalSecondaryIndexes: [
    {
      IndexName: "userId-index",
      KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
      Projection: { ProjectionType: "ALL" },
    },
    {
      IndexName: "roomId-index",
      KeySchema: [{ AttributeName: "roomId", KeyType: "HASH" }],
      Projection: { ProjectionType: "ALL" },
    },
  ],
};

export const allTables = [
  usersTableConfig,
  roomsTableConfig,
  messagesTableConfig,
  connectionsTableConfig,
];
