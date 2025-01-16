import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname)
  const env = loadEnv(mode, envDir, 'VITE_')
  
  console.log('Environment Variables Loading from:', envDir)
  console.log('Environment Variables Loaded:', {
    VITE_BACKEND_URL: env.VITE_BACKEND_URL,
    VITE_API_ENDPOINT: env.VITE_API_ENDPOINT
  })

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
    },
    build: {
      assetsDir: 'static',
    },
    // 修改静态资源配置
    publicDir: path.resolve(__dirname, 'public'),
    base: '/', // 确保基础路径配置正确
    envDir,
    envPrefix: 'VITE_',
  }
})
