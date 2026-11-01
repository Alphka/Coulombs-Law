import type { Config } from "jest"
import nextJest from "next/jest.js"

const ESM_PACKAGES = ["next-intl", "use-intl", "@formatjs", "intl-messageformat", "icu-minify"].join("|")

const createJestConfig = nextJest({ dir: "./" })

const config: Config = {
	coverageProvider: "v8",
	testEnvironment: "jsdom",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"]
}

export default async function jestConfig(): Promise<Config>{
	const nextConfig = await createJestConfig(config)()

	return {
		...nextConfig,
		transformIgnorePatterns: [
			String.raw`/node_modules/(?!\.pnpm|${ESM_PACKAGES})`,
			String.raw`/node_modules/\.pnpm/(?!(${ESM_PACKAGES})[@+])`,
			String.raw`^.+\.module\.(css|sass|scss)$`
		]
	}
}
