export type If<T extends boolean, A, B = null> = T extends true ? A : T extends false ? B : A | B

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV?: "development"
			TS_NODE_PROJECT?: "webpack.tsconfig.json"
			BUILD_FOLDER?: "build" | "dist"
			BUILD_FOLDER_PATH?: string
		}
	}
}
