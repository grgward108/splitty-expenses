# Adding a New Package or App

## New Shared Package (`packages/`)

1. Create directory: `packages/<name>/`

2. **`package.json`** — follow existing conventions:
   ```json
   {
     "name": "@repo/<name>",
     "version": "0.0.0",
     "private": true,
     "type": "module",
     "exports": {
       ".": {
         "types": "./src/index.ts",
         "default": "./dist/index.js"
       }
     },
     "scripts": {
       "build": "tsup src/index.ts --format esm --dts",
       "dev": "tsup src/index.ts --format esm --dts --watch"
     },
     "devDependencies": {
       "tsup": "^8.0.0",
       "typescript": "^5.7.0"
     }
   }
   ```

3. **`tsconfig.json`** — extend root:
   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src"
     },
     "include": ["src"]
   }
   ```

4. **`src/index.ts`** — barrel export

5. **Register in turbo.json** if it has custom tasks

6. **Run** `pnpm install` from root to link workspace

7. **Consume** in other packages: add `"@repo/<name>": "workspace:*"` to their `package.json`

## New App (`apps/`)

Same as above but:
- Use Vite for web apps (`@vitejs/plugin-react`)
- Use Hono for API apps
- Add a `dev` script with the appropriate port
- Add wrangler.toml if deploying to Cloudflare
- Wire up in `.mise.toml` if you want mise task shortcuts

## Adding to an Existing Package

When adding functionality to an existing package:
1. Check if the export map in `package.json` needs a new entry path
2. Re-export from `src/index.ts` (or add a new export path)
3. If adding a new dependency, install at the package level: `pnpm --filter @repo/<name> add <dep>`

## Dependency Rules

- `packages/core` must have **zero external dependencies** (pure domain logic)
- `packages/infrastructure` depends on `packages/core` (implements its interfaces)
- `packages/spec` has **no internal dependencies** (it's the contract source of truth)
- `apps/*` depend on packages but never on other apps
- `packages/ui` depends on `packages/tailwind-config`
