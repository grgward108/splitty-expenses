# @repo/core — AGENTS.md

このパッケージは **ドメインロジック** を担う純粋な TypeScript パッケージです。外部ライブラリに依存せず、ビジネスルールとエンティティを定義します。

## 役割

- ドメインエンティティ・値オブジェクトの定義
- リポジトリインターフェース（抽象）の定義
- ユースケース（アプリケーションサービス）の実装
- ドメインエラーの定義

## ディレクトリ構成

```
src/
├── entities/       # エンティティ（BaseEntity を継承）
├── value-objects/   # 値オブジェクト
├── repositories/   # リポジトリのインターフェース（抽象）
├── services/       # ドメインサービス
├── use-cases/      # ユースケース（アプリケーションサービス）
├── types/          # 共通型
├── errors/         # ドメインエラー
└── index.ts        # 公開 API
```

## ルール・慣習

- **依存**: 外部パッケージは極力使わない（TypeScript のみ）。インフラ・UI から依存される側。
- **エンティティ**: `BaseEntity<TId>` を継承し、`create` や `update` などのファクトリ・メソッドを static/インスタンスで提供する。
- **不変性**: エンティティは `readonly` を基本とし、更新時は新しいインスタンスを返す（例: `Task#update()`）。
- **リポジトリ**: インターフェースのみ定義。実装は `@repo/infrastructure` に置く。
- **日付**: 文字列（ISO 8601）で扱う（`createdAt`, `updatedAt`, `dueDate` など）。

## このパッケージを編集するとき

- 新規エンティティは `entities/` に追加し、`entities/index.ts` から re-export する。
- 新規リポジトリは `repositories/` にインターフェースを追加し、`infrastructure` 側で実装を追加する。
- ユースケースは `@repo/core` のリポジトリ型に依存し、具体的な DB 実装には触れない。
