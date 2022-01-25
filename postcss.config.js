const tailwindcss = require('tailwindcss');

module.exports = {
    plugins: [
        require('postcss-nested'),
        tailwindcss('./tailwind.config.js'),
        require('autoprefixer'),
    ],
};