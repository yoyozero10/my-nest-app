import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User, ResponseMessage } from 'src/decorator/customize';
import type { IUser } from 'src/users/users.interface';

@Controller('permissions')
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Create a new permission')
    async create(
        @Body() createPermissionDto: CreatePermissionDto,
        @User() user: IUser
    ) {
        return await this.permissionsService.create(createPermissionDto, user);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Fetch all permissions with paginate')
    async findAll(
        @Query('current') page: number,
        @Query('pageSize') limit: number
    ) {
        return await this.permissionsService.findAll(+page || 1, +limit || 10);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Fetch a permission by id')
    async findOne(@Param('id') id: string) {
        return await this.permissionsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Update a permission')
    async update(
        @Param('id') id: string,
        @Body() updatePermissionDto: UpdatePermissionDto,
        @User() user: IUser
    ) {
        return await this.permissionsService.update(id, updatePermissionDto, user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Delete a permission')
    async remove(
        @Param('id') id: string,
        @User() user: IUser
    ): Promise<any> {
        return await this.permissionsService.remove(id, user);
    }
}
