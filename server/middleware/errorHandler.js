module.exports = function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message);

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const fields = {};
    Object.keys(err.errors).forEach((key) => {
      fields[key] = err.errors[key].message;
    });
    return res.status(400).json({ error: 'Validation failed', fields });
  }

  // Mongoose duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ error: `${field} already exists` });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const status = err.status || 500;
  return res.status(status).json({
    error: err.message || 'Internal server error',
    fields: err.fields || undefined,
  });
};
