# Environment Setup Guide

Create a `.env.local` file in your project root with the following variables:

```env
# AWS Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key-id
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Cognito Configuration
NEXT_PUBLIC_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_USER_POOL_CLIENT_ID=your-app-client-id
NEXT_PUBLIC_IDENTITY_POOL_ID=your-identity-pool-id

# API Configuration
NEXT_PUBLIC_API_URL=your-api-gateway-url
NEXT_PUBLIC_WEBSOCKET_URL=your-websocket-api-url

# DynamoDB Tables
NEXT_PUBLIC_USERS_TABLE=dynamo-talk-users
NEXT_PUBLIC_ROOMS_TABLE=dynamo-talk-rooms
NEXT_PUBLIC_MESSAGES_TABLE=dynamo-talk-messages
NEXT_PUBLIC_CONNECTIONS_TABLE=dynamo-talk-connections

# S3 Configuration
NEXT_PUBLIC_S3_BUCKET=dynamo-talk-uploads
NEXT_PUBLIC_CLOUDFRONT_URL=your-cloudfront-url
```

## Setup Instructions

1. **AWS Account Setup**

   - Create an AWS account if you don't have one
   - Set up IAM user with appropriate permissions
   - Generate access keys

2. **Create Cognito User Pool**

   - Go to AWS Cognito console
   - Create a new User Pool
   - Note down the User Pool ID and App Client ID

3. **Set up DynamoDB Tables**

   - Use the table definitions in `aws/dynamodb/tables.ts`
   - Create tables in AWS console or use CDK/CloudFormation

4. **Configure S3 Bucket**
   - Create an S3 bucket for file uploads
   - Set up CloudFront distribution (optional)

## Development Mode

For development, you can start with minimal configuration:

- Set up Cognito User Pool
- Use local DynamoDB (optional)
- Skip S3 setup initially
