---
name: feature-spec-fullstack
description: >-
  新規機能やフルスタック実装（API・Web・モバイル）では、まず docs/specs の機能仕様（Markdown）を作成し、ユーザーの明示承認があるまでコードや TypeSpec を変更しない。承認後は TypeSpec→generate→API ハンドラ→Web→モバイルの順で進める。トリガー例: 新規機能、仕様書、spec 承認、API と Web とモバイル、フルスタック、feature spec、エンドポイント追加。
---

# 機能仕様（承認ゲート）→ フルスタック実装

「機能仕様」と「API 契約（TypeSpec / OpenAPI）」を混同しない。前者は **人間向けの Markdown**、後者は **`@repo/spec` の機械可読なソース**。

## いつ使うか

- ユーザーが新しいユーザー向け機能や画面・API を追加・変更したいとき
- API・Web（`apps/web`）・モバイル（`apps/mobile`）の複数層にまたがるとき

単一ファイルのバグ修正や文言変更だけでは、このスキル全体は不要。

## フェーズ 1: 機能仕様（Markdown）の作成

1. パスを **`docs/specs/<feature-slug>.md`** とする（kebab-case の `feature-slug`。例: `task-comments.md`）。
2. 次の見出しを埋めるテンプレートでドラフトを書く（不足は質問で補う）:

   - **概要**（背景・目的）
   - **スコープ**（やること / やらないこと）
   - **ユーザーストーリーまたはユースケース**
   - **受け入れ条件**（テスト可能な箇条書き）
   - **API 変更の要約**（新規・変更・削除する操作、認証、エラー方針）※詳細は後続で TypeSpec に落とす
   - **Web**（ルート、主要 UI、既存パターンとの差）
   - **モバイル**（画面、ネイティブ固有: ディープリンク・オフライン等）
   - **オープンクエスチョン**

3. ドラフトをユーザーに提示する。

## フェーズ 2: 承認ゲート（必須）

- **ユーザーの明示的な承認**（例:「OK」「承認」「この仕様で進めて」）があるまで、次を **一切行わない**:
  - `packages/spec` の TypeSpec 編集
  - `apps/api` / `apps/web` / `apps/mobile` / その他パッケージの実装変更
- 承認前に「ついでに型だけ」「ドラフトの仕様はこのまま仮で」と実装に入らない。

承認後にフェーズ 3 へ進む。

## フェーズ 3: 承認後の実装順序

各パッケージの詳細は該当 **`AGENTS.md`** を読む。

1. **`packages/spec`**（`packages/spec/AGENTS.md`）  
   - `main.tsp` 等で API 契約を更新。  
   - **`mise run generate`**（または `pnpm turbo run generate`）で OpenAPI とクライアント生成物を更新。

2. **`apps/api`**（`apps/api/AGENTS.md`）  
   - **`pnpm --filter @repo/api generate`**（Orval）で `src/generated/` とルート合成を更新。  
   - `src/handlers/*.ts` を実装。新プレフィックスで DB / セッションが要る場合は `app.ts` のミドルウェアを調整。

3. **ドメイン・インフラが必要なら**  
   - `packages/core/AGENTS.md`  
   - `packages/infrastructure/AGENTS.md`

4. **`apps/web`**（`apps/web/AGENTS.md`）  
   - 生成された `@repo/spec` クライアントで UI・ルートを追加・変更。

5. **`apps/mobile`**（`apps/mobile/AGENTS.md`）  
   - 同様に API 利用と画面を追加・変更。

6. **公開 API ドキュメント**  
   - `apps/api-docs/AGENTS.md`: spec 再生成後に `pnpm --filter @repo/api-docs build` 等。

7. 型・ビルドが通ることを確認する（プロジェクトの `typecheck` / `lint` タスクに従う）。

## 注意

- 機能仕様ファイル（`docs/specs/*.md`）は、承認後も「なぜそうしたか」の記録として残す。実装と差分が出たら仕様書を追記または別セクションで明記する。
- 小さな変更でもユーザーが「フルスタックで」と言った場合は、短い仕様＋承認でよい（テンプレートは簡略化可）。**承認ゲートだけは省略しない。**
