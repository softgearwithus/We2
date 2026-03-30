const config = {
    darkMode: ["class"],
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
    	extend: {
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		backgroundImage: {
    			'prep-gradient': 'linear-gradient(135deg, #050A18 0%, #0A1124 100%)',
    			'glass-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)'
    		},
    		fontFamily: {
    			sans: [
    				'var(--font-sans)',
    				'Plus Jakarta Sans',
    				'-apple-system',
    				'BlinkMacSystemFont',
    				'Segoe UI',
    				'Roboto',
    				'Helvetica',
    				'Arial',
    				'sans-serif'
    			],
    			display: [
    				'var(--font-sans)',
    				'sans-serif'
    			],
    			mono: [
    				'var(--font-mono)',
    				'monospace'
    			]
    		},
    		borderRadius: {
    			'2xl': '1rem',
    			'3xl': '1.5rem'
    		},
    		boxShadow: {
    			subtle: '0 4px 20px rgba(0, 0, 0, 0.08)',
    			premium: '0 24px 48px -12px rgba(0, 0, 0, 0.15)',
    			glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    			neon: '0 0 10px rgba(67, 97, 238, 0.5), 0 0 20px rgba(67, 97, 238, 0.3)'
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'fade-in': 'fadeIn 0.5s ease-out forwards',
    			'slide-up': 'slideUp 0.5s ease-out forwards',
    			'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    			float: 'float 6s ease-in-out infinite'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			fadeIn: {
    				'0%': {
    					opacity: '0'
    				},
    				'100%': {
    					opacity: '1'
    				}
    			},
    			slideUp: {
    				'0%': {
    					transform: 'translateY(20px)',
    					opacity: '0'
    				},
    				'100%': {
    					transform: 'translateY(0)',
    					opacity: '1'
    				}
    			},
    			float: {
    				'0%, 100%': {
    					transform: 'translateY(0)'
    				},
    				'50%': {
    					transform: 'translateY(-10px)'
    				}
    			}
    		}
    	}
    },
    plugins: [],
};
export default config;
