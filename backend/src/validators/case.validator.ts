import z from "zod";

export const createCaseSchema = z.object({
    name: z.string().min(2, "Case name must be at least 2 characters"),
    description: z.string().optional(),
    ownerType: z.enum(['PERSONAL', 'CHAMBER']),
    chamberId: z.string().optional(),
}).refine(
    (data) => {
        if (data.ownerType === 'CHAMBER') {
            return !!data.chamberId; // must be truthy (non-empty string) when CHAMBER
        }
        return true; // no constraint when PERSONAL
    },
    {
        message: "chamberId is required when ownerType is CHAMBER",
        path: ["chamberId"] // tells Zod which field the error should be attached to
    }
)

export const updateCaseSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'ON_HOLD', 'CLOSED']).optional()
})