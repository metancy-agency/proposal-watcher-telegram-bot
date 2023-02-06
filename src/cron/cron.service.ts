import cron from "node-cron";
import { Telegraf } from "telegraf";
import { IConfigService } from "../config/config.interface";
import { IBotContext } from "../context/context.interface";
import { IDatabaseService } from "../database/database.interface";
import { IProposalService } from "../proposal/proposal.interface";
import { ICronService } from "./cron.interface";

export class CronService implements ICronService {

    constructor(
        private readonly bot: Telegraf<IBotContext>,
        private readonly configService: IConfigService,
        private readonly databaseService: IDatabaseService,
        private readonly proposalService: IProposalService
    ) {}

    async init(): Promise<void> {
        cron.schedule('*/5 * * * * *', async () => {

            const dbProposalSnapshotIds = await this.databaseService.proposal.findMany();

            const ids: string[] = []

            dbProposalSnapshotIds.forEach((p) => {
                ids.push(`"${p.snapshotId}"`)
            })

            const { proposals } = await this.proposalService.getScores(ids)

            const newPropValues: any[] = []

            ids.forEach((id, i) => {
                newPropValues.push({
                    snapshotId: id,
                    yes: proposals[i].scores[0],
                    no: proposals[i].scores[1]
                })
            })

            dbProposalSnapshotIds.forEach(async (dbProposal, i) => {
                
                if (Math.floor(dbProposal.yes) !== Math.floor(newPropValues[i].yes)) {
                    await this.databaseService.proposal.update({
                        where: {
                            id: dbProposal.id
                        },
                        data: {
                            yes: newPropValues[i].yes
                        }
                    })
                    console.log('New vote: yes')
                    this.bot.telegram.sendMessage(dbProposal?.chatId!, 'New vote: yes')
                }

                if (Math.floor(dbProposal.no) !== Math.floor(newPropValues[i].no)) {
                    await this.databaseService.proposal.update({
                        where: {
                            id: dbProposal.id
                        },
                        data: {
                            no: newPropValues[i].no
                        }
                    })
                    console.log('New vote: no')
                    this.bot.telegram.sendMessage(dbProposal?.chatId!, 'New vote: no')
                }
            })
        })
    }
}