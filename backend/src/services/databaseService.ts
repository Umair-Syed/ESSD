import sql from 'mssql';

const connections = new Map();

async function getConnection(hostname: string, config: sql.config) {
    if (connections.has(hostname)) {
        return connections.get(hostname);
    }

    try {
        const pool = new sql.ConnectionPool(config);
        await pool.connect();
        connections.set(hostname, pool);
        return pool;
    } catch (err) {
        console.error(`Failed to connect to ${hostname}:`, err);
        throw err;
    }
}

export default async function executeSQL(hostname: string, config: sql.config, sqlCommand: string) {
    try {
        const pool = await getConnection(hostname, config);
        const result = await pool.request().query(sqlCommand);
        return result.recordset;
    } catch (err) {
        console.error('SQL error', err);
        throw err;
    }
}