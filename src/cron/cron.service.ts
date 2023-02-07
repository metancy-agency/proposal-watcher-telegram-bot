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

            dbProposalSnapshotIds.forEach(async (_, i) => {

                const newYes = Math.floor(newPropValues[i].yes)
                const newNo = Math.floor(newPropValues[i].no)

                const oldYes =  Math.floor(dbProposalSnapshotIds[i].yes)
                const oldNo = Math.floor(dbProposalSnapshotIds[i].no)
                
                if (oldYes !== newYes || oldNo !== newNo) {
                    await this.databaseService.proposal.update({
                        where: {
                            id: dbProposalSnapshotIds[i].id
                        },
                        data: {
                            yes: newPropValues[i].yes,
                            no: newPropValues[i].no
                        }
                    })

                    function covertNumber(n: number): string {
                        return n.toString().replace(/(.)(?=(\d{3})+$)/g,'$1,')
                    }

                    this.bot.telegram.sendMessage(
                        dbProposalSnapshotIds[i].chatId!,
                        `<b>New voted in ${dbProposalSnapshotIds[i].title}</b>\n\nYes: ${covertNumber(newYes)}\nNo: ${covertNumber(newNo)}`,
                        {
                            parse_mode: 'HTML'
                        }
                    )
                }
            })
        })
    }
}