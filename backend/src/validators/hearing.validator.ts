import z from "zod";

export const createHearingSchema = z.object({
    date: z.coerce.date(), // coerces incoming string (from JSON) into a real Date object
    notes: z.string().optional()
})

export const updateHearingSchema = z.object({
    date: z.coerce.date().optional(),
    notes: z.string().optional()
})