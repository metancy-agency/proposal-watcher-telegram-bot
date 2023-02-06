import { Telegraf } from "telegraf";
import { IBotContext } from "../context/context.interface";
import { IDatabaseService } from "../database/database.interface";
import { Command } from "./command.class";
import { IConfigService } from "../config/config.interface";
import { IProposalService } from "../proposal/proposal.interface";

export class StartCommand extends Command {
    constructor (
        bot: Telegraf<IBotContext>, 
        private readonly configService: IConfigService,
        private readonly databaseService: IDatabaseService,
        private readonly proposalService: IProposalService
    ) {
        super(bot);
    }

    handle(): void {
        this.bot.start(async (ctx) => {

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
            
        })

        this.bot.action("listCommand", async (ctx) => {
            
        })

        this.bot.action("deleteCommand", async (ctx) => {
            
        })
    }
}