import { PrismaPg } from "../../node_modules/@prisma/adapter-pg/dist/index.js";
import { envConfig } from "./env.config.js";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = envConfig.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const adapter = new PrismaPg({ connectionString })

const prisma = globalForPrisma.prisma ?? new PrismaClient({
    adapter
})

if (envConfig.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;