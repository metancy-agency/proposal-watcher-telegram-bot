import { Telegraf } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { Command } from "./command.class";
import { IConfigService } from "../config/config.interface";

export class StartCommand extends Command {
    constructor (
        bot: Telegraf<IBotContext>, 
        private readonly configService: IConfigService
    ) {
        super(bot);
    }

    handle(): void {
        this.bot.start((ctx) => {

            ctx.reply(
                "<b>Commands</b>", 
                {
                    reply_markup: { inline_keyboard: [
                        [ 
                            { text: 'Watch', callback_data: "watchCommand" },
                            { text: 'List', callback_data: "listCommand" },
                            { text: 'Delete', callback_data: "deleteCommand" } 
                        ]
                    ]},
                    parse_mode: "HTML"
                }
            )
        })

        this.bot.action("watchCommand", async (ctx) => {
            await ctx.answerCbQuery()
            ctx.editMessageText(
                "<b>Command /watch</b>\n\nAdd proposal to watch list\nUsage: <pre>/watch [url]</pre>\nExample: <pre>/watch https://governance.decentraland.org/proposal/?id=f7d61af0-a2f3-11ed-a669-05ba4b332980</pre>", 
                {
                    reply_markup: { inline_keyboard: [
                        [ 
                            { text: 'Back', callback_data: "back" },
                        ]
                    ]},
                    parse_mode: "HTML"
                }
            )
        })

        this.bot.action("listCommand", async (ctx) => {
            await ctx.answerCbQuery()
            ctx.editMessageText(
                `<b>Command /list</b>\n\nShow all watched proposals\nMax: ${this.configService.get('MAX_PROPOSALS_FOR_WATCHING')}`, 
                {
                    reply_markup: { inline_keyboard: [
                        [ 
                            { text: 'Back', callback_data: "back" },
                        ]
                    ]},
                    parse_mode: "HTML"
                }
            )
        })

        this.bot.action("deleteCommand", async (ctx) => {
            await ctx.answerCbQuery()
            ctx.editMessageText(
                "<b>Command /delete</b>\n\nDelete proposal from watch list\nUsage: <pre>/delete [id]</pre>\nExample: <pre>/delete f7d61af0-a2f3-11ed-a669-05ba4b332980</pre>", 
                {
                    reply_markup: { inline_keyboard: [
                        [ 
                            { text: 'Back', callback_data: "back" },
                        ]
                    ]},
                    parse_mode: "HTML"
                }
            )
        })

        this.bot.action("back", async (ctx) => {
            await ctx.answerCbQuery()
            ctx.editMessageText(
                "<b>Commands</b>", 
                {
                    reply_markup: { inline_keyboard: [
                        [ 
                            { text: 'Watch', callback_data: "watchCommand" },
                            { text: 'List', callback_data: "listCommand" },
                            { text: 'Delete', callback_data: "deleteCommand" } 
                        ]
                    ]},
                    parse_mode: "HTML"
                }
            )
        })
    }
}