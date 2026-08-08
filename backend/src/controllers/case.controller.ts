import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.util.js";
import { createCaseService, deleteCaseService, getCaseByIdService, getMyCasesService, updateCaseService } from "../services/case.service.js";
import ApiResponse from "../utils/apiResponse.util.js";
import APIError from "../utils/apiError.util.js";

export const createCaseController = asyncHandler(async (req:Request, res:Response) => {
    const userId = req.user.id;
    const caseData = req.body;
    const result = await createCaseService({userId,caseData})

    return res.status(201).json(
        new ApiResponse(201, result, 'Case created successfully')
    )
})

export const getMyCasesController = asyncHandler(async (req:Request, res:Response) => {
    const userId = req.user.id
    const cases = await getMyCasesService(userId)

    return res.status(200).json(
        new ApiResponse(200, cases, 'Cases Fetched successfully')
    )
})

export const getCaseByIdController = asyncHandler(async (req:Request, res:Response) => {
    const caseId = req.params.caseId;
    if(!caseId || typeof caseId !== 'string'){
        throw new APIError(400, 'Case Id is required')
    }
    const result = await getCaseByIdService(caseId)

    return res.status(200).json(
        new ApiResponse(200, result, 'Case fetched successfully')
    )
})

export const updateCaseController = asyncHandler(async (req:Request,res:Response) => {
    const caseId = req.params.caseId
    if(!caseId || typeof caseId !== 'string'){
        throw new APIError(400, 'Case Id is required')
    }
    const {name, description, status} = req.body
    const data = {
        caseId,
        caseData:{
            name,description,status
        }
    }
    const result = await updateCaseService(data)

    return res.status(200).json(
        new ApiResponse(200,result,'Case updated successfully')
    )
})

export const deleteCaseController = asyncHandler(async (req:Request, res:Response) => {
    const caseId = req.params.caseId
    if(!caseId || typeof caseId !== 'string'){
        throw new APIError(400, 'Case Id is required')
    }

    const result = await deleteCaseService(caseId)

    return res.status(200).json(
        new ApiResponse(200, result, 'Case deleted successfully')
    )
})