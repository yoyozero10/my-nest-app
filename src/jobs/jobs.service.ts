import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { SoftDeleteModel } from 'mongoose-delete';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import * as JobSchema from './schemas/job.schema';
import type { IUser } from 'src/users/users.interface';

type JobDocument = JobSchema.JobDocument;

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(JobSchema.Job.name)
    private jobModel: SoftDeleteModel<JobDocument>
  ) { }

  async create(createJobDto: CreateJobDto, user: IUser) {
    const newJob = await this.jobModel.create({
      ...createJobDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });

    return {
      _id: newJob._id,
      createdAt: newJob.createdAt
    };
  }

  findAll() {
    return `This action returns all jobs`;
  }

  async findOne(id: string) {
    const job = await this.jobModel.findById(id);
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    const result = await this.jobModel.updateOne(
      { _id: id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );

    return result;
  }

  async remove(id: string, user: IUser) {
    await this.jobModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );

    const result = await this.jobModel.delete({ _id: id });

    return result;
  }
}
