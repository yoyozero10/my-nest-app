import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class CreatePermissionDto {
    @IsNotEmpty({ message: 'Name không được để trống' })
    @IsString({ message: 'Name phải là string' })
    name: string;

    @IsNotEmpty({ message: 'API Path không được để trống' })
    @IsString({ message: 'API Path phải là string' })
    apiPath: string;

    @IsNotEmpty({ message: 'Method không được để trống' })
    @IsEnum(['GET', 'POST', 'PATCH', 'DELETE'], {
        message: 'Method phải là một trong các giá trị: GET, POST, PATCH, DELETE'
    })
    method: string;

    @IsNotEmpty({ message: 'Module không được để trống' })
    @IsString({ message: 'Module phải là string' })
    module: string;
}
