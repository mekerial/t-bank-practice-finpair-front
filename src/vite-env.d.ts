/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_SIMULATE_PAGE_ERROR?: string
  readonly VITE_SIMULATE_AUTH_ERROR?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
