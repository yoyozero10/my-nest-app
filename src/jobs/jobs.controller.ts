import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/decorator/customize';
import type { IUser } from 'src/users/users.interface';
import { ResponseMessage } from 'src/decorator/customize';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Post()
  @ResponseMessage('Create a new job')
  async create(
    @Body() createJobDto: CreateJobDto,
    @User() user: IUser
  ) {
    return await this.jobsService.create(createJobDto, user);
  }

  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Fetch a job by id')
  async findOne(@Param('id') id: string) {
    return await this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a job')
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @User() user: IUser
  ) {
    return await this.jobsService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a job')
  async remove(
    @Param('id') id: string,
    @User() user: IUser
  ): Promise<any> {
    return await this.jobsService.remove(id, user);
  }
}
