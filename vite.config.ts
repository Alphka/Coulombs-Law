import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"
import browserslist from "browserslist"
import { browserslistToTargets } from "lightningcss"

const root = fileURLToPath(new URL("src", import.meta.url))
const outDir = fileURLToPath(new URL("dist", import.meta.url))

export default defineConfig({
	root,
	build: {
		outDir,
		emptyOutDir: true,
		sourcemap: true,
		// * The CSP in vercel.json does not allow data: fonts, so KaTeX fonts must stay as files
		assetsInlineLimit: 0
	},
	css: {
		devSourcemap: true,
		lightningcss: {
			targets: browserslistToTargets(browserslist())
		},
		preprocessorOptions: {
			scss: {
				silenceDeprecations: ["import"]
			}
		}
	},
	test: {
		include: ["**/*.test.ts"]
	}
})
