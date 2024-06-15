import express from 'express'
import processAndInsertShortData from '#root/src/helpers/shortDataProcessor.js'
import ShortDataMulter from '#root/src/routes/ShortDataMulter.js'
import Mapping from '#root/src/routes/Mapping.js'

const app = express()
const port = process.env.SERVER_PORT


//TODO: Refactor everything
app.get("/", async (req, res) => {

	res.send(`Hello World 2`)
})

app.get("/mapping", Mapping)

app.post("/shortdata/upload", ShortDataMulter)

app.listen(port, () => {
	console.log(`Listening on PORT ${port}`)
})