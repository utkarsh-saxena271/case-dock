import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.util.js";
import { createChamberService, deleteChamberService, discoverChambersService, getChamberByIdService, getMyChambersService, updateChamberService } from "../services/chamber.service.js";
import ApiResponse from "../utils/apiResponse.util.js";
import APIError from "../utils/apiError.util.js";

export const createChamberController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const chamberData = req.body;
    const result = await createChamberService({ userId, chamberData })

    return res.status(201).json(
        new ApiResponse(201, result, 'Chamber created successfully')
    )
})

export const getMyChambersController = asyncHandler(async (req: Request, res: Response) => {
    const result = await getMyChambersService(req.user.id)

    return res.status(200).json(
        new ApiResponse(200, result, 'Fetched all joined chambers successfully')
    )
})

export const getChamberByIdController = asyncHandler(async (req:Request, res:Response) => {
    const userId = req.user.id
    const chamberId = req.params.chamberId
    if (!chamberId || typeof chamberId !== 'string') {
        throw new APIError(400, 'Chamber Id is required')
    }
    const result = await getChamberByIdService({userId, chamberId})

    return res.status(200).json(
        new ApiResponse(200, result, 'Chamber fetched successfully')
    )
})

export const updateChamberController = asyncHandler(async (req: Request, res: Response) => {
    const chamberId = req.params.chamberId;

    if (!chamberId || typeof chamberId !== 'string') {
        throw new APIError(400, 'Chamber Id is required')
    }
    const {name, description} = req.body
    const result = await updateChamberService({ chamberId, name, description })

    return res.status(200).json(
        new ApiResponse(200, result, 'Chamber updated successfully')
    )
})

export const deleteChamberController = asyncHandler(async (req: Request, res: Response) => {
    const chamberId = req.params.chamberId;

    if (!chamberId || typeof chamberId !== 'string') {
        throw new APIError(400, 'Chamber Id is required')
    }

    const result = await deleteChamberService(chamberId);

    return res.status(200).json(
        new ApiResponse(200, result, 'Chamber Deleted Successfully')
    )
})


export const discoverChambersController = asyncHandler(async (req: Request, res: Response) => {
    const q = req.query.q as string | undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await discoverChambersService({ ...(q !== undefined && { q }), page, limit });

    return res.status(200).json(
        new ApiResponse(200, result, 'Chambers fetched successfully')
    )
})