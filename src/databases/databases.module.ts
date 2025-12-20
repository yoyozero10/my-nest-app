import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabasesService } from './databases.service';
import { Permission, PermissionSchema } from 'src/permissions/schemas/permission.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Company, CompanySchema } from 'src/companies/schemas/company.schema';
import { Job, JobSchema } from 'src/jobs/schemas/job.schema';
import { Resume, ResumeSchema } from 'src/resumes/schemas/resume.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Permission.name, schema: PermissionSchema },
            { name: Role.name, schema: RoleSchema },
            { name: User.name, schema: UserSchema },
            { name: Company.name, schema: CompanySchema },
            { name: Job.name, schema: JobSchema },
            { name: Resume.name, schema: ResumeSchema },
        ]),
    ],
    providers: [DatabasesService],
})
export class DatabasesModule { }
