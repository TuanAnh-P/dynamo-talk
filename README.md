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

### 1. Install Dependencies

```bash
npm install
```

### 2. Deploy AWS Infrastructure

```bash
npm run infra:deploy
```

This creates all AWS resources (Cognito, DynamoDB) automatically.

### 3. Configure Environment

Copy the output values to `.env.local` - see [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) for details.

### 4. Start Development

```bash
npm run dev
```

## Infrastructure Management

```bash
npm run infra:deploy   # Deploy AWS infrastructure
npm run infra:diff     # Preview changes
npm run infra:destroy  # Remove all AWS resources
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                # Utilities and AWS config
└── types/              # TypeScript definitions

infrastructure/
├── lib/                # CDK stack definitions
└── bin/                # CDK app entry point

scripts/                # Deployment scripts
```
