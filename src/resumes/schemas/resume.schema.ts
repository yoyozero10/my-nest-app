import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import mongooseDelete, { SoftDeleteDocument } from 'mongoose-delete';

export type ResumeDocument = HydratedDocument<Resume> & SoftDeleteDocument;

@Schema({ timestamps: true })
export class Resume {
    @Prop({ required: true })
    email: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    userId: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true })
    url: string;

    @Prop({
        required: true,
        enum: ['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    })
    status: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true })
    companyId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true })
    jobId: mongoose.Schema.Types.ObjectId;

    @Prop({
        type: [{
            status: String,
            updatedAt: Date,
            updatedBy: {
                _id: mongoose.Schema.Types.ObjectId,
                email: String
            }
        }],
        default: []
    })
    history: {
        status: string;
        updatedAt: Date;
        updatedBy: {
            _id: mongoose.Schema.Types.ObjectId;
            email: string;
        };
    }[];

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

export const ResumeSchema = SchemaFactory.createForClass(Resume);
ResumeSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
