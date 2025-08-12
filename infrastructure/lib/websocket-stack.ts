import * as cdk from "aws-cdk-lib";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { WebSocketApi, WebSocketStage } from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Function, Runtime, Code, Architecture } from "aws-cdk-lib/aws-lambda";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";

interface WebSocketStackProps extends StackProps {
  usersTable: Table;
  roomsTable: Table;
  messagesTable: Table;
  connectionsTable: Table;
}

export class WebSocketStack extends Stack {
  public readonly webSocketApi: WebSocketApi;

  constructor(scope: Construct, id: string, props: WebSocketStackProps) {
    super(scope, id, props);

    const { usersTable, roomsTable, messagesTable, connectionsTable } = props;

    // Common Lambda environment variables
    const commonEnvironment = {
      USERS_TABLE: usersTable.tableName,
      ROOMS_TABLE: roomsTable.tableName,
      MESSAGES_TABLE: messagesTable.tableName,
      CONNECTIONS_TABLE: connectionsTable.tableName,
      REGION: this.region,
    };

    // Common Lambda properties
    const commonLambdaProps = {
      runtime: Runtime.NODEJS_20_X,
      architecture: Architecture.ARM_64,
      environment: commonEnvironment,
    };

    // WebSocket Lambda functions
    const connectFunction = new Function(this, "WebSocketConnectFunction", {
      ...commonLambdaProps,
      functionName: "dynamo-talk-websocket-connect",
      code: Code.fromAsset("../lambda/websocket"),
      handler: "connect.handler",
    });

    const disconnectFunction = new Function(
      this,
      "WebSocketDisconnectFunction",
      {
        ...commonLambdaProps,
        functionName: "dynamo-talk-websocket-disconnect",
        code: Code.fromAsset("../lambda/websocket"),
        handler: "disconnect.handler",
      }
    );

    const messageFunction = new Function(this, "WebSocketMessageFunction", {
      ...commonLambdaProps,
      functionName: "dynamo-talk-websocket-message",
      code: Code.fromAsset("../lambda/websocket"),
      handler: "message.handler",
    });

    // Create WebSocket API
    this.webSocketApi = new WebSocketApi(this, "ChatWebSocketApi", {
      apiName: "DynamoTalk WebSocket API",
      description: "WebSocket API for DynamoTalk real-time chat",
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "ConnectIntegration",
          connectFunction
        ),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "DisconnectIntegration",
          disconnectFunction
        ),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "MessageIntegration",
          messageFunction
        ),
      },
    });

    // Create WebSocket stage
    const stage = new WebSocketStage(this, "ChatWebSocketStage", {
      webSocketApi: this.webSocketApi,
      stageName: "prod",
      autoDeploy: true,
    });

    // Grant DynamoDB permissions to Lambda functions
    const lambdaFunctions = [
      connectFunction,
      disconnectFunction,
      messageFunction,
    ];

    lambdaFunctions.forEach((fn) => {
      // Grant read/write access to all tables
      usersTable.grantReadWriteData(fn);
      roomsTable.grantReadWriteData(fn);
      messagesTable.grantReadWriteData(fn);
      connectionsTable.grantReadWriteData(fn);

      // Grant access to GSIs
      fn.addToRolePolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["dynamodb:Query", "dynamodb:GetItem"],
          resources: [
            `${usersTable.tableArn}/index/*`,
            `${roomsTable.tableArn}/index/*`,
            `${messagesTable.tableArn}/index/*`,
            `${connectionsTable.tableArn}/index/*`,
          ],
        })
      );

      // Grant permissions to manage WebSocket connections
      fn.addToRolePolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ["execute-api:ManageConnections"],
          resources: [
            `arn:aws:execute-api:${this.region}:${this.account}:${this.webSocketApi.apiId}/*`,
          ],
        })
      );
    });

    // Add the WebSocket API URL to environment for Lambda functions
    lambdaFunctions.forEach((fn) => {
      fn.addEnvironment(
        "WEBSOCKET_ENDPOINT",
        stage.url.replace("wss://", "https://")
      );
    });

    // Output WebSocket URL
    new cdk.CfnOutput(this, "WebSocketUrl", {
      value: stage.url,
      description: "WebSocket API URL",
      exportName: "DynamoTalkWebSocketUrl",
    });
  }
}
