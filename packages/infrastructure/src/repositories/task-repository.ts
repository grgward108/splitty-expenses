import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import type { TaskRepository } from "@repo/core";
import { Task, type TaskStatus } from "@repo/core";
import type { PaginatedResult, PaginationParams, TaskId } from "@repo/core";
import { dynamoDBClient, getTableName } from "../database/dynamodb";

/**
 * DynamoDB implementation of TaskRepository
 */
export class DynamoDBTaskRepository implements TaskRepository {
  private readonly tableName: string;

  constructor() {
    this.tableName = getTableName();
  }

  async findById(id: TaskId): Promise<Task | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id: String(id) },
    });

    const result = await dynamoDBClient.send(command);

    if (!result.Item) {
      return null;
    }

    return this.mapToTask(result.Item);
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResult<Task>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const command = new ScanCommand({
      TableName: this.tableName,
      Limit: limit,
    });

    const result = await dynamoDBClient.send(command);
    const items = (result.Items || []).map((item: Record<string, unknown>) => this.mapToTask(item));

    // Simple pagination (DynamoDB pagination would use LastEvaluatedKey)
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    return {
      items: paginatedItems,
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit),
    };
  }

  async save(task: Task): Promise<Task> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    });

    await dynamoDBClient.send(command);
    return task;
  }

  async delete(id: TaskId): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { id: String(id) },
    });

    await dynamoDBClient.send(command);
  }

  async findByStatus(
    status: TaskStatus,
    params?: { page?: number; limit?: number }
  ): Promise<{
    items: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: "status-index",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
      Limit: limit,
    });

    const result = await dynamoDBClient.send(command);
    const items = (result.Items || []).map((item: Record<string, unknown>) => this.mapToTask(item));

    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    return {
      items: paginatedItems,
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit),
    };
  }

  private mapToTask(item: Record<string, unknown>): Task {
    return new Task(
      item.id as string,
      item.title as string,
      (item.description as string) || null,
      item.status as TaskStatus,
      (item.dueDate as string) || null,
      item.createdAt as string,
      item.updatedAt as string
    );
  }
}
