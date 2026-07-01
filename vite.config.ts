import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // When DISABLE_HMR is true, keep HMR/file watching off to reduce edit-time flicker.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching together with HMR to reduce CPU overhead during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
