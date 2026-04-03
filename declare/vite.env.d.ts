export interface ImportMetaEnv {
  readonly VITE_REQUEST_BASE_URL: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}