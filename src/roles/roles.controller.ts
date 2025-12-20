import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User, ResponseMessage } from 'src/decorator/customize';
import type { IUser } from 'src/users/users.interface';

@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Create a new role')
    async create(
        @Body() createRoleDto: CreateRoleDto,
        @User() user: IUser
    ) {
        return await this.rolesService.create(createRoleDto, user);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Fetch all roles with paginate')
    async findAll(
        @Query('current') page: number,
        @Query('pageSize') limit: number
    ) {
        return await this.rolesService.findAll(+page || 1, +limit || 10);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Fetch a role by id')
    async findOne(@Param('id') id: string) {
        return await this.rolesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Update a role')
    async update(
        @Param('id') id: string,
        @Body() updateRoleDto: UpdateRoleDto,
        @User() user: IUser
    ) {
        return await this.rolesService.update(id, updateRoleDto, user);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Delete a role')
    async remove(
        @Param('id') id: string,
        @User() user: IUser
    ) {
        return await this.rolesService.remove(id, user);
    }
}
