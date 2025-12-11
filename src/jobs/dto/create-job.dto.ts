import { IsString, IsNotEmpty, IsArray, IsNumber, IsBoolean, IsDateString, IsEnum, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class CompanyDto {
    @IsNotEmpty({ message: 'Company _id không được để trống' })
    @IsString({ message: 'Company _id phải là string' })
    _id: string;

    @IsNotEmpty({ message: 'Company name không được để trống' })
    @IsString({ message: 'Company name phải là string' })
    name: string;
}

export class CreateJobDto {
    @IsNotEmpty({ message: 'Tên job không được để trống' })
    @IsString({ message: 'Tên job phải là string' })
    name: string;

    @IsNotEmpty({ message: 'Skills không được để trống' })
    @IsArray({ message: 'Skills phải là array' })
    @IsString({ each: true, message: 'Mỗi skill phải là string' })
    skills: string[];

    @IsNotEmpty({ message: 'Company không được để trống' })
    @IsObject({ message: 'Company phải là object' })
    @ValidateNested()
    @Type(() => CompanyDto)
    company: CompanyDto;

    @IsNotEmpty({ message: 'Salary không được để trống' })
    @IsNumber({}, { message: 'Salary phải là number' })
    @Min(0, { message: 'Salary phải lớn hơn hoặc bằng 0' })
    salary: number;

    @IsNotEmpty({ message: 'Quantity không được để trống' })
    @IsNumber({}, { message: 'Quantity phải là number' })
    @Min(1, { message: 'Quantity phải lớn hơn hoặc bằng 1' })
    quantity: number;

    @IsNotEmpty({ message: 'Level không được để trống' })
    @IsEnum(['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR'], {
        message: 'Level phải là một trong các giá trị: INTERN, FRESHER, JUNIOR, MIDDLE, SENIOR'
    })
    level: string;

    @IsNotEmpty({ message: 'Description không được để trống' })
    @IsString({ message: 'Description phải là string' })
    description: string;

    @IsNotEmpty({ message: 'Start date không được để trống' })
    @IsDateString({}, { message: 'Start date phải là định dạng ngày hợp lệ (ISO 8601)' })
    startDate: string;

    @IsNotEmpty({ message: 'End date không được để trống' })
    @IsDateString({}, { message: 'End date phải là định dạng ngày hợp lệ (ISO 8601)' })
    endDate: string;

    @IsBoolean({ message: 'isActive phải là boolean' })
    isActive: boolean;
}
