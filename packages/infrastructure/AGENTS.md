# @repo/infrastructure — AGENTS.md

このパッケージは **外部サービスとの接続** を担当します。主に PostgreSQL（Drizzle ORM）による永続化と、`@repo/core` で定義したリポジトリの実装を提供します。

## 役割

- Drizzle による DB スキーマ定義・マイグレーション
- `@repo/core` のリポジトリインターフェースの実装（例: `TaskRepository`）
- DB 接続・クライアントの初期化

## ディレクトリ構成

```
src/
├── database/           # Drizzle 設定・スキーマ・接続
│   ├── schema.ts       # テーブル定義
│   ├── drizzle.ts      # クライアント初期化
│   └── index.ts
├── repositories/       # リポジトリ実装（core のインターフェースを実装）
├── index.ts
drizzle/                # マイグレーション SQL
drizzle.config.ts       # Drizzle Kit 設定
scripts/
└── migrate.ts          # マイグレーション実行スクリプト
```

## ルール・慣習

- **依存**: `@repo/core` に依存する。core のエンティティ・リポジトリ型に合わせて実装する。
- **スキーマ**: `drizzle/schema.ts` でテーブル・Enum を定義。カラム名は snake_case（DB）、TypeScript では camelCase にマッピング。
- **マイグレーション**: スキーマ変更後は `pnpm db:generate`（ルートでは `mise run db:generate`）でマイグレーション生成し、`db:migrate` で適用する。
- **リポジトリ**: core のインターフェースを実装し、Drizzle のクライアントを使って CRUD を行う。入出力は core のエンティティ型に合わせる。

## このパッケージを編集するとき

- テーブル追加・変更は `src/database/schema.ts` を編集し、必ず `db:generate` → `db:migrate` の流れを実行する。
- 新規リポジトリは `src/repositories/` に実装を追加し、`src/index.ts` から export する。
- 環境変数 `DATABASE_URL` は `.mise.local.toml` で設定され、`drizzle.ts` から参照する。
