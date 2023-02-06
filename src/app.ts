import { Telegraf } from "telegraf";
import { Command } from "./commands/command.class";
import { DeleteCommand } from "./commands/delete.command";
import { ListCommand } from "./commands/list.command";
import { StartCommand } from "./commands/start.command";
import { WatchCommand } from "./commands/watch.command";
import { IConfigService } from "./config/config.interface";
import { ConfigService } from "./config/config.service";
import { IBotContext } from "./context/context.interface";
import { CronService } from "./cron/cron.service";
import { IDatabaseService } from "./database/database.interface";
import { DatabaseService } from "./database/database.service";
import { IProposalService } from "./proposal/proposal.interface";
import { ProposalService } from "./proposal/proposal.service";

class Bot {
    bot: Telegraf<IBotContext>;
    commands: Command[] = [];

    constructor (
        private readonly configService: IConfigService,
        private readonly databaseService: IDatabaseService,
        private readonly proposalService: IProposalService
    ) {
        this.bot = new Telegraf<IBotContext>(this.configService.get('TELEGRAM_TOKEN'));
    }

    async initialize() {
        try {
            await new CronService(this.bot, this.configService, this.databaseService, this.proposalService).init();

            await this.databaseService.init();

            this.commands = [
                new StartCommand(this.bot, this.configService, this.databaseService, this.proposalService),
                new WatchCommand(this.bot, this.configService, this.databaseService, this.proposalService),
                new DeleteCommand(this.bot, this.configService, this.databaseService, this.proposalService),
                new ListCommand(this.bot, this.configService, this.databaseService, this.proposalService)
            ]

            for (const command of this.commands) {
                command.handle();
            }

            await this.bot.launch();

        } catch (err) {
            console.error(err);
        }
    }
}

const config = new ConfigService();
const database = new DatabaseService();
const proposalService = new ProposalService();
const bot = new Bot(config, database, proposalService);

bot.initialize();