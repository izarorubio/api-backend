const pool = require('../db');

// Obtener todos los productos
const getAllProducts = async (req, res, next) => {
    const { category, limit } = req.query;
    try {
        let query = 'SELECT * FROM products';
        const params = [];

        if (category) {
            params.push(category);
            query += ` WHERE category_id = $${params.length}`;
        }

        if (limit) {
            params.push(limit);
            query += ` LIMIT $${params.length}`;
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

// Obtener la información de un producto
const getProductById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: `Producto con id ${id} no encontrado` });
        }
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Crear un producto
const createProduct = async (req, res, next) => {
    const { title, price, description, category_id, image, rating } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (title, price, description, category_id, image, rating) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, price, description, category_id, image, rating]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Actualizar un producto
const updateProduct = async (req, res, next) => {
    const { id } = req.params;
    const { title, price, description, category_id, image, rating } = req.body;

    try {
        let query = 'UPDATE products SET ';
        const values = [];
        if (title) {
            values.push(title);
            query += `title = $${values.length}, `;
        }
        if (price) {
            values.push(price);
            query += `price = $${values.length}, `;
        }
        if (description) {
            values.push(description);
            query += `description = $${values.length}, `;
        }
        if (category_id) {
            values.push(category_id);
            query += `category_id = $${values.length}, `;
        }
        if (image) {
            values.push(image);
            query += `image = $${values.length}, `;
        }
        if (rating) {
            values.push(rating);
            query += `rating = $${values.length}, `;
        }
        query = query.slice(0, -2);
        values.push(id);
        query += ` WHERE id = $${values.length} RETURNING *`;

        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Producto con id ${id} no encontrado` });
        }

        res.json({ message: 'Producto actualizado correctamente', producto: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// Eliminar un producto
const deleteProduct = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Producto con id ${id} no encontrado` });
        }
        res.json({ message: `Producto con id ${id} eliminado`, producto: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// Exportar controladores
module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};

