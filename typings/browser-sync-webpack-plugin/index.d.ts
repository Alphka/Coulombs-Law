declare module "browser-sync-webpack-plugin" {
	import type { Compiler, WebpackPluginInstance } from "webpack"
	import type BrowserSync from "browser-sync"

	interface Options {
		/**
		 * BrowserSync instance init callback.
		 * @defaultValue undefined
		 */
		callback?(error: Error, bs: BrowserSync.BrowserSyncInstance): void
		/**
		 * Allows BrowserSync to inject changes inplace
		 * instead of reloading the page when changed
		 * chunks are all CSS files
		 * @defaultValue false
		 */
		injectCss?: boolean | undefined
		/**
		 * BrowserSync instance name
		 * @defaultValue "bs-webpack-plugin"
		 */
		name?: string | undefined
		/**
		 * Whether BrowserSync should reload
		 * @defaultValue true
		 */
		reload?: boolean | undefined
	}

	class BrowserSyncPlugin {
		constructor(browserSyncOptions: BrowserSync.Options, pluginOptions?: Options)
		apply(compiler: Compiler): void
	}

	export = BrowserSyncPlugin
}
