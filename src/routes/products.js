const express = require('express');
const pool = require('../db');

const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Crear un producto
router.post('/addOne', async (req, res) => {
    const { title, price, description, category_id, image, rating } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (title, price, description, category, image, rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, price, description, category_id, image, rating]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Producto con id ${id} no encontrado` });
        }
        res.json({ message: `Producto con id ${id} eliminado`, producto: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

module.exports = router;