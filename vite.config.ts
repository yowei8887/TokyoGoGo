
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數 (包含 .env 檔案中的設定)
  // 第三個參數 '' 表示載入所有環境變數，不限於 VITE_ 開頭
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // GitHub Pages 部署需要相對路徑
    base: './',
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    // 重要：這裡定義全域常數替換
    define: {
      // 讓前端程式碼中的 process.env.API_KEY 被替換成實際的金鑰字串
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY)
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    }
  }
})
