const globalErrorHandler = (err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

export { globalErrorHandler };
