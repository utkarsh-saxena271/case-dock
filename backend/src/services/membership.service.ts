import prisma from "../config/db.config.js";
import type { Permission, Role } from "../generated/prisma/enums.js";
import APIError from "../utils/apiError.util.js";

interface CreateJoinRequest{ 
    userId:string,
    chamberId:string
}

interface ReviewJoinRequest{
    chamberId:string,
    membershipId:string,
    reqData:{
        action: 'approve' | 'reject',
        permissions?: Permission[]
    }
}

interface UpdateMember{
    chamberId:string,
    membershipId:string,
    reqData:{
        role?: Extract<Role,'ADMIN' | 'MEMBER'>,
        permissions?: Permission[]
    }
}

interface DeleteMember{
    chamberId:string,
    membershipId:string,
}

export const createJoinRequestService = async (data:CreateJoinRequest) => {
    const {userId, chamberId} = data;
    const membership = await prisma.membership.findUnique({
        where:{
            userId_chamberId:{userId,chamberId}
        }
    })

    if(membership && membership.status === 'ACTIVE') throw new APIError(400, 'Already a member')
    if(membership && membership.status === 'PENDING') throw new APIError(400, 'Already sent a request')

    const request = await prisma.membership.create({
        data:{
            userId,
            chamberId,
            status:'PENDING'
        }
    })

    return request;
}

export const getJoinRequestsService = async (chamberId:string) => {
    const joinRequests = await prisma.membership.findMany({
        where:{
            chamberId,
            status:'PENDING'
        },
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
    })
    // if(joinRequests.length === 0) throw new APIError(404, 'No join requests')
    return joinRequests;
}

export const reviewJoinRequestService = async (data:ReviewJoinRequest) => {
    const {chamberId, membershipId, reqData} = data;
    const permissions = reqData.permissions;
    const checkReq = await prisma.membership.findFirst({
        where:{
            id:membershipId,
            chamberId,
            status:'PENDING'
        }
    })
    if(!checkReq) throw new APIError(404, 'Join request not found')
    
    if (reqData.action === 'reject') {
        await prisma.membership.delete({ where: { id: membershipId } });
        return { message: 'Join request rejected' };
    }

    const updated = await prisma.membership.update({
        where: { id: membershipId },
        data: {
            status: 'ACTIVE',
            ...(permissions != null && { permissions })
        }
    });

    return updated;
}


export const getMembersService = async (chamberId: string) => {
    const members = await prisma.membership.findMany({
        where:{
            chamberId,
            status:'ACTIVE'
        },
        include:{
            user : {
                select : {
                    id: true,
                    firstName: true,
                    lastName: true,
                    userName: true,
                    email: true
                }
            }
        }
    })

    return members;
}

export const updateMemberService = async (data:UpdateMember) => {
    const {chamberId, membershipId, reqData} = data;
    const {role, permissions} = reqData
    const existing = await prisma.membership.findFirst({
        where: { id: membershipId, chamberId, status: 'ACTIVE' }
    });

    if (!existing) throw new APIError(404, 'Member not found');

    const result = await prisma.membership.update({
        where: { id: membershipId },
        data: {
            ...(role !== undefined && { role }),
            ...(permissions !== undefined && { permissions })
        }
    });

    return result;
}

export const deleteMemberService = async (data:DeleteMember) => {
    const {chamberId, membershipId} = data;
    const existing = await prisma.membership.findFirst({
        where: { id: membershipId, chamberId, status: 'ACTIVE' }
    });

    if (!existing) throw new APIError(404, 'Member not found');
    if (existing.role === 'OWNER') throw new APIError(400, 'Cannot remove chamber owner')

    const result = await prisma.membership.delete({
        where: {
            id:membershipId,
        }
    });

    return result;
}