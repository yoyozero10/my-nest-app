import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User } from './schemas/user.schema';
import bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

  hashPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }

  async create(createUserDto: CreateUserDto) {
    const hashPassword = this.hashPassword(createUserDto.password);
    const user = await this.userModel.create({ ...createUserDto, password: hashPassword });
    return user;
  }

  findAll() {
    return this.userModel.find().lean();
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Invalid user id');
    }

    const user = await this.userModel.findById(id).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  checkUserPassword(password: string, hashPassword: string) {
    return bcrypt.compareSync(password, hashPassword);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.findByIdAndUpdate(updateUserDto._id, updateUserDto, { new: true }).exec();
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Invalid user id');
    }

    const user = await this.userModel.findByIdAndDelete(id).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return "User with id: " + id + " deleted successfully";
  }
}
