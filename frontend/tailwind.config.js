const config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                // Existing brand colors
                brand: {
                    black: '#0a0a0a',
                    orange: '#FF5722',
                    'orange-hover': '#F4511E',
                    gray: '#F5F5F7',
                },
                // Prep0 Ultra Theme
                prep: {
                    dark: '#050A18',        // Deep Tech Blue Background
                    card: '#0A1124',        // Glass Card Background
                    primary: '#4361EE',     // Neon Indigo
                    secondary: '#7209B7',   // AI Purple
                    accent: '#4CC9F0',      // Cyan Glow
                    success: '#00F5D4',     // Neon Green
                    warning: '#F72585',     // Hot Pink/Warning
                }
            },
            backgroundImage: {
                'prep-gradient': 'linear-gradient(135deg, #050A18 0%, #0A1124 100%)',
                'glass-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
            },
            fontFamily: {
                "sans": ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
            },
            borderRadius: {
                "2xl": "1rem",
                "3xl": "1.5rem",
            },
            boxShadow: {
                "subtle": "0 2px 10px rgba(0, 0, 0, 0.05)",
                "premium": "0 20px 40px -10px rgba(0, 0, 0, 0.05)",
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'neon': '0 0 10px rgba(67, 97, 238, 0.5), 0 0 20px rgba(67, 97, 238, 0.3)',
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fadeIn 0.5s ease-out forwards",
                "slide-up": "slideUp 0.5s ease-out forwards",
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "float": "float 6s ease-in-out infinite",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
        },
    },
    plugins: [],
};
export default config;
