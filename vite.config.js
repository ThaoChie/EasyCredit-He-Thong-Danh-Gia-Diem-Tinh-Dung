import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,       // <--- 1. Cố định cổng 3000
    strictPort: true, // <--- 2. Nếu cổng 3000 bận, báo lỗi luôn chứ KHÔNG tự đổi sang số khác
  }
})
