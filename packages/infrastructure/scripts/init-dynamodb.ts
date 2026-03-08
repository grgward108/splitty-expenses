import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const endpoint = process.env.DYNAMODB_ENDPOINT || "http://localhost:8000";
const region = process.env.AWS_REGION || "us-east-1";
const tableName = process.env.DYNAMODB_TABLE_NAME || "tasks";

const client = new DynamoDBClient({
  endpoint,
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "dummy",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "dummy",
  },
});

async function createTable() {
  try {
    const command = new CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
        {
          AttributeName: "status",
          AttributeType: "S",
        },
      ],
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "status-index",
          KeySchema: [
            {
              AttributeName: "status",
              KeyType: "HASH",
            },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
    });

    await client.send(command);
    console.log(`✅ Table "${tableName}" created successfully`);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ResourceInUseException") {
      console.log(`ℹ️  Table "${tableName}" already exists`);
    } else {
      console.error("❌ Error creating table:", error);
      process.exit(1);
    }
  }
}

createTable();
