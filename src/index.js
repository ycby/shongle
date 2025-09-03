import express from 'express';

import {getStockRouter} from "#root/src/controllers/StockController.ts";
import {getShortDataRouter} from "#root/src/controllers/ShortDataController.js";
import {ShongleError} from "#root/src/errors/Errors.ts";
import * as ResponseStandardiser from "#root/src/utilities/ResponseStandardiser.ts";
import {getStockTransactionRouter} from "#root/src/controllers/StockTransactionController.ts";
import {getDiaryEntryRouter} from "#root/src/controllers/DiaryEntryController.ts";

const app = express()
const port = process.env.SERVER_PORT
console.log(`db name: ${process.env.DB_NAME}`)

app.use((req, res, next) => {

	res.setHeader('Access-Control-Allow-Origin', process.env.WHITELISTED_ORIGIN);
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	next()
});

//use parser
app.use(express.json({limit: '500kb'}));

console.log('Initialising...');
app.use("/", [getStockRouter(), getShortDataRouter(), getStockTransactionRouter(), getDiaryEntryRouter()]);

app.use((err, req, res, next) => {

	console.error(err.name);
	console.error(err.message);
	console.error(err.stack);

	let response;
	if (err instanceof ShongleError) {

		response = ResponseStandardiser.generateErrorResponse(-100, err.message, err.supportingData);
	} else {

		response = ResponseStandardiser.generateErrorResponse(-1, "Unknown Error");
	}

	res.status(500).json(response);
})

app.listen(port, () => {
	console.log(`Listening on PORT ${port}`)
})