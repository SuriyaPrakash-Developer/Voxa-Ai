/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_KEY?: string;
    // more env variables can be defined here
    [key: string]: unknown;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
