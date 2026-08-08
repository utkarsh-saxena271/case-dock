import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.util.js";
import APIError from "../utils/apiError.util.js";
import { createCaseDocumentService, createHearingDocumentService, deleteDocumentService, getCaseDocumentsService, getHearingDocumentsService } from "../services/document.service.js";
import ApiResponse from "../utils/apiResponse.util.js";

export const createCaseDocumentController = asyncHandler(async (req: Request, res: Response) => {
    const caseId = req.params.caseId;
    if (!caseId || typeof caseId !== 'string') {
        throw new APIError(400, 'Case Id is required');
    }

    if (!req.file) {
        throw new APIError(400, 'File is required');
    }

    const customName = req.body.customName || req.file.originalname;

    const result = await createCaseDocumentService({
        caseId,
        userId: req.user.id,
        filePath: req.file.path,
        customName
    });

    return res.status(201).json(
        new ApiResponse(201, result, 'Document uploaded successfully')
    )
})


export const getCaseDocumentsController = asyncHandler(async (req:Request, res:Response) => {
    const caseId = req.params.caseId;
    if (!caseId || typeof caseId !== 'string') {
        throw new APIError(400, 'Case Id is required');
    }

    const documents = await getCaseDocumentsService(caseId)

    return res.status(200).json(
        new ApiResponse(200, documents, 'Documents fetched successfully')
    )
})

export const createHearingDocumentController = asyncHandler(async (req: Request, res: Response) => {
    const hearingId = req.params.hearingId;
    if (!hearingId || typeof hearingId !== 'string') {
        throw new APIError(400, 'Case Id is required');
    }

    if (!req.file) {
        throw new APIError(400, 'File is required');
    }

    const customName = req.body.customName || req.file.originalname;

    const result = await createHearingDocumentService({
        hearingId,
        userId: req.user.id,
        filePath: req.file.path,
        customName
    });

    return res.status(201).json(
        new ApiResponse(201, result, 'Document uploaded successfully')
    )
})


export const getHearingDocumentsController = asyncHandler(async (req:Request, res:Response) => {
    const hearingId = req.params.hearingId;
    if (!hearingId || typeof hearingId !== 'string') {
        throw new APIError(400, 'Case Id is required');
    }

    const documents = await getHearingDocumentsService(hearingId)

    return res.status(200).json(
        new ApiResponse(200, documents, 'Documents fetched successfully')
    )
})


export const deleteDocumentController = asyncHandler(async (req:Request,res:Response) => {
    const caseId = req.params.caseId;
    if (!caseId || typeof caseId !== 'string') {
        throw new APIError(400, 'Case Id is required');
    }

    const documentId = req.params.documentId;
    if (!documentId || typeof documentId !== 'string') {
        throw new APIError(400, 'Case Id is required');
    }

    const result = await deleteDocumentService({caseId,documentId})

    res.status(200).json(
        new ApiResponse(200, result, 'Document deleted successfully')
    )
})