import mongoose, { Schema } from 'mongoose';
import { IProfileDocument } from '../models/profile.model';

const profileSchema = new Schema<IProfileDocument>(
    {
        telegramId:  { type: Number, required: true, unique: true, index: true },
        username:    { type: String },
        firstName:   { type: String },
        lastName:    { type: String },
        language:    { type: String },
        isActive:    { type: Boolean, default: true },
        registeredAt:{ type: Date,    default: Date.now },
    },
    { timestamps: true }
);

export class ProfileStore {
    public static Profile: mongoose.Model<IProfileDocument>;

    public static initializeModel(): void {
        if (!ProfileStore.Profile) {
            ProfileStore.Profile = mongoose.model<IProfileDocument>('Profile', profileSchema);
        }
    }

    static async create(data: Pick<IProfileDocument, 'telegramId'> & Partial<IProfileDocument>): Promise<IProfileDocument> {
        const profile = new ProfileStore.Profile(data);
        return profile.save();
    }

    static getByTelegramId(telegramId: number) {
        return ProfileStore.Profile.findOne({ telegramId });
    }

    static async upsert(telegramId: number, data: Partial<IProfileDocument>): Promise<IProfileDocument | null> {
        return ProfileStore.Profile.findOneAndUpdate(
            { telegramId },
            { $set: data },
            { upsert: true, new: true }
        );
    }

    static async updateByTelegramId(telegramId: number, updates: Partial<IProfileDocument>): Promise<void> {
        await ProfileStore.Profile.findOneAndUpdate(
            { telegramId },
            { $set: updates }
        );
    }

    static async deleteByTelegramId(telegramId: number): Promise<void> {
        await ProfileStore.Profile.deleteOne({ telegramId });
    }
}