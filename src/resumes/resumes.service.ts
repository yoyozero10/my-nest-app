import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, isValidObjectId } from 'mongoose';
import type { SoftDeleteModel } from 'mongoose-delete';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import * as ResumeSchema from './schemas/resume.schema';
import type { IUser } from 'src/users/users.interface';

type ResumeDocument = ResumeSchema.ResumeDocument;

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(ResumeSchema.Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>
  ) { }

  async create(createResumeDto: CreateResumeDto, user: IUser) {
    const newResume = await this.resumeModel.create({
      ...createResumeDto,
      email: user.email, // Lấy từ JWT
      userId: new Types.ObjectId(user._id), // Lấy từ JWT
      status: 'PENDING',
      history: [{
        status: 'PENDING',
        updatedAt: new Date(),
        updatedBy: {
          _id: new Types.ObjectId(user._id),
          email: user.email
        }
      }],
      createdBy: {
        _id: new Types.ObjectId(user._id),
        email: user.email
      }
    });

    return {
      _id: newResume._id,
      createdAt: newResume.createdAt
    };
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.resumeModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate({ path: 'companyId', select: 'name' })
        .populate({ path: 'jobId', select: 'name' })
        .lean(),
      this.resumeModel.countDocuments()
    ]);

    return {
      meta: {
        current: page,
        pageSize: limit,
        pages: Math.ceil(total / limit),
        total
      },
      result: data
    };
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Invalid resume id');
    }

    const resume = await this.resumeModel
      .findById(id)
      .populate({ path: 'companyId', select: 'name' })
      .populate({ path: 'jobId', select: 'name' })
      .lean();

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return resume;
  }

  async findByUser(user: IUser) {
    const resumes = await this.resumeModel
      .find({ userId: new Types.ObjectId(user._id) })
      .sort({ createdAt: -1 })
      .populate({ path: 'companyId', select: 'name' })
      .populate({ path: 'jobId', select: 'name' })
      .lean();

    return resumes;
  }

  async update(id: string, status: string, user: IUser) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Invalid resume id');
    }

    const resume = await this.resumeModel.findById(id);
    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    const result = await this.resumeModel.updateOne(
      { _id: id },
      {
        status,
        $push: {
          history: {
            status,
            updatedAt: new Date(),
            updatedBy: {
              _id: new Types.ObjectId(user._id),
              email: user.email
            }
          }
        },
        updatedBy: {
          _id: new Types.ObjectId(user._id),
          email: user.email
        }
      }
    );

    return result;
  }

  async remove(id: string, user: IUser): Promise<any> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Invalid resume id');
    }

    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: new Types.ObjectId(user._id),
          email: user.email
        }
      }
    );

    const result = await this.resumeModel.delete({ _id: id });
    return result;
  }
}
