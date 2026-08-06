import type { Request, Response, NextFunction } from "express";
import { type ZodType } from "zod";

import APIError from "../utils/apiError.util.js";

const validate =
    (schema: ZodType) =>
        (req: Request, _res: Response, next: NextFunction) => {
            const result = schema.safeParse(req.body);

            if (!result.success) {
                const errors = result.error.issues.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                }));
                return next(new APIError(400, errors[0]?.message || "Validation failed", errors));
            }
            req.body = result.data;
            next();
        };

export default validate;