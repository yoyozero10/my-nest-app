import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { User } from 'src/decorator/customize';
import type { IUser } from 'src/users/users.interface';
import { Query } from '@nestjs/common';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  @Post()
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @User() user: IUser
  ) {
    return this.companiesService.create(createCompanyDto, user);
  }

  @Get()
  findAll(
    @Query("current") page: number,
    @Query("pageSize") limit: number,
    @Query("search") search?: string,
    @Query("name") name?: string,
    @Query("address") address?: string,
    @Query("description") description?: string,
  ) {
    return this.companiesService.findAll(page, limit, { search, name, address, description });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch()
  update(
    @Body() updateCompanyDto: UpdateCompanyDto,
    @User() user: IUser
  ) {
    return this.companiesService.update(updateCompanyDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
