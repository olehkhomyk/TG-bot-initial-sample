import mongoose from 'mongoose';
import { ProfileStore } from './profile.store';

export class Database {
    public static async connect(): Promise<void> {
        try {
            Database.initModels();
            await mongoose.connect(process.env.MONGODB_URI || '');
            console.log('Connected to MongoDB');
        } catch (err) {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        }
    }

    private static initModels(): void {
        ProfileStore.initializeModel();
    }
}