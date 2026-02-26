import {QueryOptions, UpsertResult, createPool} from 'mariadb';

const dbPool = Object.freeze({
	pool: createPool({
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME,
		connectionLimit: 5,
		trace: true
	})
});

const executeQuery = async <T>(queryObject: QueryOptions, placeholders: any = undefined, postProcessor?: (element: any) => T): Promise<T[]> => {

	let conn;

	try {

		conn = await dbPool.pool.getConnection();

		await conn.beginTransaction();

		let result;

		if (placeholders === undefined) {

			result = await conn.query(queryObject);
		} else if (typeof placeholders === 'function') {

			result = await conn.query(queryObject, placeholders());
		} else {

			//if has placeholders and is not function
			result = await conn.query(queryObject, placeholders);
		}

		await conn.commit();

		if (postProcessor) {

			return result instanceof Array ? result.map(postProcessor) : [postProcessor(result)];
		}

		return result;
	} catch (err) {

		if (conn) await conn.rollback();

		throw err;
	} finally {

		if (conn) await conn.end();
	}
}

const executeBatch = async (queryObject: QueryOptions, placeholders: {}): Promise<UpsertResult[]> => {

	let conn;

	try {

		conn = await dbPool.pool.getConnection();

		await conn.beginTransaction();

		let result;
		if (placeholders === undefined) {

			throw new Error('Placeholders must be provided for batch.');
		} else if (typeof placeholders === 'function') {

			result = await conn.batch(queryObject, placeholders());
		} else {

			//if has placeholders and is not function
			result = await conn.batch(queryObject, placeholders);
		}

		await conn.commit();

		return result instanceof  Array ? result : [result];
	} catch (err) {

		if (conn) await conn.rollback();

		throw err;
	} finally {

		if (conn) await conn.end();
	}
}

export {
	executeQuery,
	executeBatch
};