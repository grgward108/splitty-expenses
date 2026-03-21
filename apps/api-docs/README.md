# API docs (Scalar)

TypeSpec から生成した OpenAPI（`packages/spec/generated/openapi.yaml`）を Scalar で表示する静的サイトです。`public/` を任意の静的ホスティングや CDN に載せて公開できます。

## ローカル開発

```bash
pnpm --filter @repo/api-docs dev
# または
mise run dev:api-docs
```

`mise run dev`（`turbo run dev`）でも `@repo/api-docs` が並列起動されます。ブラウザで **http://localhost:8788** を開きます。8788 が既に使われている場合は `serve` が別ポートを選ぶので、ターミナルに表示された URL を使ってください。

## ビルド

`pnpm --filter @repo/api-docs build` で `public/openapi.yaml` に仕様をコピーします。`turbo run build --filter=@repo/api-docs` では先に `@repo/spec` の `generate` が走ります。

## 本番への載せ方

`public/` ディレクトリ一式（`index.html` とビルド後の `openapi.yaml`）をデプロイ先にアップロードしてください。先に `pnpm build` で `openapi.yaml` を生成する必要があります。
