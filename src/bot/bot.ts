import { Scenes, session, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { MenuItemEnum } from './menu.config';
import { MenuActionController } from './menu-action-controller';

export class TelegramBot {
    private bot: Telegraf;
    private stage!: Scenes.Stage<any>;
    private menuActionController: MenuActionController;

    constructor() {
        this.bot = new Telegraf(process.env.TG_BOT_TOKEN || '');
        this.menuActionController = new MenuActionController();

        this.initializeScenes();
        this.initializeBot();
    }

    private initializeScenes(): void {
        const scenes = this.menuActionController.getScenes();
        this.stage = new Scenes.Stage<any>(scenes);
        this.bot.use(session());
        this.bot.use(this.stage.middleware());
    }

    private initializeBot(): void {
        // /start command
        this.bot.start(async (ctx) => {
            await this.menuActionController.start(ctx);
        });

        // Inline keyboard button presses
        this.bot.on('callback_query', async (ctx: any) => {
            const action: MenuItemEnum = ctx.callbackQuery.data;
            const handler = this.menuActionController.getActionHandler(action);
            await handler(ctx);
        });

        // Plain text — route slash-commands written manually (e.g. /greet)
        this.bot.on(message('text'), async (ctx) => {
            const text = ctx.message.text.trim();
            if (text.startsWith('/')) {
                const command = text.slice(1) as MenuItemEnum;
                const handler = this.menuActionController.getActionHandler(command);
                await handler(ctx);
            }
        });

        this.bot.launch().then(() => {
            console.log('Bot started!');
        });

        // Graceful shutdown
        process.once('SIGINT',  () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
}