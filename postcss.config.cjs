/**  /postcss.config.cjs  */
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // ← NEW
    autoprefixer: {},          // keep if you still want prefixing
  },
};