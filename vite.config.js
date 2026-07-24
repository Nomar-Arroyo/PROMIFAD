import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Define el puerto local de desarrollo
    open: true  // Abre el navegador automáticamente al correr 'npm run dev'
  }
})