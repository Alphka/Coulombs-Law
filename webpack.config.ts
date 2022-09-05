import type { Configuration } from "webpack"
import WatchedGlobEntries from "webpack-watched-glob-entries-plugin"
import BrowserSync from "browser-sync-webpack-plugin"
import { join } from "path"

delete process.env.TS_NODE_PROJECT

const isDevelopment = process.env.NODE_ENV === "development"

process.env.BUILD_FOLDER = isDevelopment ? "dist" : "build"
process.env.BUILD_FOLDER_PATH = join(__dirname, process.env.BUILD_FOLDER)

function AddFolderToEntries(entries: Record<string, string>){
	return Object.fromEntries(Object.entries(entries).map(([name, path]) => {
		const folder = path.split("/").at(-2)!
		return [folder + "/" + name, path]
	}))
}

const babelOptions = {
	presets: [
		[
			"@babel/preset-env", {
				targets: {
					chrome: "94",
					firefox: "102"
				}
			}
		]
	],
	plugins: [
		"@babel/plugin-transform-runtime",
		"@babel/plugin-proposal-nullish-coalescing-operator",
		"@babel/plugin-proposal-optional-chaining"
	]
} as const

const config: Configuration = {
	mode: "production",
	target: "web",
	devtool: "source-map",
	entry: {
		...AddFolderToEntries(WatchedGlobEntries.getEntries(["src/scripts/*.ts"], {
			absolute: true,
			cwd: __dirname,
			ignore: [
				"src/index.pug",
				"src/tsconfig.json"
			]
		})())
	},
	output: {
		filename: "[name].js",
		path: process.env.BUILD_FOLDER_PATH
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "babel-loader",
						options: babelOptions
					},
					{
						loader: "ts-loader",
						options: {
							configFile: join(__dirname, "src/tsconfig.json"),
							ignoreDiagnostics: [2732, 7006]
						}
					}
				]
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "babel-loader",
				options: babelOptions
			}
		]
	},
	resolve: {
		extensions: [".ts", ".js"]
	}
}

if(isDevelopment){
	config.plugins = [
		new WatchedGlobEntries(),
		new BrowserSync({
			host: "localhost",
			port: 3000,
			files: [
				"src/**/*.*"
			],
			ignore: [
				"src/typings/**",
				"src/**/*.ts",
				"src/**/*.scss",
				"src/tsconfig.json",
				process.env.BUILD_FOLDER + "/**/*.html",
				process.env.BUILD_FOLDER + "/**/*.js",
				process.env.BUILD_FOLDER + "/**/*.map",
			],
			server: {
				baseDir: process.env.BUILD_FOLDER_PATH,
				index: "index.html",
				routes: {
					"/src": join(__dirname, "src")
				}
			},
			watch: true,
			minify: false,
			notify: false,
			open: false,
			ui: false
		})
	]
}

export default config
