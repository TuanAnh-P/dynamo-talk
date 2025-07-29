# DynamoTalk - Serverless Chat Application

A real-time chat application built with AWS serverless services, Next.js, and Tailwind CSS.

## Architecture

This application uses AWS serverless services for scalability and cost-effectiveness:

**Backend Services:**

- AWS Lambda - API logic and message processing
- DynamoDB - Message storage and user data
- API Gateway - RESTful API endpoints
- WebSocket API - Real-time communication
- Cognito - User authentication
- S3 - File uploads and avatars
- CloudFront - Content delivery

**Frontend:**

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- AWS SDK integration

## Database Design

**Users Table**

```
PK: USER#{userId}
Attributes: username, email, avatar, createdAt, lastSeen
```

**Rooms Table**

```
PK: ROOM#{roomId}
Attributes: name, description, type, createdBy, members[]
```

**Messages Table**

```
PK: ROOM#{roomId}
SK: MESSAGE#{timestamp}#{messageId}
Attributes: userId, content, messageType, attachments
```

**Connections Table**

```
PK: CONNECTION#{connectionId}
Attributes: userId, roomId, connectedAt
```

## Getting Started

```bash
npm install
npm run dev
```

Create `.env.local`:

```env
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_USER_POOL_ID=your-user-pool-id
NEXT_PUBLIC_USER_POOL_CLIENT_ID=your-app-client-id
NEXT_PUBLIC_API_URL=your-api-gateway-url
NEXT_PUBLIC_WEBSOCKET_URL=your-websocket-api-url
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                # Utilities and AWS config
└── types/              # TypeScript definitions

aws/
├── lambda/             # Lambda functions
├── dynamodb/          # Table definitions
└── infrastructure/    # CloudFormation/CDK
```
