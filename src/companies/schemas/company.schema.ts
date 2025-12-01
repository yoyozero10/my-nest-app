import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import mongooseDelete, { SoftDeleteDocument } from 'mongoose-delete';

export type CompanyDocument = HydratedDocument<Company> & SoftDeleteDocument;

@Schema({ timestamps: true })
export class Company {
  @Prop()
  name: string;

  @Prop()
  address: string;

  @Prop()
  description: string;

  @Prop({type: Object})
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string
  }

  @Prop({type: Object})
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string
  }

  @Prop({type: Object})
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  }

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
CompanySchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });
