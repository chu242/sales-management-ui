/// <reference types="vite/client" />

// Type-checks the environment variables used in src/config.ts.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
