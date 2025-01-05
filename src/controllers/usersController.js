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
        // Verificar si el correo ya está registrado
        const existingUser = await pool.query('SELECT * FROM users WHERE correo = $1', [correo]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }
         // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);
         // Insertar el usuario, no es necesario enviar el `id` (la base de datos lo generará automáticamente)
        const result = await pool.query(
            'INSERT INTO users (correo, contraseña) VALUES ($1, $2) RETURNING *',
            [correo, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

// Modificar un usuario
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

const loginUser = async (req, res, next) => {
    const { correo, contraseña } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE correo = $1', [correo]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isPasswordValid = await bcrypt.compare(contraseña, user.rows[0].contraseña);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        next(error);
    }
};

// Eliminar un usuario
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
    getAllUsers,
    updateUser,
    deleteUser,
    loginUser,
};
