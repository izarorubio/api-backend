require('dotenv').config();
const express = require('express');
const pool = require('../db');

const router = express.Router();

// Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM category');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
});

module.exports = router;