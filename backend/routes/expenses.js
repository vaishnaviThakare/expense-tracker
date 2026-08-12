const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/auth');
const guessCategory = require('../utils/categorize');   // ← new
const router = express.Router();

// ... GET route stays the same ...

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

// ... DELETE route stays the same ...

module.exports = router;