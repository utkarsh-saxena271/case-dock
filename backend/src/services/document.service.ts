import prisma from "../config/db.config.js";
import type { CreateCaseDocument, CreateHearingDocument, DeleteDocument } from "../types/document.types.js";
import APIError from "../utils/apiError.util.js";
import { deleteFromImagekit } from "../utils/deleteFromImagekit.util.js";
import { uploadToImageKit } from "../utils/uploadToImagekit.util.js";

export const createCaseDocumentService = async (data: CreateCaseDocument) => {
    const { caseId, userId, filePath, customName } = data;

    const { url, fileId } = await uploadToImageKit(filePath, customName);

    const document = await prisma.document.create({
        data: {
            customName,
            fileUrl: url,
            fileId,
            caseId,
            uploadedById: userId
        }
    });

    return document;
}

export const getCaseDocumentsService = async (caseId: string) => {
    const documents = await prisma.document.findMany({
        where: {
            OR: [
                { caseId },
                { hearing: { caseId } }
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return documents
}

export const createHearingDocumentService = async (data: CreateHearingDocument) => {
    const { hearingId, userId, filePath, customName } = data;

    const { url, fileId } = await uploadToImageKit(filePath, customName);

    const document = await prisma.document.create({
        data: {
            customName,
            fileUrl: url,
            fileId,
            hearingId,
            uploadedById: userId
        }
    });

    return document;
}

export const getHearingDocumentsService = async (hearingId: string) => {
    const documents = await prisma.document.findMany({
        where: {
            hearingId
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return documents
}

export const deleteDocumentService = async (data: DeleteDocument) => {
    const { caseId, documentId } = data
    const documentExists = await prisma.document.findFirst({
        where: {
            id: documentId,
            OR: [
                { caseId },
                { hearing: { caseId } }
            ]
        }
    })
    if (!documentExists) throw new APIError(404, 'Document does not exist')

    const del = await deleteFromImagekit(documentExists.fileId)
    const deleteDocument = await prisma.document.delete({
        where: {
            id: documentId
        }
    })
    return { deleteDocument, del };
}