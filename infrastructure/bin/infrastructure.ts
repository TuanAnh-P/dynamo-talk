#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CognitoStack } from "../lib/cognito-stack";
import { DynamoDBStack } from "../lib/dynamodb-stack";

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

// Add tags to all stacks
cdk.Tags.of(app).add("Project", "DynamoTalk");
cdk.Tags.of(app).add("Environment", "Development");
