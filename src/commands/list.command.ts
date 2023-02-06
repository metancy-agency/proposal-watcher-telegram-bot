import { Telegraf } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { IConfigService } from "../config/config.interface";
import { IBotContext } from "../context/context.interface";
import { IDatabaseService } from "../database/database.interface";
import { IProposalService } from "../proposal/proposal.interface";
import { Command } from "./command.class";

export class ListCommand extends Command {
    btns: InlineKeyboardButton[][] = []
    constructor (
        bot: Telegraf<IBotContext>, 
        private readonly configService: IConfigService,
        private readonly databaseService: IDatabaseService,
        private readonly proposalService: IProposalService
    ) {
        super(bot);
    }

    handle(): void {
        this.bot.command('list', async (ctx) => {
            const proposals =  await this.databaseService.proposal.findMany()
            console.log(proposals)

            this.btns = []

            proposals.forEach((proposal) => {
                this.btns.push([{ text: proposal.title, callback_data: proposal.id }])
            })

            ctx.reply(
                `<b>Proposals watched:</b>`, 
                {
                    reply_markup: { inline_keyboard: this.btns },
                    parse_mode: 'HTML'
                }
            )
        })

        this.bot.action(/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/, async (ctx) => {
            const id = ctx.match[0]
            console.log(id)

            const proposal = await this.databaseService.proposal.findFirst({ where: { id } })

            // FIX
            function covertNumber(n: number): string {
                return n.toString().replace(/(.)(?=(\d{3})+$)/g,'$1,')
            }

            ctx.editMessageText(
                `<b>${proposal?.title}</b>\n\nId: ${proposal?.id}\nScores: ${covertNumber(proposal?.yes!)} | ${covertNumber(proposal?.no!)}`,
                {
                    reply_markup: { inline_keyboard: [ [ { text: 'Back', callback_data: 'back' } ] ] },
                    parse_mode: 'HTML'
                }
            )

            this.bot.action('back', (ctx) => {
                ctx.editMessageText(
                    `<b>Proposals watched:</b>`, 
                    {
                        reply_markup: { inline_keyboard: this.btns },
                        parse_mode: 'HTML'
                    }
                )
            })
        })
    }
}