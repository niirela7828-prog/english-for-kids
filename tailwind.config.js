/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { round: ['"Varela Round"', 'Rubik', 'system-ui', 'sans-serif'] },
      colors: { cream: '#fef9ef' },
      keyframes: {
        pop: { '0%': { transform: 'scale(.6)', opacity: '0' }, '70%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        wiggle: { '0%,100%': { transform: 'translateX(0)' }, '20%,60%': { transform: 'translateX(-10px)' }, '40%,80%': { transform: 'translateX(10px)' } },
        bob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        glow: { '0%,100%': { boxShadow: '0 0 0 0 rgba(250,204,21,.9)' }, '50%': { boxShadow: '0 0 0 14px rgba(250,204,21,0)' } },
      },
      animation: {
        pop: 'pop .35s ease-out both',
        wiggle: 'wiggle .45s ease-in-out',
        bob: 'bob 2.4s ease-in-out infinite',
        glow: 'glow 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
