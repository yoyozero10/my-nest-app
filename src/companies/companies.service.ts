import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from './schemas/company.schema';
import type { CompanyDocument as CompanyDocType } from './schemas/company.schema';
import type { SoftDeleteModel as SoftDeleteModelType } from 'mongoose-delete';
import { isValidObjectId, Types } from 'mongoose';
import { IUser } from 'src/users/users.interface';


@Injectable()
export class CompaniesService {

  constructor(@InjectModel(Company.name) private readonly companyModel: SoftDeleteModelType<CompanyDocType>) { }

  create(createCompanyDto: CreateCompanyDto, user: IUser) {
    return this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: new Types.ObjectId(user._id),
        email: user.email,
      },
    });
  }

  findAll() {
    return this.companyModel.find().lean();
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Invalid user id');
    }
    const company = await this.companyModel.findById(id).lean();
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  update(updateCompanyDto: UpdateCompanyDto) {
    return this.companyModel.findByIdAndUpdate(updateCompanyDto._id, updateCompanyDto, { new: true }).exec();
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Invalid company id');
    }

    const company = await this.companyModel.delete({ _id: id });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return "Company with id: " + id + " deleted successfully";
  }
}
