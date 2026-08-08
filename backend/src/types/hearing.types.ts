export interface CreateHearing{
    caseId:string,
    hearingData:{
        date:Date,
        notes?:string
    }
}

export interface UpdateHearing {
    caseId:string,
    hearingId:string,
    hearingData:{
        date?:Date,
        notes?:string
    }
}