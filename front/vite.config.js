import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Permet d'utiliser import.meta.env.VITE_API_URL dans le code
    // Valeur par défaut : http://localhost:5000/api (dev local)
  },
})
