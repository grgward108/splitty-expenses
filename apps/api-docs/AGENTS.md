# @repo/api-docs — AGENTS.md

このパッケージは **API リファレンス用の静的サイト** です。Scalar で OpenAPI を表示する。ソースとなる OpenAPI は `@repo/spec` の生成物（`packages/spec/generated/openapi.yaml`）をビルド時に `public/openapi.yaml` へコピーする。

## 役割

- 開発者向けに API スキーマをブラウザで閲覧
- `public/` をそのまま静的ホスティングに載せられる形にする

## ディレクトリ構成

```
public/
├── index.html          # Scalar エントリ
└── openapi.yaml        # ビルドでコピーされる（リポジトリに載る場合あり）
scripts/
└── copy-openapi.mjs    # spec の openapi.yaml を public にコピー
```

## ルール・慣習

- **OpenAPI の正**: 編集は `@repo/spec`（TypeSpec）で行い、`mise run generate` 等で `openapi.yaml` を再生成する。api-docs ではコピーのみ。
- **ビルド**: `pnpm --filter @repo/api-docs build` でコピー実行。Turbo のビルドグラフでは `@repo/spec` の generate が先に走る想定にできる。
- **開発**: `mise run dev:api-docs` または `pnpm --filter @repo/api-docs dev`（`build` のあと `serve` で **http://localhost:8788** 付近。ポート競合時はターミナル表示に従う）。

## このパッケージを編集するとき

- Scalar の見た目やエントリ URL を変える場合は `public/index.html` を編集する。
- API 変更後にドキュメントを更新する場合は spec を再生成してから `build` を実行する。
