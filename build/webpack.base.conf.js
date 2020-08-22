const path = require('path')
const fs = require('fs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const cssLoaders = extra => {
	const loaders = [
		MiniCssExtractPlugin.loader,
		{
			loader: 'css-loader',
			options: { sourceMap : true }
		},  {
			loader: 'postcss-loader',
			options: { sourceMap : true, config: { path: `./postcss.config.js` } }
		},
	]

	if (extra) {
		loaders.push(extra)
	}

	return loaders
}

const PATHS = {
  src: path.join(__dirname, '../src'),
  dist: path.join(__dirname, '../dist'),
  assets: 'assets/'
}

const PAGES_DIR = `${PATHS.src}/pages/`
const PAGES = fs
  .readdirSync(PAGES_DIR)
  .filter(fileName => fileName.endsWith('.pug'))

module.exports = {

	externals: {
		paths: PATHS
	},

	entry: {
		// EP для index.js - достаточно директории (index.js - стандартный entry point). Также Webpack понимает .js и .json extensions - их можно опускать.
		main: ['@babel/polyfill', PATHS.src]
		// Дополнительные entry points. Может быть /your-module.js или module-folder/your-module.js. Расширение файла обязательно.
    // module: `${PATHS.src}/your-module.js`
	},

	output: {
		filename: `${PATHS.assets}js/[name].bundle.[hash].js`,
		path: PATHS.dist,
		publicPath: '/'
	},
	// Оптимизация и сплит кода. Vendors.js - entry point статического каталога node_modules; app.js - динамический код.
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor: {
					name:'vendors',
					test: /node_modules/,					
					chunks: 'all',					
					enforce: true
				}
			}
		}
	},
	module: {
		rules: [{
			test: /\.js$/,
			loader: {
				loader:'babel-loader',
				options: {
					presets: [
						'@babel/preset-env'
					]
				}},
			exclude: '/node_modules/'
		},{
			test: /\.pug$/,
			loader: 'pug-loader',
			options: {
				name: '[name].[ext]'
			},
		}, 
		{
			test: /\.(png|jpg|gif|svg)$/,
			loader: 'file-loader',
			options: {
				name: '[name].[ext]'
			}
		}, 
		{
			test: /\.(ttf|woff|woff2|eot)$/,
			loader: 'file-loader',
			options: {
				name: '[name].[ext]',
				outputPath: 'assets/fonts'
			}
		}, 

		{
			test: /\.css$/,
			use: cssLoaders()
		}, 
		{
			test: /\.s[ac]ss$/,
			use: cssLoaders('sass-loader')
		}]
	},
	plugins: [
    ...PAGES.map(
      page =>
        new HtmlWebpackPlugin({
          template: `${PAGES_DIR}/${page}`, // from .pug
					filename: `./${page.replace(/\.pug/, '.html')}`, // to .html
					minify: isProd
        })
    ),
		new MiniCssExtractPlugin ({
			filename: `${PATHS.assets}css/[name].[contenthash].css`
		}),
		new CopyWebpackPlugin ({
			patterns: [
			{ from: `${PATHS.src}/img`, to: `${PATHS.assets}img`},
			{ from: `${PATHS.src}/static`, to: ''},
			]}),
		new CleanWebpackPlugin()
	]
}