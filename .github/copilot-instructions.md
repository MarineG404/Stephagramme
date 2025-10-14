## Quick context

- Project: Stephagramme — an Expo (managed) React Native app (TypeScript) that finds anagrams for Scrabble-like input. Key UI lives in `app/(tabs)/index.tsx`. Utilities live in `utils/` (notably `anagrammes.ts` and `def.ts`).

## Big-picture architecture

- Frontend: Expo + React Native + `expo-router` (see `app/`). Routes use typed routes (see `tsconfig.json` → `typedRoutes`).
- Data: local JSON dictionaries under `assets/` (e.g. `ods6.json`, `ods6_indexed_flat.json`) imported at runtime. Do NOT use Node `fs` in app code — import JSON directly and enable `resolveJsonModule` in `tsconfig.json`.
- Utilities: `utils/anagrammes.ts` contains the anagram search logic (permutations, joker handling). `utils/def.ts` fetches definitions from Wiktionary.

## Key files to inspect

- `package.json` — scripts and dependencies (expo SDK, RN version). Use `npm ci` and `npx expo start` for dev.
- `app.json` — Expo configuration (icon, splash, `newArchEnabled` is set to `false` in this repo to avoid Android new-arch compile issues).
- `eas.json` — EAS build profiles (`apk`, `production`).
- `tsconfig.json` — path mappings (`@/*`) and `resolveJsonModule` (required to import JSON assets).
- `.github/workflows/build-apk.yml` — CI workflow: runs on `push` of `v*` tags or manual `workflow_dispatch`. It runs `npx expo prebuild --platform android --clean` then `./gradlew assembleRelease` and uploads APK.

## Developer workflows (commands)

- Local dev: `npm install` → `npx expo start` (open in Expo Go or emulator).
- Local Android release (matching CI):
  - `npx expo prebuild --platform android --clean`
  - `cd android && ./gradlew assembleRelease`
- EAS cloud build: `eas build --platform android --profile apk` (requires `EXPO_TOKEN` / EAS projectId in `app.json.extra.eas.projectId`).
- CI trigger: push an annotated tag like `v1.0.0` (or run workflow manually in Actions tab).

## Project-specific conventions & gotchas

- JSON imports: Metro (Expo) does not support `import ... assert { type: 'json' }`. Import JSON with `import dict from '@/assets/ods6.json'` and ensure `resolveJsonModule: true` in `tsconfig.json`.
- No Node stdlib on device: remove `fs`/`path` usage from code that runs in the app. Use asset imports or network fetches for mobile.
- Anagram performance: `utils/anagrammes.ts` does heavy combinatorics. Look for caching and limits (max jokers) to avoid explosion. The functions often expect uppercase letters — normalize input (e.g. `.toUpperCase()` or `.toLowerCase()` depending on utility) before calling.
- Joker handling: `?` is used to indicate wildcard letters. The implementation generates letter combinations — cap jokers (e.g. max 2) if performance becomes an issue.
- Audio lib: project currently uses `expo-av` (deprecated warning exists). Keep `expo-av` for now; migrating to `expo-audio`/`expo-video` is optional but requires API changes.
- Android new architecture: this repo disables `newArchEnabled` in `app.json` because enabling it without proper Android prebuild configuration causes Kotlin compile errors in CI (missing `ReactNativeApplicationEntryPoint`).

## CI / Release notes for agents

- Workflow path: `.github/workflows/build-apk.yml` — ensure workflow file is present on the default branch (Actions won't run if missing).
- Secrets required for EAS: `EXPO_TOKEN` (if you switch to EAS CLI in CI). For the current Gradle workflow, no Expo token is needed but Android SDK/Java are set up in the workflow.
- If CI Kotlin compile fails, first verify `newArchEnabled` in `app.json` (set to `false`), otherwise run `npx expo prebuild` locally to verify generated android files.

## Small examples for common tasks

- Run dev: `npm ci && npx expo start`
- Build (CI-like): `npm ci && npx expo prebuild --platform android --clean && cd android && ./gradlew assembleRelease`
- Run anagram util locally (node): `ts-node utils/convertTxtToJson.ts` or run compiled JS. Note: `package.json` sets `type: module`; prefer `ts-node` with ESM flags or compile with `tsc`.

## Where to look first when debugging

- UI/layout issues: `app/(tabs)/index.tsx`, `components/themed/*` and `ui/*` for icons/TabBar.
- Dictionary/anagram logic: `utils/anagrammes.ts`, `utils/ods6_indexed_flat.json` (index structure) and `utils/ods6.json`.
- Definitions API: `utils/def.ts` — watch for network errors and `toLowerCase()` usage for Wiktionary endpoints.
- CI failures: check `.github/workflows/build-apk.yml` logs, then `android/` build logs (use `./gradlew assembleRelease --stacktrace` locally).

If anything is unclear or you want this shortened/expanded for particular agent roles (code writer, CI fixer, performance tuner), tell me which role and I'll iterate.
