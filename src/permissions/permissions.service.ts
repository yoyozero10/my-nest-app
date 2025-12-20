import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, isValidObjectId } from 'mongoose';
import type { SoftDeleteModel } from 'mongoose-delete';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import * as PermissionSchema from './schemas/permission.schema';
import type { IUser } from 'src/users/users.interface';

type PermissionDocument = PermissionSchema.PermissionDocument;

@Injectable()
export class PermissionsService {
    constructor(
        @InjectModel(PermissionSchema.Permission.name)
        private permissionModel: SoftDeleteModel<PermissionDocument>
    ) { }

    async create(createPermissionDto: CreatePermissionDto, user: IUser) {
        const { apiPath, method } = createPermissionDto;

        // Check xem apiPath + method đã tồn tại chưa
        const existingPermission = await this.permissionModel.findOne({
            apiPath,
            method
        });

        if (existingPermission) {
            throw new BadRequestException(
                `Permission với apiPath="${apiPath}" và method="${method}" đã tồn tại`
            );
        }

        const newPermission = await this.permissionModel.create({
            ...createPermissionDto,
            createdBy: {
                _id: new Types.ObjectId(user._id),
                email: user.email
            }
        });

        return {
            _id: newPermission._id,
            createdAt: newPermission.createdAt
        };
    }

    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.permissionModel
                .find()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            this.permissionModel.countDocuments()
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
            throw new NotFoundException('Invalid permission id');
        }

        const permission = await this.permissionModel.findById(id).lean();
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }

        return permission;
    }

    async update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
        if (!isValidObjectId(id)) {
            throw new NotFoundException('Invalid permission id');
        }

        const result = await this.permissionModel.updateOne(
            { _id: id },
            {
                ...updatePermissionDto,
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
            throw new NotFoundException('Invalid permission id');
        }

        await this.permissionModel.updateOne(
            { _id: id },
            {
                deletedBy: {
                    _id: new Types.ObjectId(user._id),
                    email: user.email
                }
            }
        );

        const result = await this.permissionModel.delete({ _id: id });
        return result;
    }
}
