import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User, ResponseMessage } from 'src/decorator/customize';
import type { IUser } from 'src/users/users.interface';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Create a new resume')
  async create(
    @Body() createResumeDto: CreateResumeDto,
    @User() user: IUser
  ) {
    return await this.resumesService.create(createResumeDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Fetch all resumes with paginate')
  async findAll(
    @Query('current') page: number,
    @Query('pageSize') limit: number
  ) {
    return await this.resumesService.findAll(+page || 1, +limit || 10);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Fetch a resume by id')
  async findOne(@Param('id') id: string) {
    return await this.resumesService.findOne(id);
  }

  @Post('by-user')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get Resumes by User')
  async findByUser(@User() user: IUser) {
    return await this.resumesService.findByUser(user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Update status resume')
  async update(
    @Param('id') id: string,
    @Body() updateResumeDto: UpdateResumeDto,
    @User() user: IUser
  ) {
    return await this.resumesService.update(id, updateResumeDto.status, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Delete a resume by id')
  async remove(
    @Param('id') id: string,
    @User() user: IUser
  ) {
    return await this.resumesService.remove(id, user);
  }
}
