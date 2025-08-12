#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CognitoStack } from "../lib/cognito-stack";
import { DynamoDBStack } from "../lib/dynamodb-stack";
import { ApiStack } from "../lib/api-stack";
import { WebSocketStack } from "../lib/websocket-stack";

const app = new cdk.App();

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || "us-east-1",
};

// Create stacks
const cognitoStack = new CognitoStack(app, "DynamoTalk-Cognito", {
  env,
  description: "DynamoTalk Cognito User Pool and Authentication",
});

const dynamoStack = new DynamoDBStack(app, "DynamoTalk-DynamoDB", {
  env,
  description: "DynamoTalk DynamoDB Tables for Chat Data",
});

const apiStack = new ApiStack(app, "DynamoTalk-API", {
  env,
  description: "DynamoTalk REST API and Lambda Functions",
  userPool: cognitoStack.userPool,
  usersTable: dynamoStack.usersTable,
  roomsTable: dynamoStack.roomsTable,
  messagesTable: dynamoStack.messagesTable,
  connectionsTable: dynamoStack.connectionsTable,
});

const webSocketStack = new WebSocketStack(app, "DynamoTalk-WebSocket", {
  env,
  description: "DynamoTalk WebSocket API for Real-time Chat",
  usersTable: dynamoStack.usersTable,
  roomsTable: dynamoStack.roomsTable,
  messagesTable: dynamoStack.messagesTable,
  connectionsTable: dynamoStack.connectionsTable,
});

// Stack dependencies
apiStack.addDependency(cognitoStack);
apiStack.addDependency(dynamoStack);
webSocketStack.addDependency(dynamoStack);

// Add tags to all stacks
cdk.Tags.of(app).add("Project", "DynamoTalk");
cdk.Tags.of(app).add("Environment", "Development");
