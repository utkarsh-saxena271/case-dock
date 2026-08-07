import z from "zod";

export const reviewJoinRequestSchema = z.object({
    action: z.enum(['approve', 'reject']),
    permissions: z.array(z.enum(['INVITE_MEMBERS', 'REMOVE_MEMBERS', 'EDIT_GROUP', 'DELETE_GROUP', 'READ_CASE', 'CREATE_CASE', 'UPDATE_CASE', 'DELETE_CASE'])).optional()
})

export const updateMemberSchema = z.object({
    role: z.enum(['ADMIN', 'MEMBER']).optional(),
    permissions: z.array(z.enum(['INVITE_MEMBERS', 'REMOVE_MEMBERS', 'EDIT_GROUP', 'DELETE_GROUP', 'READ_CASE', 'CREATE_CASE', 'UPDATE_CASE', 'DELETE_CASE'])).optional()
})