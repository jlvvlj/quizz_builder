/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./quizzcard.tsx",
    "./kanjiapp.tsx"
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
      width: {
        120: '30rem',
        140: '35rem',
        160: '40rem'
      },
      height: {
        120: '30rem',
        140: '35rem',
        160: '40rem'
      },
  		colors: {
  			// Default Tailwind colors
  			blue: {
  				600: '#2563eb',
  			},
  			pink: {
  				600: '#db2777',
  			},
  			// HSL variables
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			'char-pop': {
  				'0%':   { transform: 'scale(0.4) translateY(14px)', opacity: '0' },
  				'55%':  { transform: 'scale(1.18) translateY(0)', opacity: '1' },
  				'100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
  			},
  			'kana-bounce': {
  				'0%':   { transform: 'translateY(0)' },
  				'35%':  { transform: 'translateY(8px)' },
  				'70%':  { transform: 'translateY(-2px)' },
  				'100%': { transform: 'translateY(0)' },
  			},
  			'char-shake': {
  				'0%, 100%': { transform: 'translateX(0)' },
  				'20%': { transform: 'translateX(-7px)' },
  				'40%': { transform: 'translateX(6px)' },
  				'60%': { transform: 'translateX(-4px)' },
  				'80%': { transform: 'translateX(3px)' },
  			},
  			'underline-pulse': {
  				'0%':   { transform: 'scaleY(1) scaleX(1)', filter: 'brightness(1)' },
  				'45%':  { transform: 'scaleY(2.6) scaleX(1.18)', filter: 'brightness(1.7)' },
  				'100%': { transform: 'scaleY(1) scaleX(1)', filter: 'brightness(1)' },
  			},
  			'underline-glow': {
  				'0%, 100%': { boxShadow: '0 0 0 0 rgba(255,0,84,0)' },
  				'50%':      { boxShadow: '0 0 14px 2px rgba(255,0,84,0.55)' },
  			},
  			'success-flash': {
  				'0%':   { transform: 'scale(1)', filter: 'brightness(1) saturate(1)' },
  				'40%':  { transform: 'scale(1.06)', filter: 'brightness(1.4) saturate(1.4)' },
  				'100%': { transform: 'scale(1)', filter: 'brightness(1) saturate(1)' },
  			},
  			// Quiz start / end transition screens
  			'overlay-in': {
  				'0%':   { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			'overlay-out': {
  				'0%':   { opacity: '1' },
  				'100%': { opacity: '0' },
  			},
  			'pop-in': {
  				'0%':   { transform: 'scale(0.7)', opacity: '0' },
  				'60%':  { transform: 'scale(1.06)', opacity: '1' },
  				'100%': { transform: 'scale(1)', opacity: '1' },
  			},
  			'rise-in': {
  				'0%':   { transform: 'translateY(24px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' },
  			},
  			'float-y': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%':      { transform: 'translateY(-12px)' },
  			},
  			'sheen': {
  				'0%':   { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' },
  			},
  			'ring-glow': {
  				'0%, 100%': { filter: 'drop-shadow(0 0 4px rgba(255,0,84,0.35))' },
  				'50%':      { filter: 'drop-shadow(0 0 18px rgba(255,0,84,0.8))' },
  			},
  			'star-pop': {
  				'0%':   { transform: 'scale(0) rotate(-30deg)', opacity: '0' },
  				'70%':  { transform: 'scale(1.25) rotate(6deg)', opacity: '1' },
  				'100%': { transform: 'scale(1) rotate(0)', opacity: '1' },
  			},
  		},
  		animation: {
  			'char-pop':        'char-pop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  			'kana-bounce':     'kana-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'char-shake':      'char-shake 0.35s ease-in-out',
  			'underline-pulse': 'underline-pulse 0.45s ease-out',
  			'underline-glow':  'underline-glow 1.4s ease-in-out infinite',
  			'success-flash':   'success-flash 0.55s ease-out',
  			'overlay-in':      'overlay-in 0.35s ease-out forwards',
  			'overlay-out':     'overlay-out 0.4s ease-in forwards',
  			'pop-in':          'pop-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  			'rise-in':         'rise-in 0.5s ease-out forwards',
  			'float-y':         'float-y 3.5s ease-in-out infinite',
  			'sheen':           'sheen 2.8s linear infinite',
  			'ring-glow':       'ring-glow 2.2s ease-in-out infinite',
  			'star-pop':        'star-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}