import z from "zod";

export const createChamberSchema = z.object({
    name: z.string().min(2, "Chamber name must be at least 2 characters"),
    description: z.string().optional()
})


export const updateChamberSchema = z.object({
    name: z.string().min(2, "Chamber name must be at least 2 characters").optional(),
    description: z.string().optional()
})