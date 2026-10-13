/// <reference types="vite/client" />

declare module 'virtual:public-manifest' {
  /** Liste des fichiers présents dans /public (chemins relatifs, ex : "projects/projet-1/cover.webp"). */
  const files: string[];
  export default files;
}

interface ImportMetaEnv {
  readonly VITE_WEB3FORMS_KEY?: string;
  readonly VITE_FORMSPREE_ID?: string;
}
