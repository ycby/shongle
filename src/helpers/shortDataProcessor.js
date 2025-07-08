import fs from 'fs'
import * as csv from 'csv'
import db from '#root/src/db/db.ts'
import ShortData from '#root/src/models.js/ShortData.js'

export default async function processAndInsertShortData(filepath, mappings) {

	console.log('Processing short data...')

	let rows
	const insertQuery = "INSERT INTO Short_Reporting (stock_code, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime) VALUE (CAST(? AS CHAR), ?, ?, ?, ?, ?)"

	try {

		console.log('Starting to process csv...')
		rows = await processCSV(filepath, mappings)
		console.log('Got the rows...')
		console.log(rows.length)

	} catch (err) {

		console.log('wowza... its an error the whole time...' + err)
		return
	}

	let conn

	try {
		console.log('Attempting to connect to DB...')
		conn = await db.pool.getConnection()
		
		await conn.beginTransaction()

		const result = await conn.batch(insertQuery, rows)

		await conn.commit()

		console.log(result)
	} catch (err) {

		console.log(err)
		await conn.rollback()
	} finally {

		console.log('Successfully processed short data...')
		if (conn) conn.end()
	}
}

async function processCSV(filepath, mappings) {

	const rows = []
	console.log('Inside function to process csv')

	return new Promise((resolve, reject) => {

		const readStream = fs.createReadStream(filepath)
		
		readStream
		.pipe(csv.parse({ columns: true }))
		.on('data', data => {

			const row = []
			const shortData = new ShortData('INSERT')

			mappings.forEach(mapping => shortData[mapping.value] = data[mapping.column])
			row.push(...shortData.getFields())
			rows.push(row)
		})
		.on('error', (err) => {

			console.log('Error when reading file...')
			reject()
		})
		.on('end', (err) => {

			console.log('Finished processing file...')
			console.log('Stream closed...')
			readStream.destroy()
			resolve(rows)
		})
	})
}
