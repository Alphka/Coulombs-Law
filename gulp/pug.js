import { task, src, dest } from "gulp"
import { join, resolve } from "path"
import pug from "gulp-pug"

const { BUILD_FOLDER_PATH, NODE_ENV } = process.env
const pretty = NODE_ENV === "development" ? "\t" : false

/**
 * @param {string | string[]} globs
 * @param {string} [folder]
 */
function Compile(globs, folder){
	const destPath = folder ? join(BUILD_FOLDER_PATH, folder) : BUILD_FOLDER_PATH
	const stream = src(globs, { cwd: resolve(__dirname, "..") })
		.pipe(pug({ pretty }))
		.pipe(dest(destPath))

	return new Promise((resolve, reject) => {
		stream.on("error", reject)
		stream.on("end", resolve)
	})
}

task("pug", () => Compile("src/**/*.pug"))
