import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { SoftDeleteModel } from 'mongoose-delete';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import * as SubscriberSchema from './schemas/subscriber.schema';
import type { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

type SubscriberDocument = SubscriberSchema.SubscriberDocument;

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(SubscriberSchema.Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>
  ) { }

  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    // Kiểm tra email đã tồn tại chưa
    const existingSubscriber = await this.subscriberModel.findOne({ email: createSubscriberDto.email });
    if (existingSubscriber) {
      throw new BadRequestException(`Email ${createSubscriberDto.email} đã tồn tại trong hệ thống`);
    }

    const newSubscriber = await this.subscriberModel.create({
      ...createSubscriberDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });

    return {
      _id: newSubscriber._id,
      createdAt: newSubscriber.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * (+limit);
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.subscriberModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subscriberModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    };
  }

  async findOne(id: string) {
    const subscriber = await this.subscriberModel.findById(id);
    if (!subscriber) {
      throw new BadRequestException(`Không tìm thấy subscriber với id ${id}`);
    }
    return subscriber;
  }

  async update(id: string, updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    // Kiểm tra subscriber có tồn tại không
    const subscriber = await this.subscriberModel.findById(id);
    if (!subscriber) {
      throw new BadRequestException(`Không tìm thấy subscriber với id ${id}`);
    }

    // Nếu update email, kiểm tra email mới có bị trùng không
    if (updateSubscriberDto.email && updateSubscriberDto.email !== subscriber.email) {
      const existingSubscriber = await this.subscriberModel.findOne({ email: updateSubscriberDto.email });
      if (existingSubscriber) {
        throw new BadRequestException(`Email ${updateSubscriberDto.email} đã tồn tại trong hệ thống`);
      }
    }

    const result = await this.subscriberModel.updateOne(
      { _id: id },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );

    return result;
  }

  async remove(id: string, user: IUser): Promise<any> {
    // Kiểm tra subscriber có tồn tại không
    const subscriber = await this.subscriberModel.findById(id);
    if (!subscriber) {
      throw new BadRequestException(`Không tìm thấy subscriber với id ${id}`);
    }

    await this.subscriberModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );

    const result = await this.subscriberModel.delete({ _id: id });

    return result;
  }
}
