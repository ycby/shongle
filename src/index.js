import express from 'express'

import {getStockRouter} from "#root/src/controllers/StockController.js";
import {DuplicateFoundError} from "#root/src/errors/Errors.js";
import * as ResponseStandardiser from "#root/src/utilities/ResponseStandardiser.js";

const app = express()
const port = process.env.SERVER_PORT
console.log(`db name: ${process.env.DB_NAME}`)

app.use((req, res, next) => {

	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')

	next()
});

//use parser
app.use(express.json());

app.use("/", getStockRouter())

app.use((err, req, res, next) => {

	console.error(err.name);
	console.error(err.message);
	console.error(err.stack);

	let response;
	if (err instanceof DuplicateFoundError) {

		response = ResponseStandardiser.generateErrorResponse(-100, err.message);
	} else {

		response = ResponseStandardiser.generateErrorResponse(-1, "Unknown Error");
	}

	res.status(500).json(response);
})

// app.get("/short/", ShortData)
//
// app.post("/shortdata/upload", ShortDataMulter)

app.listen(port, () => {
	console.log(`Listening on PORT ${port}`)
})