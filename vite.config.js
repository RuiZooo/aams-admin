import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 自动导入
import AutoImport from 'unplugin-auto-import/vite'

// 组件自动导入（Element Plus + 自定义组件）
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// 路径别名支持
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),

    // 自动导入 Vue API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: false
    }),

    // 自动导入组件
    Components({
      resolvers: [ElementPlusResolver()],
      dts: false
    })
  ],

  server: {
      host: '192.168.1.219',
      port: 8089,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:7001',
          changeOrigin: true,
        }
      }
    },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`
      }
    }
  }
})
