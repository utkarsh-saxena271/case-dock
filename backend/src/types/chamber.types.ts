export interface CreateChamber {
    userId : string,
    chamberData:{
        name:string,
        description?:string
    }
}

export interface UpdateChamber {
    chamberId: string,
    name?: string,
    description?: string
}

export interface GetChamber{
    userId:string,
    chamberId:string
}

export interface DiscoverChambers {
    q?: string;
    page?: number;
    limit?: number;
}