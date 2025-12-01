import { IsEmail, IsString, IsNumber, IsNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsString()
    @IsNotEmpty()
    password: string;
    @IsString()
    @IsNotEmpty()
    name: string;
    @IsString()
    @IsNotEmpty()
    phone: string;
    @IsNotEmpty()
    age: number;
    @IsString()
    @IsNotEmpty()
    address: string;
}
