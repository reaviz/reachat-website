/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    'postcss-import': {
      path: ['node_modules'],
    },
    tailwindcss: {},
    autoprefixer: {},
  },
};

module.exports = config;