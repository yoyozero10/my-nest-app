import { IsNotEmpty, IsString, IsBoolean, IsArray, IsMongoId, IsOptional } from 'class-validator';

export class CreateRoleDto {
    @IsNotEmpty({ message: 'Name không được để trống' })
    @IsString({ message: 'Name phải là string' })
    name: string;

    @IsNotEmpty({ message: 'Description không được để trống' })
    @IsString({ message: 'Description phải là string' })
    description: string;

    @IsOptional()
    @IsBoolean({ message: 'isActive phải là boolean' })
    isActive?: boolean;

    @IsNotEmpty({ message: 'Permissions không được để trống' })
    @IsArray({ message: 'Permissions phải là array' })
    @IsMongoId({ each: true, message: 'Mỗi permission phải là MongoDB ObjectId hợp lệ' })
    permissions: string[];
}
