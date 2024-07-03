import fs from 'fs'
import * as csv from 'csv'
import db from '#root/src/db/db.js'
import ShortData from '#root/src/objectModels/ShortData.js'


const parser = csv.parse({ columns: true })

export default async function processAndInsertShortData(filepath, mappings) {

	const rows = await processCSV(filepath, mappings)

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

async function processCSV(filepath, mappings) {

	const rows = []
	const readStream = fs.createReadStream(filepath)

	readStream
	.pipe(parser)
	.on('data', data => {

		const row = []
		const shortData = new ShortData('INSERT')

		mappings.forEach(mapping => shortData[mapping.value] = data[mapping.column])

		row.push(...shortData.getFields())

		rows.push(row)
	})

	return rows
}