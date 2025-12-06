import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsMongoId } from 'class-validator';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {
    @IsNotEmpty({ message: "_id is required" })
    @IsMongoId({ message: "_id must be a valid MongoDB ObjectId" })
    _id: string;
}
