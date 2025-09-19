import { defineConfig, presetUno, presetTypography, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetTypography()
  ],
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      // TOLSTOVKA brand colors
      brand: {
        primary: '#ffc81a',    // желтый фон
        dark: '#383b3d',       // основной/текст
        white: '#ffffff',      // белый
        muted: '#e8e8e8',
        accent: '#ffc81a'      // акцент тоже желтый
      },
      // Telegram theme colors (will be overridden by CSS variables)
      tg: {
        bg: 'var(--tg-bg-color, #ffffff)',
        text: 'var(--tg-text-color, #000000)',
        hint: 'var(--tg-hint-color, #999999)',
        link: 'var(--tg-link-color, #3390ec)',
        button: 'var(--tg-button-color, #3390ec)',
        buttonText: 'var(--tg-button-text-color, #ffffff)'
      }
    },
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      display: ['Inter', 'system-ui', 'sans-serif']
    },
    fontSize: {
      'xs': ['0.75rem', '1rem'],
      'sm': ['0.875rem', '1.25rem'],
      'base': ['1rem', '1.5rem'],
      'lg': ['1.125rem', '1.75rem'],
      'xl': ['1.25rem', '1.875rem'],
      '2xl': ['1.5rem', '2rem'],
      '3xl': ['1.875rem', '2.25rem'],
      '4xl': ['2.25rem', '2.75rem']
    },
    spacing: {
      'safe-top': 'env(safe-area-inset-top)',
      'safe-bottom': 'env(safe-area-inset-bottom)',
      'safe-left': 'env(safe-area-inset-left)',
      'safe-right': 'env(safe-area-inset-right)'
    },
    aspectRatio: {
      'banner': '12/5',      // баннеры 12:5
      'product': '3/4',      // карточки товаров 3:4  
      'square': '1/1'
    },
    animation: {
      'fade-in': 'fade-in 0.3s ease-out',
      'slide-up': 'slide-up 0.3s ease-out',
      'skeleton': 'skeleton 1s ease-in-out infinite alternate'
    },
    keyframes: {
      'fade-in': {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' }
      },
      'slide-up': {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' }
      },
      'skeleton': {
        '0%': { opacity: '0.4' },
        '100%': { opacity: '1' }
      }
    }
  },
  shortcuts: {
    // Layout shortcuts
    'container-safe': 'mx-auto px-4 max-w-7xl',
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    
    // Button variants
    'btn-base': 'px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95',
    'btn-primary': 'btn-base bg-brand-primary text-brand-dark hover:bg-yellow-400',
    'btn-secondary': 'btn-base border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white',
    'btn-ghost': 'btn-base hover:bg-gray-100',
    
    // Card styles
    'card-base': 'bg-white rounded-2xl shadow-sm border border-gray-100',
    'card-hover': 'card-base hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
    
    // Product card
    'product-card': 'card-hover overflow-hidden aspect-[3/4]',
    'product-image': 'w-full h-full object-cover',
    
    // Skeleton loading
    'skeleton-base': 'bg-gray-200 animate-pulse rounded',
    
    // Telegram safe area
    'safe-area': 'pb-safe-bottom pt-safe-top pl-safe-left pr-safe-right'
  },
  rules: [
    // Custom backdrop blur
    ['backdrop-blur-telegram', { 'backdrop-filter': 'blur(20px)' }],
    
    // Telegram-specific rules
    ['tg-safe-area', {
      'padding-top': 'var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0))',
      'padding-bottom': 'var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0))'
    }],
    
    // Touch optimization
    ['touch-none', { 'touch-action': 'none' }],
    ['touch-pan-x', { 'touch-action': 'pan-x' }],
    ['touch-pan-y', { 'touch-action': 'pan-y' }],
    
    // Scrollbar hiding
    ['scrollbar-hide', {
      'scrollbar-width': 'none',
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    }]
  ]
})