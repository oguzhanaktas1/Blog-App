// blog-frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Docker ortamında dış erişim için genellikle gerekli
    port: 5173,
    proxy: {
      // /api ile başlayan tüm istekleri backend servisine yönlendir
      '/api': {
        // Hedef adres, docker-compose.yml'deki backend servisinin adı ve portu
        target: 'http://backend:3000', // <-- Burası değişmeli!
        changeOrigin: true, // Host başlığını değiştirmeyi sağlar
        // rewrite: (path) => path.replace(/^\/api/, ''), // Eğer backend'iniz "/api" öneki beklemiyorsa bu satırı açabilirsiniz
      },
    },
    watch: {
      // Bazı Docker ortamlarında (özellikle WSL2) dosya değişikliklerini algılamak için
      usePolling: true
    }
  },
});