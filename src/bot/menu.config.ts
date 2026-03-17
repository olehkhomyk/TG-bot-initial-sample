export enum MenuItemEnum {
    GREET      = 'greet',
    HELP       = 'help',
    ECHO       = 'echo',
    ABOUT      = 'about',
    MY_PROFILE = 'my_profile',
    SETTINGS   = 'settings',
    REFRESH    = 'refresh',
}

export interface IMenuItem {
    text: string;
    callback_data: MenuItemEnum;
}

export const BOT_MENU: IMenuItem[][] = [
    [
        { text: '👋 Greet',    callback_data: MenuItemEnum.GREET },
        { text: '❓ Help',     callback_data: MenuItemEnum.HELP },
    ],
    [
        { text: '💬 Echo',     callback_data: MenuItemEnum.ECHO },
        { text: 'ℹ️ About',    callback_data: MenuItemEnum.ABOUT },
    ],
    [
        { text: '👤 My Profile', callback_data: MenuItemEnum.MY_PROFILE },
        { text: '⚙️ Settings',   callback_data: MenuItemEnum.SETTINGS },
    ],
    [
        { text: '🔄 Refresh',  callback_data: MenuItemEnum.REFRESH },
    ],
];