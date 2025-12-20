import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, isValidObjectId } from 'mongoose';
import type { SoftDeleteModel } from 'mongoose-delete';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import * as RoleSchema from './schemas/role.schema';
import type { IUser } from 'src/users/users.interface';

type RoleDocument = RoleSchema.RoleDocument;

@Injectable()
export class RolesService {
    constructor(
        @InjectModel(RoleSchema.Role.name)
        private roleModel: SoftDeleteModel<RoleDocument>
    ) { }

    async create(createRoleDto: CreateRoleDto, user: IUser) {
        const { name } = createRoleDto;

        const existingRole = await this.roleModel.findOne({ name });
        if (existingRole) {
            throw new BadRequestException(`Role với name="${name}" đã tồn tại`);
        }

        const newRole = await this.roleModel.create({
            ...createRoleDto,
            createdBy: {
                _id: new Types.ObjectId(user._id),
                email: user.email
            }
        });

        return {
            _id: newRole._id,
            createdAt: newRole.createdAt
        };
    }

    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.roleModel
                .find()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .populate({ path: 'permissions', select: 'name apiPath method' })
                .lean(),
            this.roleModel.countDocuments()
        ]);

        return {
            meta: {
                current: page,
                pageSize: limit,
                pages: Math.ceil(total / limit),
                total
            },
            result: data
        };
    }

    async findOne(id: string) {
        if (!isValidObjectId(id)) {
            throw new NotFoundException('Invalid role id');
        }

        const role = await this.roleModel
            .findById(id)
            .populate({ path: 'permissions', select: 'name apiPath method' })
            .lean();

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        return role;
    }

    async findByName(name: string) {
        const role = await this.roleModel
            .findOne({ name })
            .populate({ path: 'permissions', select: 'name apiPath method' })
            .lean();

        return role;
    }

    async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
        if (!isValidObjectId(id)) {
            throw new NotFoundException('Invalid role id');
        }

        // Nếu update name, check xem name mới có trùng với role khác không
        if (updateRoleDto.name) {
            const existingRole = await this.roleModel.findOne({
                name: updateRoleDto.name,
                _id: { $ne: id } // Loại trừ role hiện tại
            });

            if (existingRole) {
                throw new BadRequestException(
                    `Role với name="${updateRoleDto.name}" đã tồn tại`
                );
            }
        }

        const result = await this.roleModel.updateOne(
            { _id: id },
            {
                ...updateRoleDto,
                updatedBy: {
                    _id: new Types.ObjectId(user._id),
                    email: user.email
                }
            }
        );

        return result;
    }

    async remove(id: string, user: IUser): Promise<any> {
        if (!isValidObjectId(id)) {
            throw new NotFoundException('Invalid role id');
        }

        await this.roleModel.updateOne(
            { _id: id },
            {
                deletedBy: {
                    _id: new Types.ObjectId(user._id),
                    email: user.email
                }
            }
        );

        const result = await this.roleModel.delete({ _id: id });
        return result;
    }
}
