import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";

export const splitTypeEnum = pgEnum("split_type", ["equal", "exact"]);

export const categoryEnum = pgEnum("expense_category", [
  "food",
  "transport",
  "accommodation",
  "entertainment",
  "shopping",
  "utilities",
  "other",
]);

export const groups = pgTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("USD"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const members = pgTable("members", {
  id: text("id").primaryKey(),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("😀"),
  createdAt: text("created_at").notNull(),
});

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  amount: text("amount").notNull(),
  paidByMemberId: text("paid_by_member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  splitType: splitTypeEnum("split_type").notNull().default("equal"),
  category: categoryEnum("category").notNull().default("other"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const expenseSplits = pgTable("expense_splits", {
  id: text("id").primaryKey(),
  expenseId: text("expense_id")
    .notNull()
    .references(() => expenses.id, { onDelete: "cascade" }),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  amount: text("amount").notNull(),
  createdAt: text("created_at").notNull(),
});
