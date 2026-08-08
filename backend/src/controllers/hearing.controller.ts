import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.util.js";
import APIError from "../utils/apiError.util.js";
import { createHearingService, getAllHearingsService, updateHearingService } from "../services/hearing.service.js";
import ApiResponse from "../utils/apiResponse.util.js";

export const createHearingController = asyncHandler(async (req:Request, res:Response) => {
    const caseId = req.params.caseId
    if(!caseId || typeof caseId !== 'string'){
        throw new APIError(400, 'Case Id is required')
    }
    const {date, notes} = req.body;

    const result = await createHearingService({caseId, hearingData:{date,notes}})

    return res.status(201).json(
        new ApiResponse(201, result, 'Hearing created successfully')
    )
})

export const getAllHearingsController = asyncHandler(async (req:Request, res:Response) => {
    const caseId = req.params.caseId
    if(!caseId || typeof caseId !== 'string'){
        throw new APIError(400, 'Case Id is required')
    }

    const result = await getAllHearingsService(caseId)

    return res.status(200).json(
        new ApiResponse(200, result, 'Hearings fetched successfully')
    )
})

export const updateHearingController = asyncHandler(async (req:Request, res:Response) => {
    const caseId = req.params.caseId
    if(!caseId || typeof caseId !== 'string'){
        throw new APIError(400, 'Case Id is required')
    }

    const hearingId = req.params.hearingId
    if(!hearingId || typeof hearingId !== 'string'){
        throw new APIError(400, 'Hearing Id is required')
    }

    const {date, notes} = req.body;

    const result = await updateHearingService({caseId, hearingId, hearingData:{date,notes}})

    return res.status(200).json(
        new ApiResponse(200, result, 'Hearing updated successfully')
    )
})