const express = require('express');
const router = express.Router();


// Array de productos (simulación de base de datos)
let products =[
    { id:1, name:'Product 1', price:100, description: 'Description 1'},
    { id:2, name:'Product 2', price:200, description: 'Description 2'},
    { id:3, name:'Product 3', price:300, description: 'Description 3'}
];

// Ruta GET para obtener todos los productos
router.get ('/', (req,res) => {
    res.json(products);
});

// Ruta GET para obtener un producto por ID
router.get('/:id',(req,res) => {
    const product = products.find(product=> product.id === parseInt(req.params.id));
    if (product){
        res.json(product);
    }else{
        res.status(404).send('Producto no encontrado');
    }
});

// Ruta POST para agregar un nuevo producto
router.post('/', (req,res) => {
    const { name,  price, description } = req.body;
    const dataMissing = !name || !price || !description;
    if (dataMissing) {
        return res.status(400).send('Faltan datos obligatorios (name, price, description)');
    }

    // Crear el nuevo producto
    const newProduct = { id: products.length + 1, name, price, description };

    // Añadirlo al array de productos
    products.push (newProduct);
    res.status(201).json(newProduct);//201 es que el objeto se ha creado correctamente
});

router.put('/:id', (req,res) => {
    const { name,  price, description } = req.body;
    const dataMissing = !name || !price || !description;
    if (dataMissing) return res.status(400).send('Faltan datos');

    const index=products.findIndex(product => product.id === parseInt(req.params.id));

    if (index===-1) return res.status(404).sendStatus('Producto no encontrado');

    products[index] = {id: parseInt(req.params.id), ...req.body};
    res.status(204).json(products[index]);
});

router.patch('/:id', (req,res) => {
    const index = products.findIndex(product => product.id === parseInt(req.params.id));

    if (index===-1) return res.status(404).sendStatus('Producto no encontrado');

    products[index] = { ...products[index], ...req.body};
    res.status(204).json(products[index]);
});

router.delete ('/:id', (req,res) => {
    const index = products.findIndex(product => product.id === parseInt(req.params.id));

    if (index===-1) return res.status(404).sendStatus('Producto no encontrado');

    products.splice(index, 1);
    res.status(204).send();
});

module.exports=router;
