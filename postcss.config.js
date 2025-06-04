// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // ← 기존 'tailwindcss'가 아니라 이걸 사용해야 함
    autoprefixer: {},
  },
}