import { IsString, IsNotEmpty, IsArray, IsEmail } from 'class-validator';

export class CreateSubscriberDto {
    @IsNotEmpty({ message: 'Tên subscriber không được để trống' })
    @IsString({ message: 'Tên subscriber phải là string' })
    name: string;

    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    email: string;

    @IsNotEmpty({ message: 'Skills không được để trống' })
    @IsArray({ message: 'Skills phải là array' })
    @IsString({ each: true, message: 'Mỗi skill phải là string' })
    skills: string[];
}
