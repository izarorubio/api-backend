const express = require('express');
const pool = require('../db');

const router = express.Router();

// Obtener todos los productos
router.get('/productos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Crear un producto
router.post('/productos/addOne', async (req, res) => {
    const { nombre, precio, descripcion, stock } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO productos (nombre, precio, descripcion, stock) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, precio, descripcion, stock]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});

// Crear múltiples productos
router.post('/productos/addMore', async (req, res) => {
    const productos = req.body; // Aquí se espera un array de productos
    const resultados = [];

    try {
        // Iterar sobre el array y agregar cada producto
        for (const producto of productos) {
            const { nombre, precio, descripcion, stock } = producto;
            const result = await pool.query(
                'INSERT INTO productos (nombre, precio, descripcion, stock) VALUES ($1, $2, $3, $4) RETURNING *',
                [nombre, precio, descripcion, stock]
            );
            resultados.push(result.rows[0]); // Agregar el producto creado al array de resultados
        }

        res.json(resultados); // Devolver todos los productos creados
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear los productos' });
    }
});

// Eliminar un producto por id
router.delete('/productos/:id', async (req, res) => {
    const { id } = req.params; // Obtiene el id de los parámetros de la URL

    try {
        const result = await pool.query(
            'DELETE FROM productos WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            // Si no se encontró un producto con el id dado
            return res.status(404).json({ error: `Producto con id ${id} no encontrado` });
        }

        res.json({ message: `Producto con id ${id} eliminado`, producto: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

//Actualizar el producto completo (solo información parcial)
router.patch('/productos/:id', async (req, res) => {
    const { id } = req.params; // Obtiene el id de los parámetros de la URL
    const { nombre, precio, descripcion, stock } = req.body; // Obtiene los datos del cuerpo de la solicitud

    // Comprobar si se envió al menos un campo para actualizar
    if (!nombre && !precio && !descripcion && !stock) {
        return res.status(400).json({ error: 'Debes enviar al menos un campo para actualizar' });
    }

    // Crear una lista dinámica de los campos a actualizar
    const setClause = [];
    const values = [];
    let counter = 1;

    // Solo agregar los campos que están presentes en la solicitud
    if (nombre) {
        setClause.push(`nombre = $${counter}`);
        values.push(nombre);
        counter++;
    }
    if (precio) {
        setClause.push(`precio = $${counter}`);
        values.push(precio);
        counter++;
    }
    if (descripcion) {
        setClause.push(`descripcion = $${counter}`);
        values.push(descripcion);
        counter++;
    }
    if (stock) {
        setClause.push(`stock = $${counter}`);
        values.push(stock);
        counter++;
    }

    // Añadir el ID al final de los valores para la cláusula WHERE
    values.push(id);

    // Crear la consulta SQL dinámica
    const query = `UPDATE productos SET ${setClause.join(', ')} WHERE id = $${counter} RETURNING *`;

    try {
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Producto con id ${id} no encontrado` });
        }

        res.json({ message: 'Producto actualizado', producto: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});


module.exports = router;
