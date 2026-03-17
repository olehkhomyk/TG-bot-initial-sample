import 'dotenv/config';
import { Database } from './db/database';
import { TelegramBot } from './bot/bot';

async function main() {
    await Database.connect();
    new TelegramBot();
}

main().catch(console.error);