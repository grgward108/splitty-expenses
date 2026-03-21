# @repo/email — AGENTS.md

このパッケージは **トランザクションメール**（Resend + React Email）を担当します。

## 役割

- Resend API クライアントの生成（`createEmailClient`）
- React Email テンプレートの HTML 化と送信（`sendEmail`）
- 共通レイアウト・メールテンプレートの定義

## ディレクトリ構成

```
src/
├── client.ts              # Resend クライアントのファクトリ
├── send.ts                # 汎用送信ヘルパー
├── render-test-welcome.tsx # `renderTestWelcomeEmail` — API 向けに Welcome テンプレの React 要素を組み立て
├── templates/
│   ├── components/        # レイアウト等の部品
│   └── *.tsx              # メール別テンプレート
└── index.ts               # 公開 API
```

## ルール・慣習

- **依存**: `resend`, `@react-email/components`。`react` は peer（呼び出し側と揃える）。
- **API**: アプリからは `@repo/email` の export のみ利用する。API キーは環境変数 `RESEND_API_KEY`（Workers ではシークレット）。
- **テンプレート**: `@react-email/components` のプリミティブを使い、共通枠は `templates/components/layout.tsx` に寄せる。
- **ドメイン**: ドメインロジックは `@repo/core` に置き、本パッケージは表示・送信のための薄い層に留める。

## このパッケージを編集するとき

- 新規テンプレートは `src/templates/` に追加し、`src/index.ts` から export する。
- 送信はハンドラ等で `createEmailClient` + `sendEmail` を組み合わせる（ミドルウェア化は必須ではない）。
