import { PrismaClient } from "@prisma/client";
import { IDatabaseService } from "./database.interface";

export class DatabaseService extends PrismaClient implements IDatabaseService {
    async init(): Promise<void> {
        await this.$connect();
    }
}