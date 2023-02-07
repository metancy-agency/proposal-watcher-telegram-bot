import { Telegraf } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { IBotContext } from "../context/context.interface";
import { IDatabaseService } from "../database/database.interface";
import { Command } from "./command.class";

export class ListCommand extends Command {
    btns: InlineKeyboardButton[][] = []
    constructor (
        bot: Telegraf<IBotContext>, 
        private readonly databaseService: IDatabaseService
    ) {
        super(bot);
    }

    handle(): void {
        this.bot.command('list', async (ctx) => {
            const proposals =  await this.databaseService.proposal.findMany()

            if (proposals.length === 0) {
                return ctx.reply(
                    `<b>Empty watch list</b>`, 
                    { parse_mode: 'HTML'}
                )
            }

            this.btns = []

            proposals.forEach((proposal) => {
                const { title, id } = proposal
                this.btns.push([{ text: title, callback_data: id }])
            })

            ctx.reply(
                `*Proposals watched:*`, 
                {
                    reply_markup: { inline_keyboard: this.btns },
                    parse_mode: 'Markdown'
                }
            )
        })

        const idPatern = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/

        this.bot.action(idPatern, async (ctx) => {
            const argId = ctx.match[0]

            const proposalCandidate = await this.databaseService.proposal.findFirst({ 
                where: { 
                    id: argId 
                },
                select: {
                    title: true, 
                    id: true, 
                    snapshotId: true, 
                    yes: true, 
                    no: true
                }
            })

            if (!proposalCandidate) {
                return ctx.reply(`Proposal with id ${argId} not found`)
            }

            const { title, id, snapshotId, yes, no } = proposalCandidate

            const governanceLink = `https://governance.decentraland.org/proposal/?id=${id}`
            const snapshotLink = `https://snapshot.org/#/snapshot.dcl.eth/proposal/${snapshotId}`

            // FIX
            function covertNumber(n: number): string {
                return n.toString().replace(/(.)(?=(\d{3})+$)/g,'$1,')
            }

            ctx.editMessageText(
                `*${title}*\n\nId: \`${id}\`\nYes: ${covertNumber(Math.floor(yes))}\nNo: ${covertNumber(Math.floor(no))}`,
                {
                    reply_markup: { inline_keyboard: [ 
                        [ 
                            { text: 'DAO', url: governanceLink } ,
                            { text: 'Snapshot', url: snapshotLink } 
                        ],
                        [
                            { text: 'Back', callback_data: 'back' }
                        ]
                    ] },
                    parse_mode: "Markdown"
                }
            )

            this.bot.action('back', (ctx) => {
                ctx.editMessageText(
                    `*Proposals watched:*`, 
                    {
                        reply_markup: { inline_keyboard: this.btns },
                        parse_mode: 'Markdown'
                    }
                )
            })
        })
    }
}