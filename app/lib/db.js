import mysql from 'mysql2/promise'

let connection;
export const createConnection = async () => {
    if(!connection) {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        })
    }
    return connection;
}