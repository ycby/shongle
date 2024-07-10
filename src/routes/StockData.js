import db from '#root/src/db/db.js'

export default async (req, res) => {

	const stockQuery = `SELECT * FROM Stock`

	let conn

	try {

		conn = await db.pool.getConnection()

		await conn.beginTransaction

		const result = await conn.query(stockQuery)

		res.setHeader('content-type', 'application/json').send(result)
	} catch (err) {

		if (conn) await conn.rollback();

		res.status(500).send('The spaghetti has been spilled')
	} finally {

		if (conn) conn.end()
	}
}