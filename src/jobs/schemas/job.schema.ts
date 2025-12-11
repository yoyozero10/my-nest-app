import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import mongooseDelete, { SoftDeleteDocument } from 'mongoose-delete';

export type JobDocument = HydratedDocument<Job> & SoftDeleteDocument;

@Schema({ timestamps: true })
export class Job {
    @Prop({ required: true })
    name: string;

    @Prop({ type: [String], required: true })
    skills: string[];

    @Prop({ type: Object, required: true })
    company: {
        _id: mongoose.Schema.Types.ObjectId;
        name: string;
    };

    @Prop({ required: true })
    salary: number;

    @Prop({ required: true })
    quantity: number;

    @Prop({ required: true, enum: ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR'] })
    level: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
JobSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
