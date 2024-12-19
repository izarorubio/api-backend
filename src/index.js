
//EJEMPLO DE CREACIÓN DE API

require('dotenv').config();
const express = require('express');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const app = express();

const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());  // Necesario para leer req.body en formato JSON

// Usar las rutas
app.use('/products', productRoutes);
app.use('/users', userRoutes); 

app.listen(port, () => {
    console.log(`Server on port ${port}`); // Usar comillas invertidas para interpolación
});