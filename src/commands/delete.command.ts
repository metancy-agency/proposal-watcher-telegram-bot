import { Telegraf } from "telegraf";
import { IConfigService } from "../config/config.interface";
import { IBotContext } from "../context/context.interface";
import { IDatabaseService } from "../database/database.interface";
import { Command } from "./command.class";

export class DeleteCommand extends Command {
    constructor (
        bot: Telegraf<IBotContext>, 
        private readonly configService: IConfigService,
        private readonly databaseService: IDatabaseService
    ) {
        super(bot);
    }

    handle(): void {
        this.bot.command('delete', async (ctx) => {

            try {
                const args = ctx.update.message.text.split(' ')
                const id = args[1]

                if (!id) {
                    return ctx.reply("Sent me proposal's url")
                } 

                const proposalsInDbCount = await this.databaseService.proposal.count();

                if (proposalsInDbCount === 0) {
                    return ctx.reply('Watch list is empty')
                }

                if (typeof id !== 'string') {
                    return ctx.reply("Proposal id must be string")
                }

                const uuidPattern = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i

                if (!uuidPattern.test(id)) {
                    return ctx.reply("Proposal id must be correct uuid string")
                }

                const recordCandidate = await this.databaseService.proposal.findFirst({ where: { id }})

                if (!recordCandidate) {
                    return ctx.reply("Proposal must be exist")
                }

                await this.databaseService.proposal.delete({ where: { id } })

                ctx.reply(`Proposal has been deleted from watch list`)
            } catch (err: any) {
                console.error(err)
                ctx.reply(err.message)
            }
        })
    }
}