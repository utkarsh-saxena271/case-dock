import prisma from "../config/db.config.js";
import type { CreateHearing, UpdateHearing } from "../types/hearing.types.js";
import APIError from "../utils/apiError.util.js";

export const createHearingService = async (data:CreateHearing) => {
    const {caseId, hearingData} = data;
    const {date, notes} = hearingData;

    const hearing = await prisma.hearing.create({
        data:{
            caseId,
            date,
            ...(notes!==undefined && {notes})
        }
    })

    return hearing;
}

export const getAllHearingsService = async (caseId: string) => {
    const hearings = await prisma.hearing.findMany({
        where:{caseId},
        include:{
            documents:true
        },
        orderBy: {
            date: 'asc'
        }
    })

    return hearings;
}

export const updateHearingService = async (data:UpdateHearing) => {
    const {caseId, hearingId, hearingData} = data;
    const {date, notes} = hearingData;

    const checkHearing = await prisma.hearing.findFirst({
        where:{
            id:hearingId,
            caseId
        }
    })

    if(!checkHearing) throw new APIError(404, 'Hearing doesnt exist')


    const update = await prisma.hearing.update({
        where:{
            id:hearingId,
        },
        data:{
            ...(date!==undefined && {date}),
            ...(notes!==undefined && {notes})
        }
    })

    return update;
}