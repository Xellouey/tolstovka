import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#ffc81a',
        brandText: '#383b3d'
      }
    },
  },
  plugins: [],
}
export default config