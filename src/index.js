const express = require('express')
const app = express()
const port = process.env.SERVER_PORT

const mariadb = require('mariadb')
//TODO: use process.env to separate out environment variables

const db = mariadb.createPool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	connectionLimit: 5,
	rowsAsArray: true
})

app.get("/", async (req, res) => {

	const testQuery = "SELECT * FROM Stock"

	let conn

	let result
	try {

		result = await db.query(testQuery)
		console.log(result)
	} catch (err) {
		console.log(err)
	}

	res.send(`Hello World 2\r\n${result}`)
})

app.listen(port, () => {
	console.log(`Listening on PORT ${port}`)
})