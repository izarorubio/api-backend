require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});

// Crear un usuario
router.post('/', async (req, res) => {
    const { correo, contraseña } = req.body;
    if (!correo || !contraseña) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }
    try {
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const result = await pool.query(
            'INSERT INTO users (correo, contraseña) VALUES ($1, $2) RETURNING *',
            [correo, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
});

// Ruta de inicio de sesión
router.post('/login', async (req, res) => {
    const { correo, contraseña } = req.body;
    if (!correo || !contraseña) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE correo = $1', [correo]);
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(contraseña, user.contraseña))) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
        const token = jwt.sign({ id: user.id, correo: user.correo }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

module.exports = router;