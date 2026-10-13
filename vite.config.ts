import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import glsl from 'vite-plugin-glsl';
import { visualizer } from 'rollup-plugin-visualizer';
import { publicManifest } from './build/public-manifest.ts';
import { fontPreloadPlugin, seoPlugin } from './build/html-plugins.ts';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages : BASE_PATH=/nom-du-repo/ npm run build (voir README)
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    glsl({ minify: mode !== 'development', warnDuplicatedImports: false }),
    publicManifest(),
    seoPlugin(),
    fontPreloadPlugin(),
    mode === 'analyze' &&
      (visualizer({ filename: 'dist/stats.html', gzipSize: true, open: false }) as PluginOption),
  ],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1400,
  },
}));
