# @repo/hp — AGENTS.md

このパッケージは **公開用ランディング / コーポレート HP** 向けの Web アプリです。`apps/web` と同様に **React + Vite + TanStack Router** の SPA で、`@repo/ui` と `@repo/tailwind-config` を利用します。

## 役割

- 認証や API 連携は持たない（必要になったら別途仕様に従って追加する）
- ルーティングは TanStack Router のファイルベース構成

## ディレクトリ構成

```
wrangler.toml          # Cloudflare Pages（name / pages_build_output_dir）
src/
├── contexts/
│   └── theme.tsx         # ダークモード（ThemeProvider / useTheme）
├── routes/
│   ├── __root.tsx        # ルートレイアウト
│   └── index.tsx         # "/" トップ（ルート直下の index はこのファイル名が安定）
├── styles/
│   └── globals.css
├── main.tsx
└── routeTree.gen.ts      # 自動生成（編集しない）
```

## ルール・慣習

- **UI**: `@repo/ui` のコンポーネントを使う
- **スタイル**: `globals.css` で `@repo/tailwind-config/base.css` を読み込み、`tailwind.config.js` でプリセットを参照する
- **ルート追加**: `src/routes/` 配下に `<path>/route.tsx` を追加する（トップ `/` のみ `index.tsx` を使用。`index/route.tsx` はルートジェネレータの不具合を避けるため使わない）。ロジック分離が必要なら `route.model.ts` を同階層に置く（`routeFileIgnorePattern` で `.model.` はルート生成から除外）
- **ルートツリー**: `routeTree.gen.ts` は Vite ビルド時に自動生成される。手で編集しない

## 開発

モノレポのルートから:

```bash
pnpm install
pnpm --filter @repo/hp dev
```

既定ポートは **5174**（`@repo/web` の 5173 と重複しないようにしている）。

単体ビルド（依存パッケージの `build` は Turbo が先に実行する）:

```bash
pnpm --filter @repo/hp build
```

モノレポルートで [mise](https://mise.jdx.dev/) を使う場合、ビルド＋ Pages デプロイは次の 1 本で実行できる（内部で `build:hp` のあと `pnpm --filter @repo/hp deploy`）:

```bash
mise run deploy-hp
```

## Cloudflare Pages でのホスティング

### `wrangler.toml`（API との違い）

- **`apps/api`**: Cloudflare **Workers** 向け。`main = "src/worker.ts"` や Hyperdrive・`[assets]` など、ランタイムとバインディングの定義に `wrangler.toml` が必須。
- **`apps/hp`**: Cloudflare **Pages** 向けの静的デプロイ。`wrangler pages deploy` だけなら設定ファイルなしでも可能だったが、**プロジェクト名（`name`）と成果物ディレクトリ（`pages_build_output_dir`）をリポジトリに固定する**ため [`wrangler.toml`](wrangler.toml) を置いている。Pages Functions やバインディングを足すときもこのファイルを拡張する。

### 前提

- Cloudflare アカウント
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/)（このパッケージの `devDependencies` に含まれる）

### 初回: Pages プロジェクト名

`wrangler.toml` の `name = "hp"` が Pages プロジェクト名として使われる。Cloudflare 側に同名がなければ、初回デプロイ時に作成を促されるか、[ダッシュボード](https://dash.cloudflare.com/)で Pages プロジェクトを作成してからデプロイする。

### ローカルからデプロイ（Wrangler CLI）

1. ログイン（初回のみ）:

   ```bash
   pnpm exec wrangler login
   ```

2. モノレポのルートで依存をビルドしたうえで HP をビルド:

   ```bash
   pnpm install
   pnpm exec turbo run build --filter=@repo/hp
   ```

3. 静的成果物をデプロイ:

   ```bash
   pnpm --filter @repo/hp deploy
   ```

   これは `apps/hp/dist` を `wrangler pages deploy` でアップロードする。

### SPA のフォールバック

`public/_redirects` に `/* /index.html 200` を置き、クライアントルート直叩きでも `index.html` が返るようにしている（Vite の `public/` はビルドで `dist/` にコピーされる）。

### Git 連携（Cloudflare Pages ダッシュボード）

リポジトリを接続する場合の例:

| 項目 | 値の例 |
|------|--------|
| ルートディレクトリ | （空）リポジトリルート |
| ビルドコマンド | `pnpm install && pnpm exec turbo run build --filter=@repo/hp` |
| ビルド出力ディレクトリ | `apps/hp/dist` |
| Node バージョン | リポジトリの `engines` に合わせる（例: 20） |

環境変数は現状必須ではない。追加した場合はダッシュボードの **Settings → Environment variables** で設定する。

## このパッケージを編集するとき

- 新規ページは `src/routes/<path>/route.tsx` を追加し、ビルドで `routeTree.gen.ts` を再生成させる
- デザイントークンや Tailwind の共通設定は `packages/tailwind-config`、コンポーネントは `packages/ui` 側を優先して変更する
