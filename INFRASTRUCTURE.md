# Infrastructure Setup Guide

This project uses AWS CDK (Infrastructure as Code) to deploy all AWS resources automatically.

## Quick Start (Recommended)

### 1. Prerequisites

- AWS CLI installed and configured (`aws configure`)
- AWS account with appropriate permissions
- Node.js 18+ installed

### 2. Deploy Infrastructure

```bash
# Deploy all AWS resources automatically
npm run infra:deploy
```

This will:

- Create Cognito User Pool for authentication
- Set up DynamoDB tables for chat data
- Output environment variables for your `.env.local`

### 3. Configure Environment

Copy the output values to create `.env.local`:

```env
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_USER_POOL_ID=your-generated-user-pool-id
NEXT_PUBLIC_USER_POOL_CLIENT_ID=your-generated-client-id
NEXT_PUBLIC_USERS_TABLE=dynamo-talk-users
NEXT_PUBLIC_ROOMS_TABLE=dynamo-talk-rooms
NEXT_PUBLIC_MESSAGES_TABLE=dynamo-talk-messages
NEXT_PUBLIC_CONNECTIONS_TABLE=dynamo-talk-connections
```

### 4. Start Development

```bash
npm run dev
```

## Manual Infrastructure Commands

```bash
# View what will be deployed
npm run infra:diff

# Generate CloudFormation template
npm run infra:synth

# Destroy all infrastructure (careful!)
npm run infra:destroy
```

## AWS Permissions Required

Your AWS user/role needs permissions for:

- CloudFormation (create/update/delete stacks)
- Cognito (create user pools)
- DynamoDB (create tables)
- IAM (create roles for services)

## Cost Considerations

All resources use pay-per-request pricing:

- **Cognito**: Free tier covers development usage
- **DynamoDB**: Pay per read/write request
- **No idle costs** - only pay for actual usage

## Cleanup

To remove all AWS resources and avoid charges:

```bash
npm run infra:destroy
```

This will permanently delete all data!
