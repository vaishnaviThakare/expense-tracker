const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const guessCategory = require('../utils/categorize');
const router = express.Router();

// INSIGHTS — must come before any /:id-style routes, so it's not swallowed as a param
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const thisWeek = await pool.query(
      `SELECT c.name, SUM(e.amount) as total FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.user_id=$1 AND e.spent_at >= NOW() - INTERVAL '7 days'
       GROUP BY c.name`,
      [req.userId]
    );

    const lastWeek = await pool.query(
      `SELECT c.name, SUM(e.amount) as total FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.user_id=$1 AND e.spent_at >= NOW() - INTERVAL '14 days'
         AND e.spent_at < NOW() - INTERVAL '7 days'
       GROUP BY c.name`,
      [req.userId]
    );

    res.json({ thisWeek: thisWeek.rows, lastWeek: lastWeek.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all expenses for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT expenses.id, expenses.amount, expenses.description, expenses.spent_at,
              categories.name AS category_name
       FROM expenses
       LEFT JOIN categories ON expenses.category_id = categories.id
       WHERE expenses.user_id = $1
       ORDER BY expenses.spent_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST a new expense for the logged-in user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { amount, description, category_id, spent_at } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    let finalCategoryId = category_id || null;

    // If the user didn't manually pick a category, try to guess one
    if (!finalCategoryId && description) {
      const guessedName = guessCategory(description);
      const categoryResult = await pool.query(
        'SELECT id FROM categories WHERE name = $1 LIMIT 1',
        [guessedName]
      );
      if (categoryResult.rows[0]) {
        finalCategoryId = categoryResult.rows[0].id;
      }
    }

    const result = await pool.query(
      `INSERT INTO expenses (user_id, category_id, amount, description, spent_at)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE))
       RETURNING *`,
      [req.userId, finalCategoryId, amount, description || null, spent_at || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE an expense (only if it belongs to the logged-in user)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;