import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    
    exclude: [
        'react-icons/ti',
        'react-icons/fa',
        'react-icons/md',
        'react-icons/bi',
        'react-icons/fi',
        'react-icons/io5',
        'browser-image-compression',
        'socket.io-client',
        'lucide-react',
    ],
  },
})





  
