const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Validar contraseña segura
const isPasswordSecure = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

// Crear usuario
const createUser = async (req, res, next) => {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    if (!isPasswordSecure(contraseña)) {
        return res.status(400).json({
            error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.',
        });
    }

    try {
        // Verificar si el correo ya existe en la base de datos
        const existingUser = await pool.query('SELECT * FROM users WHERE correo = $1', [correo]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const result = await pool.query(
            'INSERT INTO users (correo, contraseña) VALUES ($1, $2) RETURNING *',
            [correo, hashedPassword]
        );

        const user = result.rows[0];
        const token = jwt.sign({ userId: user.id, correo: user.correo }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'Usuario creado correctamente', token });
    } catch (error) {
        next(error);
    }
};

// Iniciar sesión (Login)
const loginUser = async (req, res, next) => {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE correo = $1', [correo]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(contraseña, user.contraseña);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ userId: user.id, correo: user.correo }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        next(error);
    }
};

// Obtener todos los usuarios (solo para administración)
const getAllUsers = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, correo FROM users');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

// Modificar un usuario (solo para administración)
const updateUser = async (req, res, next) => {
    const { id } = req.params;
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    try {
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const result = await pool.query(
            'UPDATE users SET correo = $1, contraseña = $2 WHERE id = $3 RETURNING *',
            [correo, hashedPassword, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Usuario con id ${id} no encontrado` });
        }

        res.json({ message: 'Usuario actualizado correctamente', usuario: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// Eliminar un usuario (solo para administración)
const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Usuario con id ${id} no encontrado` });
        }
        res.json({ message: `Usuario con id ${id} eliminado`, usuario: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// Exportar controladores
module.exports = {
    createUser,
    loginUser,
    getAllUsers,
    updateUser,
    deleteUser,
};
