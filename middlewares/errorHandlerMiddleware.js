const globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

export { globalErrorHandler };
