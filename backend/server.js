require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));

app.use(express.json());

app.use('/api/auth', authRoutes); 

const expensesRoutes = require('./routes/expenses');
app.use('/api/expenses', expensesRoutes);

const categoryRoutes = require('./routes/categories');
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Spendly API is running' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));