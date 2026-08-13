function errorHandler(err, req, res, next) {
  console.error(err);

  res.status(err.statusCode || 400).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
}

module.exports = errorHandler;