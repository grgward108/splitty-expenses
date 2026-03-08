---
name: create-pr
description: Guides creating a feature branch, committing changes, pushing, and opening a pull request with git and GitHub CLI. Use when the user asks to create a PR, open a PR, "PR出して", "PR作って", or to submit changes as a pull request.
---

# PR を作成する

## 前提

- メインブランチは `develop`。PR は `develop` 向けに作成する。
- 変更は作業用ブランチにコミットし、そのブランチを push してから `gh pr create` で PR を作成する。
- pre-commit で `lint-staged` と `build` が走る。コミット前に `mise run check` や `pnpm turbo run build` で確認しておく。

## ワークフロー

### 1. 作業ブランチを作成

```bash
git checkout develop
git pull origin develop
git checkout -b feature/<短い説明をスラッグで>
```

例: `feature/dynamodb-to-postgresql`、`fix/login-validation`

### 2. 変更をステージング・コミット

```bash
git add .
git status   # 必要なら確認
git commit -m "feat: 変更の概要（日本語で1行）"
```

コミットメッセージは `feat:`, `fix:`, `chore:` などの prefix を推奨。pre-commit で lint-staged と build が実行される。

### 3. リモートに push

```bash
git push -u origin feature/<ブランチ名>
```

### 4. PR を作成（GitHub CLI）

```bash
gh pr create --base develop --head feature/<ブランチ名> --title "タイトル（例: feat: 〇〇を追加）" --body "## 概要
（変更内容の説明）

## 主な変更
- 項目1
- 項目2"
```

`--body` が長い場合は `--body-file` でファイル指定も可能。

```bash
gh pr create --base develop --head feature/<ブランチ名> --title "タイトル" --body-file .github/pr-body.md
```

## 一連のコマンド例

ブランチ名を `feature/my-change`、コミットメッセージを `feat: 〇〇を実装`、PR タイトルを同じにする場合:

```bash
git checkout develop && git pull origin develop
git checkout -b feature/my-change
git add .
git commit -m "feat: 〇〇を実装"
git push -u origin feature/my-change
gh pr create --base develop --head feature/my-change --title "feat: 〇〇を実装" --body "## 概要\n（説明を記載）"
```

## 注意

- **GitHub CLI**: `gh pr create` を使うには [GitHub CLI](https://cli.github.com/) のインストールと `gh auth login` での認証が必要。
- **コンフリクト**: push 前に `git pull origin develop --rebase` で最新化すると安全。
- **既にコミット済み**: 変更がすでにコミットされている場合は、ステップ 1 でブランチ作成だけ行い、2 は飛ばして 3 から実行する。
