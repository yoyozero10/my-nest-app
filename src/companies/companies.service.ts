import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from './schemas/company.schema';
import type { CompanyDocument as CompanyDocType } from './schemas/company.schema';
import type { SoftDeleteModel as SoftDeleteModelType } from 'mongoose-delete';
import { FilterQuery, isValidObjectId, Types } from 'mongoose';
import { IUser } from 'src/users/users.interface';

type CompanySearchFilters = {
  search?: string;
  name?: string;
  address?: string;
  description?: string;
};


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

  async findAll(page = 1, limit = 10, filters?: CompanySearchFilters) {
    const { search, name, address, description } = filters || {};
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;
    const filter: FilterQuery<CompanyDocType> = {};

    if (search?.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { address: searchRegex },
        { description: searchRegex },
      ];
    }

    const applyFieldFilter = (value: string | undefined, field: 'name' | 'address' | 'description') => {
      if (value?.trim()) {
        filter[field] = { $regex: value.trim(), $options: 'i' };
      }
    };

    applyFieldFilter(name, 'name');
    applyFieldFilter(address, 'address');
    applyFieldFilter(description, 'description');

    const [data, totalItems] = await Promise.all([
      this.companyModel
        .find(filter)
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 })
        .lean(),
      this.companyModel.countDocuments(filter),
    ]);

    return {
      meta: {
        page: pageNumber,
        limit: limitNumber,
        totalItems,
        totalPages: Math.max(Math.ceil(totalItems / limitNumber), 1),
      },
      data,
    }
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

  update(updateCompanyDto: UpdateCompanyDto, user: IUser) {
    const { _id, ...updateData } = updateCompanyDto;
    return this.companyModel.findByIdAndUpdate(
      _id,
      {
        ...updateData,
        updatedBy: {
          _id: new Types.ObjectId(user._id),
          email: user.email,
        },
      },
      { new: true }
    ).exec();
  }

  async remove(id: string): Promise<any> {
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
