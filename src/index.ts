import 'dotenv/config';
import { TelegramBot } from './bot/bot';

async function main() {
    new TelegramBot();
}

main().catch(console.error);