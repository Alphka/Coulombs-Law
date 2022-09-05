import { src, dest, task } from "gulp"
import { resolve } from "path"

const { BUILD_FOLDER_PATH } = process.env

task("copy", () =>
	src("public/**/*.*", { cwd: resolve(__dirname, "..") })
		.pipe(dest(BUILD_FOLDER_PATH))
)
