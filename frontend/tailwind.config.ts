import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1e1b4b',
        'brand-light': '#312e81',
        'brand-bg': '#f8fafc',
        
        'risk-low': '#22c55e',
        'risk-moderate': '#eab308',
        'risk-high': '#f97316',
        'risk-critical': '#ef4444',
      },
    },
  },
  plugins: [],
}
export default config
