import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        // يجب استبدال هذا بعنوان URL الخاص بـ Supabase Functions
        // عادة يكون هو العنوان المحلي (localhost) مع المنفذ الافتراضي.
        // يمكن العثور على هذا العنوان عند تشغيل supabase start
        target: 'http://localhost:54321/functions/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});