import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 設定為相對路徑，這樣部署到 GitHub Pages (https://user.github.io/repo/) 才能找到檔案
  base: './',
  build: {
    outDir: 'dist',
  }
})