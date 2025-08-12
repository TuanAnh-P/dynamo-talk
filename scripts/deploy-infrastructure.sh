#!/bin/bash

# Deploy DynamoTalk Infrastructure with AWS CDK

set -e

echo "Deploying DynamoTalk Infrastructure..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "ERROR: AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

# Navigate to infrastructure directory
cd infrastructure

echo "Installing CDK dependencies..."
npm install

echo "Building CDK project..."
npm run build

echo "Bootstrapping CDK (if needed)..."
npx cdk bootstrap

echo "Showing what will be deployed..."
npx cdk diff

echo ""
read -p "Do you want to proceed with deployment? (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo "Deploying all stacks..."
npx cdk deploy --all --require-approval never

echo ""
echo "Deployment completed!"
echo ""
echo "Getting output values..."
echo "====================================="

# Get Cognito outputs
echo "Cognito Configuration:"
aws cloudformation describe-stacks \
    --stack-name DynamoTalk-Cognito \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
    --output text 2>/dev/null || echo "N/A" | sed 's/^/   NEXT_PUBLIC_USER_POOL_ID=/'

aws cloudformation describe-stacks \
    --stack-name DynamoTalk-Cognito \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
    --output text 2>/dev/null || echo "N/A" | sed 's/^/   NEXT_PUBLIC_USER_POOL_CLIENT_ID=/'

echo ""
echo "DynamoDB Tables:"
aws cloudformation describe-stacks \
    --stack-name DynamoTalk-DynamoDB \
    --query 'Stacks[0].Outputs[?OutputKey==`UsersTableName`].OutputValue' \
    --output text 2>/dev/null || echo "N/A" | sed 's/^/   NEXT_PUBLIC_USERS_TABLE=/'

echo ""
echo "====================================="
echo "Infrastructure deployed successfully!"
echo "Copy the above values to your .env.local file"
echo "====================================="

cd ..