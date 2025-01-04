require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const port = process.env.PORT || 10000;

// Middleware para parsear JSON
app.use(express.json());

// Configuración de CORS con variables de entorno
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || '*', // Permitir origen específico
    })
)

// Usar las rutas
app.use('/products', productRoutes);
app.use('/users', userRoutes); 
app.use('/categories', categoryRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});