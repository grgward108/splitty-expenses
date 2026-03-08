# @repo/spec — AGENTS.md

このパッケージは **API 仕様** と **生成コード** を管理します。TypeSpec で API を定義し、OpenAPI を経由して Orval でフロント用クライアント（TanStack Query フック）を生成します。バックエンド用の Zod スキーマ等は同じ OpenAPI から生成されます。

## 役割

- TypeSpec（`.tsp`）による API モデル・ルート定義
- OpenAPI 3 スキーマの生成（`generated/openapi.yaml`）
- Orval によるフロントエンド用クライアント生成（`generated/client/`）
- カスタム fetcher（`src/fetcher.ts`）の提供

## ディレクトリ構成

```
src/
├── main.tsp         # API 仕様のエントリ
├── fetcher.ts       # カスタム HTTP クライアント（生成コードから利用）
generated/           # 生成済み（git にコミット）
├── openapi.yaml     # OpenAPI スキーマ
└── client/          # Orval 生成の TanStack Query フック・型
scripts/
└── serve-swagger.ts # Swagger UI 配信
tspconfig.yaml
orval.config.ts
```

## ルール・慣習

- **仕様変更**: `src/main.tsp` を編集したら `mise run generate`（または `pnpm generate`）で OpenAPI とクライアントを再生成する。
- **生成コード**: `generated/` 内は手で編集しない。常に TypeSpec / Orval の設定で制御する。
- **モデル**: エンティティ（Task など）・リクエスト/レスポンス・Enum・ページネーションは TypeSpec の model/enum で定義する。
- **ルート**: `@route`, `@get`, `@post`, `@put`, `@delete` などでルートを定義し、`@tag` でグルーピングする。
- **アプリ側の利用**: `@repo/spec` の生成クライアント（例: `generated/client/tasks/tasks.ts`）を apps/web や apps/api からインポートして使用する。

## このパッケージを編集するとき

- 新規エンドポイントは `main.tsp` にモデルとルートを追加し、`generate` を実行する。
- 既存 API の変更も `main.tsp` を修正し、必ず `generate` 後に apps 側の型エラーを確認する。
- Orval の挙動を変える場合は `orval.config.ts` を編集する。fetcher のベース URL やヘッダーは `src/fetcher.ts` で調整する。
