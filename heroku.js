const { spawn, spawnSync } = require("child_process")
const { mkdirSync } = require("fs")
const { join } = require("path")
const express = require("express")
const app = express()
const port = process.env.PORT || 3000

app.disable("etag")
app.disable("x-powered-by")

console.log("Serving build folder")

mkdirSync("build", { recursive: true })

app.use(express.static("build", {
	cacheControl: false,
	setHeaders: response => response.setHeader("Cache-Control", "public, max-age=3600")
}))

console.log("Listening on port %d", port)

app.listen(port)
