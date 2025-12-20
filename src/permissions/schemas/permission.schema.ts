import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import mongooseDelete, { SoftDeleteDocument } from 'mongoose-delete';

export type PermissionDocument = HydratedDocument<Permission> & SoftDeleteDocument;

@Schema({ timestamps: true })
export class Permission {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    apiPath: string;

    @Prop({ required: true, enum: ['GET', 'POST', 'PATCH', 'DELETE'] })
    method: string;

    @Prop({ required: true })
    module: string;

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

export const PermissionSchema = SchemaFactory.createForClass(Permission);
PermissionSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
