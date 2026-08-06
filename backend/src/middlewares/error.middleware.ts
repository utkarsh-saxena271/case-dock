import type { NextFunction, Request, Response } from "express";
import ApiError from "../utils/apiError.util.js";

const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode =
    err instanceof ApiError ? err.statusCode : 500;

  const message =
    err.message || "Internal Server Error";
  const errors = 
    err instanceof ApiError ? err.errors : [];


  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

export default errorHandler;