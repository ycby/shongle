import fs from 'fs'
import * as csv from 'csv'
import db from '#root/src/db/db.js'
import ShortData from '#root/src/objectModels/ShortData.js'


const parser = csv.parse({ columns: true })

export default async function processAndInsertShortData(filepath) {

	const rows = await processCSV(filepath)

	const insertQuery = "INSERT INTO Short_Reporting (stock_code, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime) VALUE (?, ?, ?, ?, ?, ?)"

	let conn

	try {
		conn = await db.pool.getConnection()
		
		await conn.beginTransaction()

		console.log(rows)
		const result = await conn.batch(insertQuery, rows)

		await conn.commit()

		console.log(result)
	} catch (err) {
		console.log(err)
		await conn.rollback()
	}
}

async function processCSV(filepath) {

	const rows = []
	const readStream = fs.createReadStream(filepath)

	readStream
	.pipe(parser)
	.on('data', data => {
		console.log(data)

		const row = []
		const shortData = new ShortData('INSERT')
		shortData.stock_code = data['Stock Code']
		shortData.reporting_date = data['Date']
		shortData.shorted_shares = data['Aggregated Reportable Short Positions (Shares)']
		shortData.shorted_amount = data['Aggregated Reportable Short Positions (HK$)']

		row.push(...shortData.getFields())

		rows.push(row)
	})

	return rows
}