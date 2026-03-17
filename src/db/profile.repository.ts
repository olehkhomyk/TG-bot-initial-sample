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

export class ProfileRepository {
    public static Profile: mongoose.Model<IProfileDocument>;

    public static initializeModel(): void {
        if (!ProfileRepository.Profile) {
            ProfileRepository.Profile = mongoose.model<IProfileDocument>('Profile', profileSchema);
        }
    }

    static async create(data: Pick<IProfileDocument, 'telegramId'> & Partial<IProfileDocument>): Promise<IProfileDocument> {
        const profile = new ProfileRepository.Profile(data);
        return profile.save();
    }

    static getByTelegramId(telegramId: number) {
        return ProfileRepository.Profile.findOne({ telegramId });
    }

    static async upsert(telegramId: number, data: Partial<IProfileDocument>): Promise<IProfileDocument | null> {
        return ProfileRepository.Profile.findOneAndUpdate(
            { telegramId },
            { $set: data },
            { upsert: true, new: true }
        );
    }

    static async updateByTelegramId(telegramId: number, updates: Partial<IProfileDocument>): Promise<void> {
        await ProfileRepository.Profile.findOneAndUpdate(
            { telegramId },
            { $set: updates }
        );
    }

    static async deleteByTelegramId(telegramId: number): Promise<void> {
        await ProfileRepository.Profile.deleteOne({ telegramId });
    }
}