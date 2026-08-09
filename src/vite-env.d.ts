/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPRAMONO_API_URL: string;
  readonly VITE_SUPRAMONO_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
