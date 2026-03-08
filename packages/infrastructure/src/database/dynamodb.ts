import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * DynamoDB client configuration
 */
const getDynamoDBClient = (): DynamoDBDocumentClient => {
  const endpoint = process.env.DYNAMODB_ENDPOINT || "http://localhost:8000";
  const region = process.env.AWS_REGION || "us-east-1";

  const client = new DynamoDBClient({
    endpoint,
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
    },
  });

  return DynamoDBDocumentClient.from(client);
};

/**
 * Singleton DynamoDB document client
 */
export const dynamoDBClient = getDynamoDBClient();

/**
 * Get DynamoDB table name from environment
 */
export const getTableName = (): string => {
  return process.env.DYNAMODB_TABLE_NAME || "tasks";
};
