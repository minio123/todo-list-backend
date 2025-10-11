const globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    status: "error",
    message: "Something went wrong",
    error: err.message,
  });
};

export { globalErrorHandler };
