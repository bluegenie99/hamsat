import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // تأكد من أن المتغيرات البيئية متاحة للعميل
      'process.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // إعدادات الخادم المحلي فقط (لن تؤثر على Vercel)
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: ['.ngrok-free.app'],
    },
    // إضافة إعدادات البناء لـ Vercel
    build: {
      outDir: 'dist',
      sourcemap: true,
      // تحسين الأداء
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
  };
});
