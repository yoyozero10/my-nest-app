import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId } from 'mongoose';
import { User as UserModel } from './schemas/user.schema';
import type { UserDocument as UserDocType } from './schemas/user.schema';
import bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import type { SoftDeleteModel as SoftDeleteModelType } from 'mongoose-delete';
import { IUser } from './users.interface';

@Injectable()
export class UsersService {
  constructor(@InjectModel(UserModel.name) private readonly userModel: SoftDeleteModelType<UserDocType>) { }

  hashPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    // Kiểm tra email đã tồn tại
    const emailExists = await this.checkEmailExists(createUserDto.email);
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashPassword = this.hashPassword(createUserDto.password);
    
    // Tạo user với createdBy từ JWT token
    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    
    // Trả về chỉ _id và createdAt
    return {
      _id: newUser._id,
      createdAt: newUser.createdAt,
    };
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
