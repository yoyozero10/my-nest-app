import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateResumeDto {
    @IsNotEmpty({ message: 'URL không được để trống' })
    @IsString({ message: 'URL phải là string' })
    url: string;

    @IsNotEmpty({ message: 'Company ID không được để trống' })
    @IsMongoId({ message: 'Company ID phải là MongoDB ObjectId hợp lệ' })
    companyId: string;

    @IsNotEmpty({ message: 'Job ID không được để trống' })
    @IsMongoId({ message: 'Job ID phải là MongoDB ObjectId hợp lệ' })
    jobId: string;
}
