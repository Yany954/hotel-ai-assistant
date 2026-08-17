// Source - https://stackoverflow.com/a/78706043
// Posted by Menial Orchestra
// Retrieved 2026-07-29, License - CC BY-SA 4.0

/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_YOUR_URL: string;
  readonly VITE_REALM: string;
  readonly VITE_CLIENT_ID: string;
 
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
