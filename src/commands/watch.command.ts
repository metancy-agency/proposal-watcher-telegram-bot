import axios from "axios";
import { Telegraf } from "telegraf";
import { IConfigService } from "../config/config.interface";
import { IBotContext } from "../context/context.interface";
import { IDatabaseService } from "../database/database.interface";
import { IProposalService } from "../proposal/proposal.interface";
import { Command } from "./command.class";

export class WatchCommand extends Command {
    constructor (
        bot: Telegraf<IBotContext>, 
        private readonly configService: IConfigService,
        private readonly databaseService: IDatabaseService,
        private readonly proposalService: IProposalService
    ) {
        super(bot);
    }

    handle(): void {
        this.bot.command('watch', async (ctx) => {

            const args = ctx.update.message.text.split(' ')
            const linkArg = args[1]

            if (!linkArg) {
                return ctx.reply('Sent me proposal url. Example: https://governance.decentraland.org/proposal/?id=78abd320-8730-11ed-b125-310d98b69cd1')
            }

            const proposalsInDbCount = await this.databaseService.proposal.count();

            const MAX_PROPOSALS_FOR_WATCHING = this.configService.get('MAX_PROPOSALS_FOR_WATCHING')

            if (proposalsInDbCount > +MAX_PROPOSALS_FOR_WATCHING) {
                return ctx.reply(`Max proposals for watching: ${MAX_PROPOSALS_FOR_WATCHING}`)
            }

            const idParamInUrl = linkArg.slice(-36)
            const { data } = await axios.get(`https://governance.decentraland.org/api/proposals/${idParamInUrl}`)

            const snapshotId = data.data.snapshot_id
            const { proposal } = await this.proposalService.fetchProposalData(snapshotId)

            await this.databaseService.proposal.create({
                data: {
                    id: idParamInUrl,
                    snapshotId,
                    chatId: ctx.from.id,
                    title: proposal.title,
                    start: proposal.start,
                    end: proposal.end,
                    yes: proposal.scores[0],
                    no: proposal.scores[1]
                }
            })

            ctx.reply(`${proposal.title} has been added to watch list (${proposalsInDbCount + 1}/${MAX_PROPOSALS_FOR_WATCHING})`)
        })
    }
}