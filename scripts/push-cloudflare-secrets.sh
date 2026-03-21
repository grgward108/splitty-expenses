#!/usr/bin/env bash

# Cloudflare Worker のシークレットを、現在のシェル環境（mise が読み込んだ値）から一括登録する。
#
# 登録対象（空の変数は JSON から除外され、既存の Worker シークレットは上書きされません）:
#   DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL,
#   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
#
# ここに含めないもの（別経路）:
#   CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID … wrangler の認証用（mise / GitHub Secrets）
#   HYPERDRIVE_ID … wrangler.toml の [[env.*.hyperdrive]] の id

set -e

ENV=$1

if [ -z "$ENV" ]; then
  echo "Error: Environment not specified."
  echo "Usage: $0 <staging|production>"
  exit 1
fi

echo "Pushing secrets to $ENV from current environment variables..."

# jq で JSON を組み立て、値が空のキーは送らない（誤って空で上書きしない）
SECRETS_JSON=$(jq -n \
  --arg db "${DATABASE_URL:-}" \
  --arg auth "${BETTER_AUTH_SECRET:-}" \
  --arg ba "${BETTER_AUTH_URL:-}" \
  --arg g_id "${GOOGLE_CLIENT_ID:-}" \
  --arg g_sec "${GOOGLE_CLIENT_SECRET:-}" \
  '{
    DATABASE_URL: $db,
    BETTER_AUTH_SECRET: $auth,
    BETTER_AUTH_URL: $ba,
    GOOGLE_CLIENT_ID: $g_id,
    GOOGLE_CLIENT_SECRET: $g_sec
  } | with_entries(select(.value != ""))')

if [ "$(echo "$SECRETS_JSON" | jq 'length')" -eq 0 ]; then
  echo "Error: No secrets to push (all selected env vars are empty)."
  echo "Set at least one of: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
  exit 1
fi

cd apps/api

# 標準入力からJSONを渡して一括登録
echo "$SECRETS_JSON" | pnpm wrangler secret bulk --env "$ENV"

echo "Done."