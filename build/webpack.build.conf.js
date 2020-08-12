// Использование merge без {} не компилирует файл с ошибкой merge is not a function (09.08.2020)
const {merge} = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const buildWebpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  plugins: []
})

module.exports = new Promise((resolve, reject) => {
  resolve(buildWebpackConfig)
})