import { Scenes } from 'telegraf';
import { message } from 'telegraf/filters';
import { BOT_MENU, IMenuItem, MenuItemEnum } from './menu.config';
import { bold, formatDate } from '../utils/format.utils';
import { ProfileRepository } from '../db/profile.repository';

export class MenuActionController {
    // ─── Scene keys ───────────────────────────────────────────────────────────
    private echoSceneKey     = 'echoScene';
    private settingsSceneKey = 'settingsScene';

    // ─── Scenes ───────────────────────────────────────────────────────────────
    echoScene     = new Scenes.BaseScene<any>(this.echoSceneKey);
    settingsScene = new Scenes.BaseScene<any>(this.settingsSceneKey);

    // ─── Action handler map ───────────────────────────────────────────────────
    private actionHandlers: Record<MenuItemEnum, (ctx: any) => Promise<any>> = {
        [MenuItemEnum.GREET]:      async (ctx) => this.greet(ctx),
        [MenuItemEnum.HELP]:       async (ctx) => this.help(ctx),
        [MenuItemEnum.ECHO]:       async (ctx) => this.startEcho(ctx),
        [MenuItemEnum.ABOUT]:      async (ctx) => this.about(ctx),
        [MenuItemEnum.MY_PROFILE]: async (ctx) => this.myProfile(ctx),
        [MenuItemEnum.SETTINGS]:   async (ctx) => this.startSettings(ctx),
        [MenuItemEnum.REFRESH]:    async (ctx) => this.showMainMenu(ctx),
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
        // Upsert profile on every /start so data stays fresh
        await ProfileRepository.upsert(ctx.from.id, {
            telegramId: ctx.from.id,
            username:   ctx.from.username,
            firstName:  ctx.from.first_name,
            lastName:   ctx.from.last_name,
            language:   ctx.from.language_code,
        });

        await ctx.reply(
            `Welcome, ${bold(ctx.from.first_name)}! 👋\nYour profile has been saved.`,
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
            `👤 <b>My Profile</b> — view your saved profile\n` +
            `⚙️ <b>Settings</b> — update your display name\n` +
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

    private myProfile = async (ctx: any) => {
        const profile = await ProfileRepository.getByTelegramId(ctx.from.id);

        if (!profile) {
            await ctx.reply('Profile not found. Send /start to create one.');
            return;
        }

        const lines = [
            `<b>Your profile</b>`,
            `ID: <code>${profile.telegramId}</code>`,
            profile.username  ? `Username: @${profile.username}`         : null,
            profile.firstName ? `First name: ${profile.firstName}`       : null,
            profile.lastName  ? `Last name: ${profile.lastName}`         : null,
            profile.language  ? `Language: ${profile.language}`          : null,
            `Registered: ${formatDate(profile.registeredAt)}`,
        ].filter(Boolean).join('\n');

        await ctx.reply(lines, { parse_mode: 'HTML' });
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

        this.echoScene.on(message('text'), async (ctx: any) => {
            await ctx.reply(`You said: ${ctx.message.text}`);
        });
    }

    private startEcho = async (ctx: any) => {
        ctx.scene.enter(this.echoSceneKey);
    };

    // ─── Settings scene ───────────────────────────────────────────────────────
    private setupSettingsScene() {
        this.settingsScene.enter(async (ctx: any) => {
            await ctx.reply('Enter your first name (or /cancel to go back):');
        });

        this.settingsScene.command('cancel', async (ctx: any) => {
            await ctx.reply('Settings cancelled.');
            ctx.scene.leave();
        });

        this.settingsScene.on(message('text'), async (ctx: any) => {
            const firstName = ctx.message.text.trim();
            await ProfileRepository.updateByTelegramId(ctx.from.id, { firstName });
            await ctx.reply(`First name updated to: ${bold(firstName)} ✅`, { parse_mode: 'HTML' });
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