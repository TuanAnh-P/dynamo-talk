#!/bin/bash

# Destroy DynamoTalk Infrastructure

set -e

echo "Destroying DynamoTalk Infrastructure..."

# Warning message
echo "WARNING: This will permanently delete all AWS resources!"
echo "   - Cognito User Pool (all users will be deleted)"
echo "   - DynamoDB Tables (all chat data will be lost)"
echo ""

read -p "Are you sure you want to destroy everything? Type 'DELETE' to confirm: " -r
if [[ ! $REPLY == "DELETE" ]]; then
    echo "Destruction cancelled."
    exit 1
fi

# Navigate to infrastructure directory
cd infrastructure

echo "Building CDK project..."
npm run build

echo "Destroying all stacks..."
npx cdk destroy --all --force

echo ""
echo "All infrastructure has been destroyed!"
echo "You can safely delete your .env.local file or remove the AWS variables"

cd ..