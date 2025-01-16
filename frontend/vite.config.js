import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // 明确指定环境变量目录
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
    envDir, // 明确指定环境变量目录
    envPrefix: 'VITE_', // 明确指定环境变量前缀
  }
})
