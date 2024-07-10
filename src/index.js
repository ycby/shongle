import express from 'express'
import processAndInsertShortData from '#root/src/helpers/shortDataProcessor.js'
import ShortDataMulter from '#root/src/routes/ShortDataMulter.js'
import ShortData from '#root/src/routes/ShortData.js'
import Mapping from '#root/src/routes/Mapping.js'
import StockData from '#root/src/routes/StockData.js'

const app = express()
const port = process.env.SERVER_PORT

app.use((req, res, next) => {

	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')

	next()
})

//TODO: Refactor everything
app.get("/", async (req, res) => {

	res.send(`Hello World 2`)
})

app.get("/mapping", Mapping)

app.get("/stock", StockData)

//TODO: Handle various params
app.get("/shortdata/", ShortData)

app.post("/shortdata/upload", ShortDataMulter)

app.listen(port, () => {
	console.log(`Listening on PORT ${port}`)
})