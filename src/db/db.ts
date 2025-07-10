import mariadb from 'mariadb'

export default Object.freeze({
	pool: mariadb.createPool({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
		connectionLimit: 5,
		bigIntAsNumber: true,
		trace: true
	})
})