import z from "zod";

export const uploadDocumentSchema = z.object({
    customName: z.string().min(1, "Document name is required").optional()
})