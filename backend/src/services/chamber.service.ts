import prisma from "../config/db.config.js";
import { Permission } from "../generated/prisma/enums.js";
import type { CreateChamber, DiscoverChambers, GetChamber, UpdateChamber } from "../types/chamber.types.js";
import APIError from "../utils/apiError.util.js";




export const createChamberService = async(data:CreateChamber) => {
    const {name, description} = data.chamberData;
    const userId = data.userId;

    const result = await prisma.$transaction(async(tx) => {
        const chamber = await tx.chamber.create({
            data:{
                name,description : description ?? null
            }
        })

        const membership = await tx.membership.create({
            data:{
                chamberId:chamber.id,
                userId,
                role:'OWNER',
                status:'ACTIVE',
                permissions:Object.values(Permission)
            }
        })

        return {chamber, membership};
    })

    return result;
}



export const getMyChambersService = async (userId: string) => {
    const result = await prisma.membership.findMany({
        where:{
            userId,
            status:'ACTIVE'
        },
        include:{
            chamber:true
        }
    })
    return result.map(m => ({
        ...m.chamber,
        role:m.role,
        permissions:m.permissions
    }))
}

export const getChamberByIdService = async (data:GetChamber) => {
    const {userId, chamberId} = data;
    const chamber = await prisma.chamber.findUnique({
        where: { id: chamberId },
        include: {
            memberships: {
                where: { status: 'ACTIVE' },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            userName: true,
                            email: true
                        }
                    }
                }
            }
        }
    });

    if(!chamber) throw new APIError(404, 'Chamber Not Found')

    return chamber;
}

export const updateChamberService = async (data: UpdateChamber) => {
    const { chamberId, name, description } = data;

    const chamber = await prisma.chamber.update({
        where: { id: chamberId },
        data: {
            ...(name && { name }),
            ...(description !== undefined && { description })
        }
    });

    return chamber;
}

export const deleteChamberService = async (chamberId:string) => {
    const result = await prisma.chamber.delete({
        where:{
            id:chamberId
        }
    })
    return result;
}


export const discoverChambersService = async (data: DiscoverChambers) => {
    const { q, page = 1, limit = 10 } = data;
    const skip = (page - 1) * limit;

    const where = q
        ? { name: { contains: q, mode: 'insensitive' as const } }
        : {};

    const [chambers, total] = await Promise.all([
        prisma.chamber.findMany({
            where,
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true
            },
            skip,
            take: limit
        }),
        prisma.chamber.count({ where })
    ]);

    return {
        chambers,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

export const getChamberCasesService = async (chamberId: string) => {
    const cases =  await prisma.case.findMany({
        where: { chamberId },
        orderBy: { createdAt: 'desc' }
    });

    return cases;
}