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
        primary: '#ffc81a',    // желтый акцент
        dark: '#383b3d',       // основной/текст (темно-серый)
        white: '#ffffff',      // белый
        muted: '#e8e8e8',
        accent: '#ffc81a',     // акцент тоже желтый
        black: '#0a0a0a'       // почти черный для контраста (streetwear)
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
      // TOLSTOVKA Typography System - Единый фирменный шрифт Muller
      'primary': ['Muller', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      'display': ['Muller', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      'accent': ['Muller', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      // Fallbacks
      'sans': ['Muller', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      'mono': ['Menlo', 'Monaco', 'Consolas', 'monospace']
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
      'safe-right': 'env(safe-area-inset-right)',
      // Telegram safe area insets
      'tg-safe-top': 'var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0))',
      'tg-safe-bottom': 'var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0))',
      'tg-safe-left': 'var(--tg-safe-area-inset-left, env(safe-area-inset-left, 0))',
      'tg-safe-right': 'var(--tg-safe-area-inset-right, env(safe-area-inset-right, 0))'
    },
    aspectRatio: {
      'banner': '16/9',      // баннеры 16:9, чтобы логотип полностью помещался
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
    
    // Button variants (streetwear: жирнее, контрастнее)
    'btn-base': 'px-4 py-2 rounded-xl font-semibold uppercase tracking-wide transition-all duration-200 active:scale-95',
    'btn-primary': 'btn-base bg-brand-primary text-brand-dark border-2 border-black/80 shadow-[0_2px_0_#000] hover:shadow-[0_4px_0_#000] hover:-translate-y-0.5',
    'btn-secondary': 'btn-base bg-brand-dark text-white border-2 border-black hover:bg-black',
    'btn-ghost': 'btn-base bg-transparent text-brand-dark hover:bg-brand-primary/10',

    // Filter chip buttons (streetwear)
    'chip': 'inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-semibold uppercase tracking-wide transition-colors duration-200 focus:(outline-none ring-2 ring-brand-primary/30) active:scale-95',
    'chip-active': 'bg-brand-primary text-brand-dark border-black shadow-[0_2px_0_#000]',
    'chip-inactive': 'bg-white text-brand-dark border-brand-dark/30 hover:(border-brand-dark bg-brand-primary/10)',
    
    // Card styles (чёткие бордеры)
    'card-base': 'bg-white rounded-2xl border-2 border-black/10 shadow-sm',
    'card-hover': 'card-base hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
    
    // Product card (квадратнее, плотнее)
    'product-card': 'card-hover overflow-hidden aspect-[1/1]',
    'product-image': 'w-full h-full object-cover',
    
    // Badges
    'badge': 'inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide',
    'badge-new': 'badge bg-brand-primary text-brand-dark border border-black/20',

    // Skeleton loading
    'skeleton-base': 'bg-gray-300 animate-pulse rounded',
    
    // Telegram safe area (обновленные с поддержкой Telegram safe area insets)
    'safe-area': 'pb-safe-bottom pt-safe-top pl-safe-left pr-safe-right',
    'tg-safe-area': 'pb-tg-safe-bottom pt-tg-safe-top pl-tg-safe-left pr-tg-safe-right',
    
    // TOLSTOVKA Typography Shortcuts
    'text-brand-primary': 'font-primary text-brand-dark',
    'text-brand-display': 'font-display text-brand-dark font-medium',
    'text-brand-accent': 'font-accent text-brand-dark font-bold uppercase tracking-wider',
    'text-brand-price': 'font-primary text-brand-primary font-bold tabular-nums text-xl',
    
    // Product card typography
    'product-title': 'font-display text-base font-medium text-white leading-tight',
    'product-price': 'font-primary text-xl font-bold text-brand-primary tabular-nums',
    'product-category': 'font-primary text-sm text-gray-300 uppercase tracking-wide',
    
    // UI element typography
    'button-text': 'font-primary font-bold uppercase tracking-wider',
    'section-header': 'font-display text-lg font-medium text-brand-dark uppercase tracking-wider',
    'admin-title': 'font-accent text-2xl font-bold text-brand-dark uppercase tracking-wide',
    
    // Responsive typography
    'heading-mobile': 'font-display text-2xl font-medium leading-tight',
    'heading-large': 'font-display text-3xl font-medium leading-tight',
    'body-mobile': 'font-primary text-base leading-relaxed',
    'caption-mobile': 'font-primary text-sm leading-normal'
  },
  rules: [
    // Custom scale values
    ['scale-102', { transform: 'scale(1.02)' }],
    
    // Custom backdrop blur
    ['backdrop-blur-telegram', { 'backdrop-filter': 'blur(20px)' }],
    
    // Telegram-specific rules
    ['tg-safe-area', {
      'padding-top': 'var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0))',
      'padding-bottom': 'var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0))',
      'padding-left': 'var(--tg-safe-area-inset-left, env(safe-area-inset-left, 0))',
      'padding-right': 'var(--tg-safe-area-inset-right, env(safe-area-inset-right, 0))'
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
