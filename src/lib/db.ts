import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn('DATABASE_URL is not defined in environment variables');
}

export const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

// Helper for parameterized queries
export const query = (text: string, params?: any[]) => {
    return pool.query(text, params);
};

// Automatic schema initialization
export async function initSchema() {
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.resolve('database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    try {
        await query(schema);
        console.log('Database schema initialized');
    } catch (err) {
        console.error('Error initializing schema:', err);
        throw err;
    }
}
