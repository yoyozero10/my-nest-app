import { IsEmail, IsString, IsNotEmpty, IsObject, ValidateNested, IsNotEmptyObject, IsOptional, IsNumber, Min, IsIn } from "class-validator";
import mongoose from "mongoose";
import { Type } from "class-transformer";

class Company {
    @IsNotEmpty({ message: "Company _id is required" })
    _id: mongoose.Schema.Types.ObjectId;
    @IsNotEmpty({ message: "Company name is required" })
    @IsString()
    name: string;
}

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: "Name is required" })
    name: string;
    
    @IsEmail({}, { message: "Email must be a valid email address" })
    @IsNotEmpty({ message: "Email is required" })
    email: string;
    
    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    password: string;
    
    @IsOptional()
    @IsNumber({}, { message: "Age must be a number" })
    @Min(0, { message: "Age must be greater than 0" })
    age?: number;
    
    @IsOptional()
    @IsString()
    gender?: string;
    
    @IsOptional()
    @IsString()
    address?: string;
    
    @IsString()
    @IsNotEmpty({ message: "Role is required" })
    @IsIn(['USER', 'ADMIN'], { message: "Role must be either USER or ADMIN" })
    role: string;
    
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;
}

export class RegisterUserDto {
    email: string;
    password: string;
}

