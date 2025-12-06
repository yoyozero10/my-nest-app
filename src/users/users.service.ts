import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId } from 'mongoose';
import { User } from './schemas/user.schema';
import type { UserDocument as UserDocType } from './schemas/user.schema';
import bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import type { SoftDeleteModel as SoftDeleteModelType } from 'mongoose-delete';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: SoftDeleteModelType<UserDocType>) { }

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

  async register(name: string, email: string, hashedPassword: string) {
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'USER',
    });
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

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email }).lean();
    return !!user;
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

    const user = await this.userModel.delete({ _id: id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return "User with id: " + id + " deleted successfully";
  }
}
