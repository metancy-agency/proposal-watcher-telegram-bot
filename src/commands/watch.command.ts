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

            try {
                const args = ctx.update.message.text.split(' ')
                const linkArg = args[1]

                if (!linkArg) {
                    return ctx.reply('Sent proposal url')
                }

                const proposalsInDbCount = await this.databaseService.proposal.count();

                const MAX_PROPOSALS_FOR_WATCHING = +this.configService.get('MAX_PROPOSALS_FOR_WATCHING')

                if (proposalsInDbCount > MAX_PROPOSALS_FOR_WATCHING) {
                    return ctx.reply(`Max watched proposals is ${MAX_PROPOSALS_FOR_WATCHING}`)
                }

                const url = new URL(linkArg)
                const params = url.searchParams
                const id = params.get('id')

                if (!id) {
                    return ctx.reply(`Requared id param`)
                }

                const uuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i

                if (!uuidPattern.test(id)) {
                    return ctx.reply("Proposal id must be correct uuid string")
                }

                const recordCandidate = await this.databaseService.proposal.findFirst({ where: { id }})

                if (recordCandidate) {
                    return ctx.reply('Proposal already exist in watch list')
                }

                const { data } = await axios.get(`https://governance.decentraland.org/api/proposals/${id}`)

                const snapshotId = data.data.snapshot_id
                const { proposal } = await this.proposalService.fetchProposalData(snapshotId)

                await this.databaseService.proposal.create({
                    data: {
                        id,
                        snapshotId,
                        chatId: ctx.from.id,
                        title: proposal.title,
                        start: proposal.start,
                        end: proposal.end,
                        yes: proposal.scores[0],
                        no: proposal.scores[1]
                    }
                })

                ctx.reply(
                    `*${proposal.title}* has been added to watch list (${proposalsInDbCount + 1}/${MAX_PROPOSALS_FOR_WATCHING})`,
                    { parse_mode: 'Markdown' }
                )
            } catch (err: any) {
                console.error(err)
                ctx.reply(err.message)
            }
        })
    }
}