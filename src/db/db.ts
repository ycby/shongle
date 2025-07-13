import mariadb, {QueryOptions} from 'mariadb'

const dbPool = Object.freeze({
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
});

const executeQuery = async <T>(queryObject: QueryOptions, placeholders: {}): Promise<T> => {

	let conn;

	try {

		conn = await dbPool.pool.getConnection();

		await conn.beginTransaction();

		if (placeholders === undefined) return await conn.query(queryObject);

		//if has placeholders
		return await conn.query(queryObject, placeholders);
	} catch (err) {

		if (conn) await conn.rollback();

		throw err;
	} finally {

		if (conn) await conn.end();
	}
}

export default dbPool;
export {
	executeQuery
};