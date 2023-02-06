import { PrismaClient } from "@prisma/client";

export interface IDatabaseService extends PrismaClient {
    init(): Promise<void>;
}