import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom'
  },
  resolve: {
    alias: {
      '@api': '/js/api',
      '@ui': '/js/ui'
    }
  }
});
