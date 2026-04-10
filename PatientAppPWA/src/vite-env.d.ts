/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_VAPID_PUBLIC_KEY: string;
  readonly VITE_SESSION_TIMEOUT_MINUTES: string;
  readonly VITE_HOSPITAL_SUPPORT_PHONE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
