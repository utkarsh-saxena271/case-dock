import prisma from "../config/db.config.js";
import type { CreateCase, UpdateCase } from "../types/case.types.js";
import APIError from "../utils/apiError.util.js";



export const createCaseService = async (data: CreateCase) => {
    const { userId, caseData } = data;
    const { name, description, ownerType, chamberId } = caseData;

    if (ownerType === 'CHAMBER') {
        if (!chamberId) throw new APIError(400, 'Chamber Id is required');

        const membership = await prisma.membership.findFirst({
            where: { userId, chamberId, status: 'ACTIVE' }
        });

        if (!membership) throw new APIError(403, 'You are not an active member of this chamber');
        if (!membership.permissions.includes('CREATE_CASE')) {
            throw new APIError(403, 'You do not have permission to create cases in this chamber');
        }
    }

    const caseCreated = await prisma.case.create({
        data: {
            name,
            ...(description !== undefined && { description }),
            ownerType,
            chamberId: ownerType === 'CHAMBER' ? (chamberId ?? null) : null,
            personalOwnerId: ownerType === 'PERSONAL' ? userId : null,
        }
    });

    return caseCreated;
}

export const getMyCasesService = async (userId:string) => {
    const cases = await prisma.case.findMany({
        where:{
            OR:[
                {ownerType : 'PERSONAL', personalOwnerId:userId},
                {
                    ownerType:'CHAMBER',
                    chamber:{
                        memberships:{
                            some:{
                                userId,
                                status:'ACTIVE',
                                permissions:{has:'READ_CASE'}
                            }
                        }
                    }
                }
            ]
        },
        orderBy:{
            createdAt:'desc'
        }
    })
    return cases
}


export const getCaseByIdService = async (caseId:string) => {
    const caseFetched = await prisma.case.findUnique({
        where:{
            id:caseId
        },
        include:{
            hearings:{
                orderBy:{date:'asc'},
                include:{
                    documents:true
                }
            },
            documents:{
                where:{hearingId : null}
            }
        }
    })
    if (!caseFetched)  throw new APIError(404, "Case not found");

    return caseFetched;
}

export const updateCaseService = async(data:UpdateCase) => {
    const {caseId, caseData} = data;
    const {name, description, status} = caseData
    const updateCase = await prisma.case.update({
        where:{
            id:caseId,
        },
        data:{
            ...(name!==undefined && {name}),
            ...(description!==undefined && {description}),
            ...(status!==undefined&&{status})
        }
    })

    return updateCase;
}

export const deleteCaseService = async (caseId: string) => {
    const deleteCase = await prisma.case.delete({
        where:{
            id:caseId
        }
    })

    return deleteCase;
}