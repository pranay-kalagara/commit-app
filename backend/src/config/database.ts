import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';

let pool: Pool;

export const connectDatabase = async (): Promise<void> => {
    try {
        const connectionConfig = {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            max: 20, // Maximum number of clients in the pool
            idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
        };

        pool = new Pool(connectionConfig);

        // Test the connection
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();

        logger.info('Database connection established successfully');
    } catch (error) {
        logger.error('Failed to connect to database:', error);
        throw error;
    }
};

export const getDatabase = (): Pool => {
    if (!pool) {
        throw new Error('Database not initialized. Call connectDatabase() first.');
    }
    return pool;
};

export const query = async (text: string, params?: any[]): Promise<any> => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV === 'development') {
            logger.debug(`Query executed in ${duration}ms:`, { text, params });
        }
        
        return result;
    } catch (error) {
        logger.error('Database query error:', { text, params, error });
        throw error;
    }
};

export const getClient = async (): Promise<PoolClient> => {
    return await pool.connect();
};

export const closeDatabase = async (): Promise<void> => {
    if (pool) {
        await pool.end();
        logger.info('Database connection closed');
    }
};
