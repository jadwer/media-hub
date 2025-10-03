import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './js'),
      '@api': resolve(__dirname, './js/api'),
      '@ui': resolve(__dirname, './js/ui'),
      '@utils': resolve(__dirname, './js/utils'),
    }
  }
});
