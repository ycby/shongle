import express, {Request, Response, NextFunction} from 'express';
import https from 'https';
import fs from 'fs';

import {getStockRouter} from "#root/src/controllers/StockController.js";
import {getShortDataRouter} from "#root/src/controllers/ShortDataController.js";
import {ShongleError} from "#root/src/errors/Errors.js";
import * as ResponseStandardiser from "#root/src/utilities/ResponseStandardiser.js";
import {getStockTransactionRouter} from "#root/src/controllers/StockTransactionController.js";
import {getDiaryEntryRouter} from "#root/src/controllers/DiaryEntryController.js";
import {CurrencyCache} from "#root/src/utilities/DataCache.js";
import {executeQuery} from "#root/src/db/db.js";
import {Currency} from "#root/src/types.js";

const app = express()

if (!process.env.PRIVATE_KEY || !process.env.CERTIFICATE) {
	console.error('Missing filepath for credentials');
	process.exit(1);
}

if (!process.env.SERVER_PORT) {
	console.error('Missing port');
	process.exit(1);
}

if (!process.env.WHITELISTED_ORIGIN) {
	console.error('Missing whitelisted origin');
	process.exit(1);
}

const port = process.env.SERVER_PORT
const whitelistedOrigin = process.env.WHITELISTED_ORIGIN;
console.log(`db name: ${process.env.DB_NAME}`)

const privateKey = fs.readFileSync(process.env.PRIVATE_KEY);
const certificate = fs.readFileSync(process.env.CERTIFICATE);


const credentials = {
	key: privateKey,
	cert: certificate,
}

app.use((_req: Request, res: Response, next: NextFunction) => {

	res.setHeader('Access-Control-Allow-Origin', whitelistedOrigin);
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	next();
});

//use parser
app.use(express.json({limit: '500kb'}));

app.set('json replacer', ((_key: string, value: any) => {

	if (typeof value === 'bigint') return value.toString();
	return value;
}));

console.log('Initialising...');
app.use("/", [getStockRouter(), getShortDataRouter(), getStockTransactionRouter(), getDiaryEntryRouter()]);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {

	console.error(err.message);

	let response;
	if (err instanceof ShongleError) {

		response = ResponseStandardiser.generateErrorResponse(-100, err.message, err.supportingData);
		console.error(err.supportingData);
	} else {

		response = ResponseStandardiser.generateErrorResponse(-1, "Unknown Error");
	}

	console.error(err.stack);
	res.status(500).json(response);
})


//init static caches
await CurrencyCache.init(async () => {

	return await executeQuery<Currency>({
		sql: `SELECT ISO_code, decimal_places FROM Currencies`
	});
}, (element) => element.ISO_code);

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
	console.log(`HTTPS Listening on PORT ${port}`)
})