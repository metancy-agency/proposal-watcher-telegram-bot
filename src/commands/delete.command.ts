import { Telegraf } from "telegraf";
import { IConfigService } from "../config/config.interface";
import { IBotContext } from "../context/context.interface";
import { IDatabaseService } from "../database/database.interface";
import { IProposalService } from "../proposal/proposal.interface";
import { Command } from "./command.class";


export class DeleteCommand extends Command {
    constructor (
        bot: Telegraf<IBotContext>, 
        private readonly configService: IConfigService,
        private readonly databaseService: IDatabaseService,
        private readonly proposalService: IProposalService
    ) {
        super(bot);
    }

    handle(): void {
        this.bot.command('delete', async (ctx) => {

            const args = ctx.update.message.text.split(' ')
            const linkArg = args[1]

            if (!linkArg) {
                return ctx.reply('Sent me proposal url. Example: https://governance.decentraland.org/proposal/?id=78abd320-8730-11ed-b125-310d98b69cd1')
            }

            const proposalsInDbCount = await this.databaseService.proposal.count();

            if (proposalsInDbCount > 5) {
                return ctx.reply('Max watched proposals: 5')
            }
            const idParamInUrl = linkArg.slice(-36)

            await this.databaseService.proposal.delete({
                where: {
                    id: idParamInUrl
                }
            })

            ctx.reply(`Proposal has been deleted from watch list`)
        })
    }
}