import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { User, ResponseMessage } from 'src/decorator/customize';
import type { IUser } from 'src/users/users.interface';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) { }

  @Post()
  @ResponseMessage('Create a new subscriber')
  async create(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @User() user: IUser
  ) {
    return await this.subscribersService.create(createSubscriberDto, user);
  }

  @Get()
  @ResponseMessage('Fetch subscribers with pagination')
  async findAll(
    @Query('current') currentPage: string = '1',
    @Query('pageSize') limit: string = '10',
    @Query() qs: string
  ) {
    return await this.subscribersService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Fetch a subscriber by id')
  async findOne(@Param('id') id: string) {
    return await this.subscribersService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a subscriber')
  async update(
    @Param('id') id: string,
    @Body() updateSubscriberDto: UpdateSubscriberDto,
    @User() user: IUser
  ) {
    return await this.subscribersService.update(id, updateSubscriberDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a subscriber')
  async remove(
    @Param('id') id: string,
    @User() user: IUser
  ): Promise<any> {
    return await this.subscribersService.remove(id, user);
  }
}
