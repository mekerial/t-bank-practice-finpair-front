/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** Если true, загрузчики страниц с моками завершаются ошибкой (для проверки UI). */
  readonly VITE_SIMULATE_PAGE_ERROR?: string
  /** Если true, мок-запросы входа и регистрации завершаются ошибкой. */
  readonly VITE_SIMULATE_AUTH_ERROR?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
