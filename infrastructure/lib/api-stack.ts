import * as cdk from "aws-cdk-lib";
import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  RestApi,
  LambdaIntegration,
  Cors,
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
} from "aws-cdk-lib/aws-apigateway";
import { Function, Runtime, Code, Architecture } from "aws-cdk-lib/aws-lambda";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";

interface ApiStackProps extends StackProps {
  userPool: UserPool;
  usersTable: Table;
  roomsTable: Table;
  messagesTable: Table;
  connectionsTable: Table;
}

export class ApiStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const {
      userPool,
      usersTable,
      roomsTable,
      messagesTable,
      connectionsTable,
    } = props;

    // Create Cognito authorizer
    const authorizer = new CognitoUserPoolsAuthorizer(
      this,
      "ChatApiAuthorizer",
      {
        cognitoUserPools: [userPool],
      }
    );

    // Create API Gateway
    this.api = new RestApi(this, "ChatApi", {
      restApiName: "DynamoTalk API",
      description: "API for DynamoTalk chat application",
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token",
        ],
      },
    });

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

    // Users Lambda functions
    const getUserFunction = new Function(this, "GetUserFunction", {
      ...commonLambdaProps,
      functionName: "dynamo-talk-get-user",
      code: Code.fromAsset("../lambda/users"),
      handler: "getUser.handler",
    });

    const updateUserFunction = new Function(this, "UpdateUserFunction", {
      ...commonLambdaProps,
      functionName: "dynamo-talk-update-user",
      code: Code.fromAsset("../lambda/users"),
      handler: "updateUser.handler",
    });

    // Rooms Lambda functions
    const getRoomsFunction = new Function(this, "GetRoomsFunction", {
      ...commonLambdaProps,
      functionName: "dynamo-talk-get-rooms",
      code: Code.fromAsset("../lambda/rooms"),
      handler: "getRooms.handler",
    });

    const createRoomFunction = new Function(this, "CreateRoomFunction", {
      ...commonLambdaProps,
      functionName: "dynamo-talk-create-room",
      code: Code.fromAsset("../lambda/rooms"),
      handler: "createRoom.handler",
    });

    const joinRoomFunction = new Function(this, "JoinRoomFunction", {
      ...commonLambdaProps,
      functionName: "dynamo-talk-join-room",
      code: Code.fromAsset("../lambda/rooms"),
      handler: "joinRoom.handler",
    });

    // Messages Lambda functions
    const getMessagesFunction = new Function(this, "GetMessagesFunction", {
      ...commonLambdaProps,
      functionName: "dynamo-talk-get-messages",
      code: Code.fromAsset("../lambda/messages"),
      handler: "getMessages.handler",
    });

    const sendMessageFunction = new Function(this, "SendMessageFunction", {
      ...commonLambdaProps,
      functionName: "dynamo-talk-send-message",
      code: Code.fromAsset("../lambda/messages"),
      handler: "sendMessage.handler",
    });

    // Grant DynamoDB permissions to Lambda functions
    const lambdaFunctions = [
      getUserFunction,
      updateUserFunction,
      getRoomsFunction,
      createRoomFunction,
      joinRoomFunction,
      getMessagesFunction,
      sendMessageFunction,
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
    });

    // API Gateway routes
    const usersResource = this.api.root.addResource("users");
    const userResource = usersResource.addResource("{userId}");
    userResource.addMethod("GET", new LambdaIntegration(getUserFunction), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer,
    });
    userResource.addMethod("PUT", new LambdaIntegration(updateUserFunction), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer,
    });

    const roomsResource = this.api.root.addResource("rooms");
    roomsResource.addMethod("GET", new LambdaIntegration(getRoomsFunction), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer,
    });
    roomsResource.addMethod("POST", new LambdaIntegration(createRoomFunction), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer,
    });

    const roomResource = roomsResource.addResource("{roomId}");
    const joinResource = roomResource.addResource("join");
    joinResource.addMethod("POST", new LambdaIntegration(joinRoomFunction), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer,
    });

    const messagesResource = roomResource.addResource("messages");
    messagesResource.addMethod(
      "GET",
      new LambdaIntegration(getMessagesFunction),
      {
        authorizationType: AuthorizationType.COGNITO,
        authorizer,
      }
    );
    messagesResource.addMethod(
      "POST",
      new LambdaIntegration(sendMessageFunction),
      {
        authorizationType: AuthorizationType.COGNITO,
        authorizer,
      }
    );

    // Output API URL
    new cdk.CfnOutput(this, "ApiUrl", {
      value: this.api.url,
      description: "Chat API URL",
      exportName: "DynamoTalkApiUrl",
    });
  }
}
