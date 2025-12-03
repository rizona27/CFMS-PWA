import { fileURLToPath, URL } from 'node:url' // 引入 URL 模块
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 1. 设置资源基础路径为相对路径，解决本地双击 index.html 无法加载资源的问题
  base: './', 
  
  plugins: [vue()],
  
  // 2. 确保配置了别名解析，用于处理项目中 @/ 的导入
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
  server: {
    host: true,
    port: 5173
  }
})