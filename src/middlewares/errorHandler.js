const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Ocurrió un error en el servidor. Por favor, inténtelo de nuevo más tarde.',
    });
};

module.exports = errorHandler;
