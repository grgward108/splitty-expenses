import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

@service({
  title: "Splitty API",
})
@server("http://localhost:3000", "Development server")
namespace SplittyApi;

// =====================================
// Enums
// =====================================

enum SplitType {
  equal: "equal",
  exact: "exact",
}

enum ExpenseCategory {
  food: "food",
  transport: "transport",
  accommodation: "accommodation",
  entertainment: "entertainment",
  shopping: "shopping",
  utilities: "utilities",
  other: "other",
}

// =====================================
// Models
// =====================================

model Member {
  id: string;
  groupId: string;
  name: string;
  emoji: string;
  createdAt: utcDateTime;
}

model ExpenseSplit {
  id: string;
  expenseId: string;
  memberId: string;
  amount: string;
  createdAt: utcDateTime;
}

model Expense {
  id: string;
  groupId: string;
  description: string;
  amount: string;
  paidByMemberId: string;
  splitType: SplitType;
  category: ExpenseCategory;
  splits: ExpenseSplit[];
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

model Group {
  id: string;
  name: string;
  currency: string;
  members: Member[];
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

// Request models

model CreateMemberInput {
  name: string;
  emoji?: string;
}

model CreateGroupRequest {
  name: string;
  currency?: string;
  members: CreateMemberInput[];
}

model AddMemberRequest {
  name: string;
  emoji?: string;
}

model UpdateMemberRequest {
  name?: string;
  emoji?: string;
}

model CreateExpenseSplitInput {
  memberId: string;
  amount: string;
}

model CreateExpenseRequest {
  description: string;
  amount: string;
  paidByMemberId: string;
  splitType: SplitType;
  category?: ExpenseCategory;
  splits: CreateExpenseSplitInput[];
}

model UpdateExpenseRequest {
  description?: string;
  amount?: string;
  paidByMemberId?: string;
  splitType?: SplitType;
  category?: ExpenseCategory;
  splits?: CreateExpenseSplitInput[];
}

// Response models

model Balance {
  memberId: string;
  memberName: string;
  memberEmoji: string;
  balance: string;
}

model Debt {
  fromMemberId: string;
  fromMemberName: string;
  fromMemberEmoji: string;
  toMemberId: string;
  toMemberName: string;
  toMemberEmoji: string;
  amount: string;
}

model BalanceSummary {
  balances: Balance[];
  debts: Debt[];
}

model PaginatedResponse<T> {
  items: T[];
  total: int32;
  page: int32;
  limit: int32;
  totalPages: int32;
}

model ErrorResponse {
  message: string;
  code: string;
}

// =====================================
// Query Parameters
// =====================================

model PaginationQuery {
  @query page?: int32 = 1;
  @query limit?: int32 = 10;
}

// =====================================
// Routes
// =====================================

@route("/api")
namespace Api {
  @route("/groups")
  @tag("groups")
  namespace Groups {
    @post
    op create(@body body: CreateGroupRequest): Group | ErrorResponse;

    @get
    @route("/{groupId}")
    op get(@path groupId: string): Group | ErrorResponse;
  }

  @route("/groups/{groupId}/members")
  @tag("members")
  namespace Members {
    @post
    op add(@path groupId: string, @body body: AddMemberRequest): Member | ErrorResponse;

    @put
    @route("/{memberId}")
    op update(
      @path groupId: string,
      @path memberId: string,
      @body body: UpdateMemberRequest,
    ): Member | ErrorResponse;

    @delete
    @route("/{memberId}")
    op remove(@path groupId: string, @path memberId: string): void | ErrorResponse;
  }

  @route("/groups/{groupId}/expenses")
  @tag("expenses")
  namespace Expenses {
    @get
    op list(@path groupId: string, ...PaginationQuery): PaginatedResponse<Expense> | ErrorResponse;

    @post
    op create(
      @path groupId: string,
      @body body: CreateExpenseRequest,
    ): Expense | ErrorResponse;

    @get
    @route("/{expenseId}")
    op get(
      @path groupId: string,
      @path expenseId: string,
    ): Expense | ErrorResponse;

    @put
    @route("/{expenseId}")
    op update(
      @path groupId: string,
      @path expenseId: string,
      @body body: UpdateExpenseRequest,
    ): Expense | ErrorResponse;

    @delete
    @route("/{expenseId}")
    op delete(@path groupId: string, @path expenseId: string): void | ErrorResponse;
  }

  @route("/groups/{groupId}/balances")
  @tag("balances")
  namespace Balances {
    @get
    op get(@path groupId: string): BalanceSummary | ErrorResponse;
  }

  @route("/health")
  @tag("health")
  namespace Health {
    @get
    op check(): {
      status: "ok" | "error";
      timestamp: utcDateTime;
    };
  }
}
