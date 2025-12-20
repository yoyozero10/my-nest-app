import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCompanyDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    address: string;

    @IsOptional()
    @IsString()
    logo: string; // Tên file ảnh đã upload (optional)
}
