import type { Config } from 'tailwindcss';

export default {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class', // or 'media' to use system preference
    plugins: [],
    theme: {
        extend: {
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out forwards',
                'fade-slide-up': 'fadeSlideUp 0.5s ease-out forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scale-in': 'scaleIn 0.2s ease-out forwards',
                'slide-down': 'slideDown 0.3s ease-out forwards',
                'slide-right': 'slideRight 0.3s ease-out forwards',
            },
            boxShadow: {
                DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            },
            colors: {
                accent: '#ffffff',
                'accent-dark': '#1f2937', // gray-800
                'accent-dark-hover': '#2d3748', // equivalent to dark hover state
                'accent-hover': '#f9fafb', // gray-50
                content: '#1f2937', // gray-800
                'content-dark': '#e5e7eb', // gray-200
                // Light mode colors
                primary: '#3b82f6', // blue-500
                // Dark mode colors
                'primary-dark': '#3b82f6', // blue-500

                'primary-dark-disabled': '#1e40af', // blue-800
                'primary-dark-hover': '#60a5fa', // blue-400
                'primary-disabled': '#93c5fd', // blue-300
                'primary-hover': '#2563eb', // blue-600
                secondary: '#f3f4f6', // gray-100
                'secondary-dark': '#374151', // gray-700
                'secondary-dark-hover': '#4b5563', // gray-600
                'secondary-hover': '#e5e7eb', // gray-200
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeSlideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0)' },
                    '100%': { transform: 'scale(1)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideRight: {
                    '0%': { opacity: '0', transform: 'translateX(-10px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
            },
        },
    },
} satisfies Config;
