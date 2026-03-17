import mongoose from 'mongoose';
import { ProfileRepository } from './profile.repository';

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
        ProfileRepository.initializeModel();
    }
}