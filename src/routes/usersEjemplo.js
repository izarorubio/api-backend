require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt'); //  bcrypt para encriptar contraseñas
const jwt = require('jsonwebtoken'); // jsonwebtoken para crear el JWT
const pool = require('../db');


const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    try {
        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contraseña, saltRounds);
        console.log('Hashed Password:', hashedPassword);

        // Guardar el usuario con la contraseña encriptada
        const result = await pool.query(
            'INSERT INTO usuarios (correo, contraseña) VALUES ($1, $2) RETURNING *',
            [correo, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
});

// Actualizar un usuario
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { correo, contraseña } = req.body;

    const setClause = [];
    const values = [];
    let counter = 1;

    if (correo) {
        setClause.push(`correo = $${counter}`);
        values.push(correo);
        counter++;
    }

    if (contraseña) {
        // Encriptar la nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contraseña, saltRounds);
        setClause.push(`contraseña = $${counter}`);
        values.push(hashedPassword);
        counter++;
    }

    if (setClause.length === 0) {
        return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar' });
    }

    values.push(id);

    const query = `UPDATE usuarios SET ${setClause.join(', ')} WHERE id = $${counter} RETURNING *`;

    try {
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Usuario con id ${id} no encontrado` });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
});

// Eliminar un usuario
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Usuario con id ${id} no encontrado` });
        }
        res.json({ message: `Usuario con id ${id} eliminado`, usuario: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
});

// Ruta para inicio de sesión
router.post('/login', async (req, res) => {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    try {
        // Verificar si el correo existe
        const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        const user = result.rows[0];
        
        if (!user) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        // Verificar si la contraseña es correcta
        const isMatch = await bcrypt.compare(contraseña, user.contraseña);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        // Crear un JWT
        const payload = { id: user.id, correo: user.correo }; // Puedes incluir más datos si es necesario
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Devolver el token
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

module.exports = router;
