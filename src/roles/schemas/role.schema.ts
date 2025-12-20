import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import mongooseDelete, { SoftDeleteDocument } from 'mongoose-delete';

export type RoleDocument = HydratedDocument<Role> & SoftDeleteDocument;

@Schema({ timestamps: true })
export class Role {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }] })
    permissions: mongoose.Schema.Types.ObjectId[];

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

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
