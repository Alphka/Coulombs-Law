import { parallel, series, task, watch } from "gulp"
import { join } from "path"

const cwd = __dirname

process.env.BUILD_FOLDER = process.env.NODE_ENV === "development" ? "dist" : "build"
process.env.BUILD_FOLDER_PATH = join(cwd, process.env.BUILD_FOLDER)

require("./gulp/clear")
require("./gulp/copy")
require("./gulp/sass")
require("./gulp/pug")

const defaultTask = series("clear", parallel("copy", "sass", "pug"))

task("default", defaultTask)

task("watch", series(defaultTask, function listener(){
	watch("public/**/*.*", series("copy"), { cwd })
	watch("src/styles/*.scss", series("sass"), { cwd })
	watch("src/**/*.pug", series("pug"), { cwd })
}))

