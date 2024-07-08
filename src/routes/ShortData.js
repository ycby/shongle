import db from '#root/src/db/db.js'

export default async (req, res) => {

	const selectQuery = "SELECT id, stock_code, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime FROM Short_Reporting"

	let conn

	try {
		conn = await db.pool.getConnection()
		
		await conn.beginTransaction()

		const result = await conn.query(selectQuery)

		console.log(result)

		res.setHeader('content-type', 'application/json').send(result)
	} catch (err) {

		console.log(err)
		if (conn) await conn.rollback()
		res.status(500).send('My body is broken')
	} finally {

		console.log('Closing Connection')
		if (conn) conn.end()
		// db.pool.end()
	}
}