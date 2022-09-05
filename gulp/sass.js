import { join, parse, relative, resolve } from "path"
import { mkdir, writeFile } from "fs/promises"
import { existsSync } from "fs"
import { task } from "gulp"
import glob from "glob"
import sass from "sass"

const { BUILD_FOLDER_PATH, NODE_ENV } = process.env
const isDevelopment = NODE_ENV === "development"

/**
 * @param {string} globs
 * @param {string} destination Relative to `BUILD_FOLDER_PATH`
 */
async function Compile(globs, destination){
	const files = glob.sync(globs, {
		cwd: resolve(__dirname, ".."),
		absolute: true
	})

	destination = resolve(BUILD_FOLDER_PATH, destination)

	if(!existsSync(destination)) await mkdir(destination, { recursive: true })

	const promises = files.map(async file => {
		const { name } = parse(file)
		const result = await sass.compileAsync(file, {
			style: isDevelopment ? "expanded" : "compressed",
			sourceMap: true,
			sourceMapIncludeSources: true
		})

		const basename = name + ".css"

		if(result.sourceMap){
			const mapBasename = name + ".css.map"

			result.css += `\n/*# sourceMappingURL=${mapBasename} */\n`
			result.sourceMap.file = basename

			result.sourceMap.sources.forEach((source, index, array) => {
				const path = relative(BUILD_FOLDER_PATH, decodeURIComponent(source.replace(/^file:\/\/\//, "")))
				array[index] = path
			})

			await Promise.all([
				writeFile(join(destination, basename), result.css, "utf8"),
				writeFile(join(destination, mapBasename), JSON.stringify(result.sourceMap), "utf8")
			])
		}else await writeFile(join(destination, basename), result.css, "utf8")
	})

	await Promise.all(promises)
}

task("sass", () => Compile("src/styles/*.scss", "styles"))
