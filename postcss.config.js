module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require('cssnano')({ preset: 'default' }), // 新增 cssnano 用于压缩
  ]
}; 