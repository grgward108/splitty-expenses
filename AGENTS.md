# Monorepo — AGENTS.md

このリポジトリは pnpm workspace のモノレポ。エージェントが特定のアプリやパッケージを編集するときは、**そのディレクトリ直下の `AGENTS.md`** を先に読む。

## 配置一覧

| 領域 | パス |
|------|------|
| Web アプリ | `apps/web/AGENTS.md` |
| API | `apps/api/AGENTS.md` |
| モバイル | `apps/mobile/AGENTS.md` |
| API ドキュメント（Scalar） | `apps/api-docs/AGENTS.md` |
| API 契約（TypeSpec / OpenAPI / 生成クライアント） | `packages/spec/AGENTS.md` |
| ドメイン | `packages/core/AGENTS.md` |
| インフラ・DB・認証の具体実装 | `packages/infrastructure/AGENTS.md` |
| UI ライブラリ | `packages/ui/AGENTS.md` |
| Tailwind 共有設定 | `packages/tailwind-config/AGENTS.md` |

## 新規機能（フルスタック）

API・Web・モバイルにまたがる新規機能では、**必ず** `.cursor/skills/feature-spec-fullstack/SKILL.md` の手順に従う（`docs/specs/` に機能仕様を書き、**ユーザーの明示承認のあと**に TypeSpec と実装へ進む）。
