import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.util.js";
import { createJoinRequestService, deleteMemberService, getJoinRequestsService, getMembersService, reviewJoinRequestService, updateMemberService } from "../services/membership.service.js";
import APIError from "../utils/apiError.util.js";
import ApiResponse from "../utils/apiResponse.util.js";

export const createJoinRequestController = asyncHandler(async (req:Request, res:Response) => {
    const userId = req.user.id;
    const chamberId = req.params.chamberId;
    if (!chamberId || typeof chamberId !== 'string') {
        throw new APIError(400, 'Chamber Id is required')
    }
    const data = await createJoinRequestService({userId,chamberId})

    return res.status(201).json(
        new ApiResponse(201, data, 'Request sent successfully')
    )
})

export const getJoinRequestsController = asyncHandler(async (req:Request,res:Response) => {
    const chamberId = req.params.chamberId;
    if (!chamberId || typeof chamberId !== 'string') {
        throw new APIError(400, 'Chamber Id is required')
    }
    const data = await getJoinRequestsService(chamberId)

    return res.status(200).json(
        new ApiResponse(200, data, 'Fetched all join requests')
    )
})

export const reviewJoinRequestController = asyncHandler(async (req:Request, res:Response) => {
    const chamberId = req.params.chamberId;
    const membershipId = req.params.membershipId;
    if (!chamberId || typeof chamberId !== 'string') {
        throw new APIError(400, 'Chamber Id is required')
    }
    if (!membershipId || typeof membershipId !== 'string') {
        throw new APIError(400, 'Membership Id is required')
    }
    const {action, permissions} = req.body
    const data = await reviewJoinRequestService({chamberId, membershipId, reqData: {action, permissions}})

    return res.status(200).json(
        new ApiResponse(200, data, `${action == 'approve' ? 'Join request approved' : 'Join request rejected'}`)
    )
})


export const getMembersController = asyncHandler(async (req:Request, res:Response) => {
    const chamberId = req.params.chamberId;
    if(!chamberId || typeof chamberId !== 'string'){
        throw new APIError(400,'Chamber Id is required')
    }
    const members = await getMembersService(chamberId)
    return res.status(200).json(
        new ApiResponse(200, members, 'Fetched all members successfully')
    )
})

export const updateMemberController = asyncHandler(async (req:Request, res:Response) => {
    const chamberId = req.params.chamberId;
    const membershipId = req.params.membershipId;
    const reqData = req.body
    if (!chamberId || typeof chamberId !== 'string') {
        throw new APIError(400, 'Chamber Id is required')
    }
    if (!membershipId || typeof membershipId !== 'string') {
        throw new APIError(400, 'Membership Id is required')
    }
    const data = await updateMemberService({chamberId,membershipId,reqData})

    return res.status(200).json(
        new ApiResponse(200, data, 'Member updated successfully')
    )
})

export const deleteMemberController = asyncHandler(async (req:Request, res:Response) => {
    const chamberId = req.params.chamberId;
    const membershipId = req.params.membershipId;
    if (!chamberId || typeof chamberId !== 'string') {
        throw new APIError(400, 'Chamber Id is required')
    }
    if (!membershipId || typeof membershipId !== 'string') {
        throw new APIError(400, 'Membership Id is required')
    }
    const data = await deleteMemberService({chamberId,membershipId});

    return res.status(200).json(
        new ApiResponse(200, data, 'Member deleted successfully')
    )
})