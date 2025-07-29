import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { S3Client } from "@aws-sdk/client-s3";
import { awsConfig } from "./config";

// DynamoDB Client
export const dynamoDbClient = new DynamoDBClient({
  region: awsConfig.region,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
});

// Cognito Client
export const cognitoClient = new CognitoIdentityProviderClient({
  region: awsConfig.region,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
});

// S3 Client
export const s3Client = new S3Client({
  region: awsConfig.region,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
});

// Helper function to initialize clients with custom credentials
export const initializeAwsClients = (
  accessKeyId: string,
  secretAccessKey: string
) => {
  const credentials = { accessKeyId, secretAccessKey };

  return {
    dynamoDB: new DynamoDBClient({ region: awsConfig.region, credentials }),
    cognito: new CognitoIdentityProviderClient({
      region: awsConfig.region,
      credentials,
    }),
    s3: new S3Client({ region: awsConfig.region, credentials }),
  };
};
