import mongoose from 'mongoose';

export interface ISubscriber {
    _id?: string;
    name: string;
    email: string;
    skills: string[];
    createdBy?: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };
    updatedBy?: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };
    deletedBy?: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean;
    deletedAt?: Date;
}
