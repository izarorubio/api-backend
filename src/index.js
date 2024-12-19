
//EJEMPLO DE CREACIÓN DE API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const app = express();

const port = process.env.PORT || 10000;

// Middleware para parsear JSON
app.use(express.json());  // Necesario para leer req.body en formato JSON
app.use(
    cors({
        origin:'*',
    })
)

// Usar las rutas
app.use('/products', productRoutes);
app.use('/users', userRoutes); 
app.use('/categories', categoryRoutes);

app.listen(port, () => {
    console.log(`Server on port ${port}`); // Usar comillas invertidas para interpolación
});