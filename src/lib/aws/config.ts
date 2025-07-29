// AWS Configuration
export const awsConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",

  // Cognito Configuration
  userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || "",
  userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || "",
  identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID || "",

  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "",
  websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || "",

  // DynamoDB Tables
  tables: {
    users: process.env.NEXT_PUBLIC_USERS_TABLE || "dynamo-talk-users",
    rooms: process.env.NEXT_PUBLIC_ROOMS_TABLE || "dynamo-talk-rooms",
    messages: process.env.NEXT_PUBLIC_MESSAGES_TABLE || "dynamo-talk-messages",
    connections:
      process.env.NEXT_PUBLIC_CONNECTIONS_TABLE || "dynamo-talk-connections",
  },

  // S3 Configuration
  s3: {
    bucket: process.env.NEXT_PUBLIC_S3_BUCKET || "dynamo-talk-uploads",
    cloudfrontUrl: process.env.NEXT_PUBLIC_CLOUDFRONT_URL || "",
  },
};

// Validate required environment variables
export const validateConfig = () => {
  const required = [
    "NEXT_PUBLIC_USER_POOL_ID",
    "NEXT_PUBLIC_USER_POOL_CLIENT_ID",
    "NEXT_PUBLIC_API_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn("Missing required environment variables:", missing);
  }

  return missing.length === 0;
};
