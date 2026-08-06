import type { Request, Response, NextFunction } from "express";
import APIError from "../utils/apiError.util.js";
import { type ZodType } from "zod";

const validate =
    (schema: ZodType) =>
        (req: Request, res: Response, next: NextFunction) => {
            const result = schema.safeParse(req.body);

            if (!result.success) {
                const errors = result.error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                }));
                return next(new APIError(400, errors[0]?.message || "Validation failed", errors));
            }

            next();
        };

export default validate;