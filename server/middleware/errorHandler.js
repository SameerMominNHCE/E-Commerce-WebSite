const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || 'Something went wrong',
    ...(err.details ? { details: err.details } : {}),
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
  });
};

module.exports = errorHandler;
