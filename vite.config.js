import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Performance optimizations
  build: {
    // Target modern browsers
    target: 'es2020',
    
    // Chunk splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            return 'vendor';
          }
        },
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 600,
    
    // Disable source maps for smaller build
    sourcemap: false,
    
    // CSS code splitting
    cssCodeSplit: true,
  },
  
  // Development server
  server: {
    hmr: {
      overlay: true,
    },
  },
  
  // Pre-bundle dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
  },
})
