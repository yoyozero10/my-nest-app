import { IsEmail, IsString, IsNotEmpty, IsObject, ValidateNested, IsNotEmptyObject } from "class-validator";
import mongoose from "mongoose";
import { Type } from "class-transformer";

class Company {
    @IsNotEmpty({ message: "Company is required" })
    _id: mongoose.Schema.Types.ObjectId;
    @IsNotEmpty({ message: "Company name is required" })
    name: string;
}

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: "Name is required" })
    name: string;
    @IsEmail()
    @IsNotEmpty({ message: "Email is required" })
    email: string;
    @IsString()
    @IsNotEmpty({ message: "Password is required" })
    password: string;
    @IsString()
    @IsNotEmpty({ message: "Phone is required" })
    phone: string;
    @IsNotEmpty({ message: "Age is required" })
    age: number;
    @IsString()
    @IsNotEmpty({ message: "Gender is required" })
    gender: string;
    @IsString()
    @IsNotEmpty({ message: "Address is required" })
    address: string;
    @IsNotEmpty({ message: "Role is required" })
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

