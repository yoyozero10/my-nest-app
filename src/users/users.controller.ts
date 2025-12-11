import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../decorator/customize';
import type { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createUserDto: CreateUserDto,
    @User() user: IUser,
  ) {
    const data = await this.usersService.create(createUserDto, user);
    return {
      message: 'Create a new User',
      data,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('current') page: string = '1',
    @Query('pageSize') limit: string = '10',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @User() user: IUser,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    const data = await this.usersService.findAll(pageNum, limitNum);
    return {
      statusCode: 200,
      message: 'Fetch user with paginate',
      data
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id);
    return {
      statusCode: 200,
      message: 'Fetch user by id',
      data
    };
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
  ) {
    const data = await this.usersService.update(updateUserDto, user);
    return {
      statusCode: 200,
      message: 'Update a User',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @User() user: IUser,
  ) {
    await this.usersService.remove(id, user);
    return {
      statusCode: 200,
      message: 'Delete a User',
      data: {
        deleted: true
      }
    };
  }
}
