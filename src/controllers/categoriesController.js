const pool = require('../db');

// Obtener todas las categorías
const getAllCategories = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM category');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

// Obtener una categoría por ID
const getCategoryById = async (req, res, next) => {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    try {
        const result = await pool.query('SELECT * FROM category WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Categoría con id ${id} no encontrada` });
        }
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Crear una nueva categoría
const createCategory = async (req, res, next) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ error: 'Nombre y descripción son obligatorios' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO category (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Actualizar una categoría
const updateCategory = async (req, res, next) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const result = await pool.query(
            'UPDATE category SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Categoría con id ${id} no encontrada` });
        }
        res.json({ message: 'Categoría actualizada correctamente', category: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// Eliminar una categoría
const deleteCategory = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM category WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Categoría con id ${id} no encontrada` });
        }
        res.json({ message: `Categoría con id ${id} eliminada`, category: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// Exportar controladores
module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
