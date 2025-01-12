const errorHandler = (err, req, res, next) => {
    console.error(err);
    if (err.code === '23505') {
        return res.status(409).json({ error: 'Recurso duplicado' });
    }
    res.status(err.status || 500).json({
        error: err.message || 'Error en el servidor',
    });
};

module.exports = errorHandler;
