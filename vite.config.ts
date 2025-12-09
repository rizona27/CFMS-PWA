import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'CFMS · 一基暴富',
        short_name: '一基暴富',  // 改为中文短名
        description: '基金客户管理系统',
        theme_color: '#4facfe',  // 与 index.html 保持一致
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',  // 修改路径
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',  // 修改路径
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      // 添加 workbox 配置
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      // 添加 devOptions 配置
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@views': path.resolve(__dirname, './src/views'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@router': path.resolve(__dirname, './src/router'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    base: './',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 将 node_modules 中的代码打包到 vendor
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          // 将 dataStore 相关代码打包到单独的文件
          if (id.includes('dataStore')) {
            return 'dataStore'
          }
          // 将 authStore 相关代码打包到单独的文件
          if (id.includes('authStore')) {
            return 'authStore'
          }
          // 将 views 相关代码分组
          if (id.includes('src/views')) {
            const viewName = id.split('/').pop()?.split('.')[0]
            if (viewName && viewName !== 'index') {
              return `view-${viewName}`
            }
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // 增加警告限制
    chunkSizeWarningLimit: 1500,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 优化构建输出
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8315',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('代理错误:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('代理请求:', req.method, req.url)
          })
        }
      }
    },
    // 添加 hmr 配置
    hmr: {
      overlay: true
    }
  },
  // 添加 CSS 预处理器配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/assets/styles/variables.scss";`
      }
    }
  },
  // 添加 optimizeDeps 配置
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: ['vue-demi']
  }
}))
