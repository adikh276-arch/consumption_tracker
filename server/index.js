import express from 'express';
import cors from 'cors';
import { pool, initSchema } from '../src/lib/db.ts';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize schema on startup
initSchema().then(() => {
    console.log('Database is ready');
}).catch(err => {
    console.error('Database initialization failed:', err);
});

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Initialize User
app.post('/init-user', async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'User ID is required' });

    try {
        await pool.query(
            'INSERT INTO users (id) VALUES ($1) ON CONFLICT (id) DO NOTHING',
            [user_id]
        );
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error init user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get History
app.get('/history', async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'User ID is required' });

    try {
        const result = await pool.query(
            'SELECT TO_CHAR(date, \'YYYY-MM-DD\') as date, smoked, count, urge_time as "urgeTime", feeling, reflection FROM check_ins WHERE user_id = $1 ORDER BY date DESC',
            [user_id]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save Check-in
app.post('/save-checkin', async (req, res) => {
    const { user_id, entry } = req.body;
    if (!user_id || !entry) return res.status(400).json({ error: 'User ID and entry are required' });

    const { date, smoked, count, urgeTime, feeling, reflection } = entry;

    try {
        await pool.query(
            `INSERT INTO check_ins (user_id, date, smoked, count, urge_time, feeling, reflection)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, date) DO UPDATE 
       SET smoked = EXCLUDED.smoked,
           count = EXCLUDED.count,
           urge_time = EXCLUDED.urge_time,
           feeling = EXCLUDED.feeling,
           reflection = EXCLUDED.reflection,
           updated_at = NOW()`,
            [user_id, date, smoked, count, urgeTime, feeling, reflection]
        );
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error saving check-in:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
