import type { CaseOwnerType, CaseStatus } from "../generated/prisma/enums.js"

export interface CreateCase {
    userId: string,
    caseData: {
        name: string,
        description?: string,
        ownerType: CaseOwnerType,
        chamberId?: string
    }
}

export interface UpdateCase {
    caseId:string,
    caseData: {
        name?: string,
        description?: string,
        status?:CaseStatus
    }
}