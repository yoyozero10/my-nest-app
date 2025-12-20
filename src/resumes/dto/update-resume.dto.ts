import { IsNotEmpty, IsEnum } from 'class-validator';

export class UpdateResumeDto {
    @IsNotEmpty({ message: 'Status không được để trống' })
    @IsEnum(['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED'], {
        message: 'Status phải là một trong các giá trị: PENDING, REVIEWING, APPROVED, REJECTED'
    })
    status: string;
}
