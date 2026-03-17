import { Document } from 'mongoose';

export interface IProfile {
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    language?: string;
    isActive: boolean;
    registeredAt: Date;
}

export interface IProfileDocument extends IProfile, Document {}