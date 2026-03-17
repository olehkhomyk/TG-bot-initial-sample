import { Scenes } from 'telegraf';
import { BOT_MENU, IMenuItem, MenuItemEnum } from './menu.config';
import { bold, formatDate } from '../utils/format.utils';

export class MenuActionController {
    // ─── Scene keys ───────────────────────────────────────────────────────────
    private echoSceneKey     = 'echoScene';
    private settingsSceneKey = 'settingsScene';

    // ─── Scenes ───────────────────────────────────────────────────────────────
    echoScene     = new Scenes.BaseScene<any>(this.echoSceneKey);
    settingsScene = new Scenes.BaseScene<any>(this.settingsSceneKey);

    // ─── Action handler map ───────────────────────────────────────────────────
    private actionHandlers: Record<MenuItemEnum, (ctx: any) => Promise<any>> = {
        [MenuItemEnum.GREET]:    async (ctx) => this.greet(ctx),
        [MenuItemEnum.HELP]:     async (ctx) => this.help(ctx),
        [MenuItemEnum.ECHO]:     async (ctx) => this.startEcho(ctx),
        [MenuItemEnum.ABOUT]:    async (ctx) => this.about(ctx),
        [MenuItemEnum.SETTINGS]: async (ctx) => this.startSettings(ctx),
        [MenuItemEnum.REFRESH]:  async (ctx) => this.showMainMenu(ctx),
    };

    // ─── Main menu getter ─────────────────────────────────────────────────────
    get mainMenu(): { parse_mode: string; reply_markup: { inline_keyboard: IMenuItem[][] } } {
        return { parse_mode: 'HTML', reply_markup: { inline_keyboard: BOT_MENU } };
    }

    getScenes() {
        return [this.echoScene, this.settingsScene];
    }

    constructor() {
        this.setupEchoScene();
        this.setupSettingsScene();
    }

    // ─── /start ───────────────────────────────────────────────────────────────
    start = async (ctx: any) => {
        await ctx.reply(
            `Welcome, ${bold(ctx.from.first_name)}! 👋\nThis is a sample bot. Use the menu below.`,
            this.mainMenu
        );
    };

    // ─── Handlers ─────────────────────────────────────────────────────────────
    private greet = async (ctx: any) => {
        await ctx.reply(`Hello, ${bold(ctx.from.first_name)}! Nice to meet you 🤝`, { parse_mode: 'HTML' });
    };

    private help = async (ctx: any) => {
        await ctx.reply(
            `<b>Available actions:</b>\n` +
            `👋 <b>Greet</b> — say hello\n` +
            `💬 <b>Echo</b> — repeat what you type\n` +
            `ℹ️ <b>About</b> — bot info\n` +
            `⚙️ <b>Settings</b> — set your display name\n` +
            `🔄 <b>Refresh</b> — reload the menu`,
            { parse_mode: 'HTML' }
        );
    };

    private about = async (ctx: any) => {
        await ctx.reply(
            `<b>TG Bot Sample</b>\n` +
            `Version: 1.0.0\n` +
            `Date: ${formatDate(new Date())}\n\n` +
            `A clean starting template — fork and build something great.`,
            { parse_mode: 'HTML' }
        );
    };

    // ─── Echo scene ───────────────────────────────────────────────────────────
    private setupEchoScene() {
        this.echoScene.enter(async (ctx: any) => {
            await ctx.reply('Send me any text and I will echo it back. Type /cancel to stop.');
        });

        this.echoScene.command('cancel', async (ctx: any) => {
            await ctx.reply('Echo stopped.');
            ctx.scene.leave();
        });

        this.echoScene.on('text', async (ctx: any) => {
            await ctx.reply(`You said: ${ctx.message.text}`);
        });
    }

    private startEcho = async (ctx: any) => {
        ctx.scene.enter(this.echoSceneKey);
    };

    // ─── Settings scene ───────────────────────────────────────────────────────
    private setupSettingsScene() {
        this.settingsScene.enter(async (ctx: any) => {
            await ctx.reply('Enter your display name (or /cancel to go back):');
        });

        this.settingsScene.command('cancel', async (ctx: any) => {
            await ctx.reply('Settings cancelled.');
            ctx.scene.leave();
        });

        this.settingsScene.on('text', async (ctx: any) => {
            const name = ctx.message.text.trim();
            // TODO: persist to DB when switching to the db branch
            await ctx.reply(`Display name set to: ${bold(name)} ✅`, { parse_mode: 'HTML' });
            ctx.scene.leave();
        });
    }

    private startSettings = async (ctx: any) => {
        ctx.scene.enter(this.settingsSceneKey);
    };

    // ─── Main menu ────────────────────────────────────────────────────────────
    showMainMenu = async (ctx: any) => {
        const name = ctx.from?.first_name ?? 'stranger';
        await ctx.reply(
            `Hi ${bold(name)}! Choose an action from the menu below 👇`,
            this.mainMenu
        );
    };

    // ─── Unknown action fallback ──────────────────────────────────────────────
    private unknownAction = async (ctx: any) => {
        await ctx.reply('Unknown action. Please use the menu.');
    };

    getActionHandler = (action: MenuItemEnum) => {
        return this.actionHandlers[action] ?? this.unknownAction;
    };
}