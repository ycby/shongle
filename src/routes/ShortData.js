import db from '#root/src/db/db.js'

export default async (req, res) => {

	const stockCode = req.query.stockcode

	if (!stockCode) return res.setHeader('content-type', 'application/json').send([]);

	//TODO: change this to not get all at start
	const stockQuery = `SELECT * FROM Stock WHERE code = ? LIMIT 1`
	const shortReportingQuery = `SELECT * FROM Short_Reporting WHERE stock_code = ? ORDER BY reporting_date DESC`

	let conn

	try {
		conn = await db.pool.getConnection()
		
		await conn.beginTransaction()

		const result = await conn.query(shortReportingQuery, [[stockCode]])

		console.log(result)

		res.setHeader('content-type', 'application/json').send(result)
	} catch (err) {

		console.log(err)
		if (conn) await conn.rollback()
		res.status(500).send('My body is broken')
	} finally {

		console.log('Closing Connection')
		if (conn) conn.end()
	}
}