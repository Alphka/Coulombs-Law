import { existsSync } from "fs"
import { mkdir, rm } from "fs/promises"
import { task } from "gulp"

const { BUILD_FOLDER_PATH } = process.env

task("clear", async () => {
	if(existsSync(BUILD_FOLDER_PATH)) await rm(BUILD_FOLDER_PATH, { recursive: true })
	return await mkdir(BUILD_FOLDER_PATH)
})
