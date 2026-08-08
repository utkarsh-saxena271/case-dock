export interface CreateCaseDocument {
    caseId: string,
    userId: string,
    filePath: string,
    customName: string
}
export interface CreateHearingDocument {
    hearingId: string,
    userId: string,
    filePath: string,
    customName: string
}

export interface DeleteDocument {
    caseId: string,
    documentId: string
}