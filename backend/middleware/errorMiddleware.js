export function notFound(req, res, next) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  const status =
    err.code === 'LIMIT_FILE_SIZE'
      ? 413
      : err.name === 'ValidationError' || err.name === 'CastError' || err.name === 'MulterError'
        ? 400
        : err.statusCode || 500;
  const message =
    status >= 500
      ? 'تعذر إتمام العملية. يرجى المحاولة لاحقاً.'
      : err.code === 'LIMIT_FILE_SIZE'
        ? 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.'
        : err.message;
  res.status(status).json({ error: message });
}
