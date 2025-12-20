import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { SoftDeleteModel } from 'mongoose-delete';
import type { PermissionDocument } from 'src/permissions/schemas/permission.schema';
import type { RoleDocument } from 'src/roles/schemas/role.schema';
import type { UserDocument } from 'src/users/schemas/user.schema';
import type { CompanyDocument } from 'src/companies/schemas/company.schema';
import type { JobDocument } from 'src/jobs/schemas/job.schema';
import type { ResumeDocument } from 'src/resumes/schemas/resume.schema';
import bcrypt from 'bcryptjs';

@Injectable()
export class DatabasesService implements OnModuleInit {
    private readonly logger = new Logger(DatabasesService.name);

    constructor(
        @InjectModel('Permission')
        private permissionModel: SoftDeleteModel<PermissionDocument>,
        @InjectModel('Role')
        private roleModel: SoftDeleteModel<RoleDocument>,
        @InjectModel('User')
        private userModel: SoftDeleteModel<UserDocument>,
        @InjectModel('Company')
        private companyModel: SoftDeleteModel<CompanyDocument>,
        @InjectModel('Job')
        private jobModel: SoftDeleteModel<JobDocument>,
        @InjectModel('Resume')
        private resumeModel: SoftDeleteModel<ResumeDocument>,
    ) { }

    async onModuleInit() {
        const isInit = await this.permissionModel.countDocuments({});
        if (isInit === 0) {
            await this.initPermissions();
            await this.initRoles();
            await this.initUsers();
            await this.initCompanies();
            await this.initJobs();
            await this.initResumes();
        }
    }

    async initPermissions() {
        this.logger.log('>>> START INIT PERMISSIONS');

        const permissions = [
            // Users Module
            { name: 'Create User', apiPath: '/api/v1/users', method: 'POST', module: 'USERS' },
            { name: 'Get Users with Pagination', apiPath: '/api/v1/users', method: 'GET', module: 'USERS' },
            { name: 'Get User by ID', apiPath: '/api/v1/users/:id', method: 'GET', module: 'USERS' },
            { name: 'Update User', apiPath: '/api/v1/users', method: 'PATCH', module: 'USERS' },
            { name: 'Delete User', apiPath: '/api/v1/users/:id', method: 'DELETE', module: 'USERS' },

            // Companies Module
            { name: 'Create Company', apiPath: '/api/v1/companies', method: 'POST', module: 'COMPANIES' },
            { name: 'Get Companies with Pagination', apiPath: '/api/v1/companies', method: 'GET', module: 'COMPANIES' },
            { name: 'Get Company by ID', apiPath: '/api/v1/companies/:id', method: 'GET', module: 'COMPANIES' },
            { name: 'Update Company', apiPath: '/api/v1/companies', method: 'PATCH', module: 'COMPANIES' },
            { name: 'Delete Company', apiPath: '/api/v1/companies/:id', method: 'DELETE', module: 'COMPANIES' },

            // Jobs Module
            { name: 'Create Job', apiPath: '/api/v1/jobs', method: 'POST', module: 'JOBS' },
            { name: 'Get Jobs with Pagination', apiPath: '/api/v1/jobs', method: 'GET', module: 'JOBS' },
            { name: 'Get Job by ID', apiPath: '/api/v1/jobs/:id', method: 'GET', module: 'JOBS' },
            { name: 'Update Job', apiPath: '/api/v1/jobs/:id', method: 'PATCH', module: 'JOBS' },
            { name: 'Delete Job', apiPath: '/api/v1/jobs/:id', method: 'DELETE', module: 'JOBS' },

            // Resumes Module
            { name: 'Create Resume', apiPath: '/api/v1/resumes', method: 'POST', module: 'RESUMES' },
            { name: 'Get Resumes with Pagination', apiPath: '/api/v1/resumes', method: 'GET', module: 'RESUMES' },
            { name: 'Get Resume by ID', apiPath: '/api/v1/resumes/:id', method: 'GET', module: 'RESUMES' },
            { name: 'Update Resume Status', apiPath: '/api/v1/resumes/:id', method: 'PATCH', module: 'RESUMES' },
            { name: 'Delete Resume', apiPath: '/api/v1/resumes/:id', method: 'DELETE', module: 'RESUMES' },
            { name: 'Get Resumes by User', apiPath: '/api/v1/resumes/by-user', method: 'POST', module: 'RESUMES' },

            // Permissions Module
            { name: 'Create Permission', apiPath: '/api/v1/permissions', method: 'POST', module: 'PERMISSIONS' },
            { name: 'Get Permissions with Pagination', apiPath: '/api/v1/permissions', method: 'GET', module: 'PERMISSIONS' },
            { name: 'Get Permission by ID', apiPath: '/api/v1/permissions/:id', method: 'GET', module: 'PERMISSIONS' },
            { name: 'Update Permission', apiPath: '/api/v1/permissions/:id', method: 'PATCH', module: 'PERMISSIONS' },
            { name: 'Delete Permission', apiPath: '/api/v1/permissions/:id', method: 'DELETE', module: 'PERMISSIONS' },

            // Roles Module
            { name: 'Create Role', apiPath: '/api/v1/roles', method: 'POST', module: 'ROLES' },
            { name: 'Get Roles with Pagination', apiPath: '/api/v1/roles', method: 'GET', module: 'ROLES' },
            { name: 'Get Role by ID', apiPath: '/api/v1/roles/:id', method: 'GET', module: 'ROLES' },
            { name: 'Update Role', apiPath: '/api/v1/roles/:id', method: 'PATCH', module: 'ROLES' },
            { name: 'Delete Role', apiPath: '/api/v1/roles/:id', method: 'DELETE', module: 'ROLES' },

            // Files Module
            { name: 'Upload File', apiPath: '/api/v1/files/upload', method: 'POST', module: 'FILES' },
        ];

        await this.permissionModel.insertMany(permissions);
        this.logger.log(`>>> Created ${permissions.length} permissions`);
    }

    async initRoles() {
        this.logger.log('>>> START INIT ROLES');

        const permissions = await this.permissionModel.find({}).select('_id name').lean();

        // ADMIN - Full permissions
        const adminPermissions = permissions.map(p => p._id);

        // HR - Manage jobs, resumes, companies
        const hrPermissions = permissions
            .filter(p => ['JOBS', 'RESUMES', 'COMPANIES'].includes(p.name.split(' ').pop() || ''))
            .map(p => p._id);

        // USER - View jobs, create/view own resumes
        const userPermissions = permissions
            .filter(p =>
                p.name.includes('Get Jobs') ||
                p.name.includes('Get Job by ID') ||
                p.name.includes('Create Resume') ||
                p.name.includes('Get Resumes by User')
            )
            .map(p => p._id);

        const roles = [
            {
                name: 'ADMIN',
                description: 'Administrator with full system access',
                isActive: true,
                permissions: adminPermissions,
            },
            {
                name: 'HR',
                description: 'HR Manager - Manage jobs, resumes, and companies',
                isActive: true,
                permissions: hrPermissions,
            },
            {
                name: 'USER',
                description: 'Normal User - View jobs and manage own resumes',
                isActive: true,
                permissions: userPermissions,
            },
        ];

        await this.roleModel.insertMany(roles);
        this.logger.log(`>>> Created ${roles.length} roles`);
    }

    async initUsers() {
        this.logger.log('>>> START INIT USERS');

        // Hash password mặc định: 123456
        const defaultPassword = bcrypt.hashSync('123456', 10);

        const users = [
            // ADMIN Users
            {
                email: 'admin@gmail.com',
                password: defaultPassword,
                name: 'Admin System',
                age: 30,
                gender: 'Male',
                address: 'Hà Nội, Việt Nam',
                role: 'ADMIN',
            },
            {
                email: 'superadmin@gmail.com',
                password: defaultPassword,
                name: 'Super Admin',
                age: 35,
                gender: 'Male',
                address: 'Hồ Chí Minh, Việt Nam',
                role: 'ADMIN',
            },

            // HR Users
            {
                email: 'hr1@gmail.com',
                password: defaultPassword,
                name: 'Nguyễn Văn HR',
                age: 28,
                gender: 'Male',
                address: 'Đà Nẵng, Việt Nam',
                role: 'HR',
            },
            {
                email: 'hr2@gmail.com',
                password: defaultPassword,
                name: 'Trần Thị Hương',
                age: 26,
                gender: 'Female',
                address: 'Hải Phòng, Việt Nam',
                role: 'HR',
            },
            {
                email: 'hr.manager@gmail.com',
                password: defaultPassword,
                name: 'Lê Minh Quản',
                age: 32,
                gender: 'Male',
                address: 'Cần Thơ, Việt Nam',
                role: 'HR',
            },

            // Normal Users
            {
                email: 'user1@gmail.com',
                password: defaultPassword,
                name: 'Phạm Văn An',
                age: 24,
                gender: 'Male',
                address: 'Hà Nội, Việt Nam',
                role: 'USER',
            },
            {
                email: 'user2@gmail.com',
                password: defaultPassword,
                name: 'Hoàng Thị Bình',
                age: 23,
                gender: 'Female',
                address: 'Hồ Chí Minh, Việt Nam',
                role: 'USER',
            },
            {
                email: 'user3@gmail.com',
                password: defaultPassword,
                name: 'Đỗ Minh Châu',
                age: 25,
                gender: 'Male',
                address: 'Đà Nẵng, Việt Nam',
                role: 'USER',
            },
            {
                email: 'user4@gmail.com',
                password: defaultPassword,
                name: 'Vũ Thị Dung',
                age: 22,
                gender: 'Female',
                address: 'Nha Trang, Việt Nam',
                role: 'USER',
            },
            {
                email: 'user5@gmail.com',
                password: defaultPassword,
                name: 'Bùi Văn Em',
                age: 27,
                gender: 'Male',
                address: 'Huế, Việt Nam',
                role: 'USER',
            },
        ];

        await this.userModel.insertMany(users);
        this.logger.log(`>>> Created ${users.length} users`);
        this.logger.log('>>> Default password for all users: 123456');
    }

    async initCompanies() {
        this.logger.log('>>> START INIT COMPANIES');

        const companies = [
            {
                name: 'FPT Software',
                address: 'Hà Nội, Việt Nam',
                description: 'Công ty phần mềm hàng đầu Việt Nam, chuyên về outsourcing và giải pháp công nghệ',
                logo: 'https://example.com/fpt-logo.png',
            },
            {
                name: 'VNG Corporation',
                address: 'Hồ Chí Minh, Việt Nam',
                description: 'Tập đoàn công nghệ hàng đầu với các sản phẩm game, mạng xã hội và fintech',
                logo: 'https://example.com/vng-logo.png',
            },
            {
                name: 'Tiki',
                address: 'Hồ Chí Minh, Việt Nam',
                description: 'Sàn thương mại điện tử lớn nhất Việt Nam',
                logo: 'https://example.com/tiki-logo.png',
            },
            {
                name: 'Grab Vietnam',
                address: 'Hà Nội, Việt Nam',
                description: 'Nền tảng siêu ứng dụng hàng đầu Đông Nam Á',
                logo: 'https://example.com/grab-logo.png',
            },
            {
                name: 'Viettel Solutions',
                address: 'Hà Nội, Việt Nam',
                description: 'Công ty giải pháp công nghệ của Tập đoàn Viettel',
                logo: 'https://example.com/viettel-logo.png',
            },
        ];

        await this.companyModel.insertMany(companies);
        this.logger.log(`>>> Created ${companies.length} companies`);
    }

    async initJobs() {
        this.logger.log('>>> START INIT JOBS');

        // Lấy danh sách companies đã tạo
        const companies = await this.companyModel.find().lean();

        if (companies.length === 0) {
            this.logger.warn('>>> No companies found, skipping jobs seeding');
            return;
        }

        const jobs = [
            {
                name: 'Senior Backend Developer',
                skills: ['Node.js', 'NestJS', 'MongoDB', 'PostgreSQL', 'Docker'],
                company: {
                    _id: companies[0]._id,
                    name: companies[0].name,
                },
                salary: 30000000,
                quantity: 2,
                level: 'SENIOR',
                description: 'Tìm kiếm Senior Backend Developer có kinh nghiệm với Node.js và NestJS',
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-03-31'),
                isActive: true,
            },
            {
                name: 'Frontend Developer (React)',
                skills: ['React', 'TypeScript', 'Redux', 'TailwindCSS'],
                company: {
                    _id: companies[1]._id,
                    name: companies[1].name,
                },
                salary: 20000000,
                quantity: 3,
                level: 'MIDDLE',
                description: 'Cần tuyển Frontend Developer giỏi React và TypeScript',
                startDate: new Date('2025-01-15'),
                endDate: new Date('2025-04-15'),
                isActive: true,
            },
            {
                name: 'Full Stack Developer',
                skills: ['React', 'Node.js', 'MongoDB', 'Express'],
                company: {
                    _id: companies[2]._id,
                    name: companies[2].name,
                },
                salary: 25000000,
                quantity: 2,
                level: 'MIDDLE',
                description: 'Full Stack Developer cho dự án e-commerce',
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-05-01'),
                isActive: true,
            },
            {
                name: 'DevOps Engineer',
                skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
                company: {
                    _id: companies[3]._id,
                    name: companies[3].name,
                },
                salary: 35000000,
                quantity: 1,
                level: 'SENIOR',
                description: 'DevOps Engineer quản lý hạ tầng cloud và CI/CD',
                startDate: new Date('2025-01-10'),
                endDate: new Date('2025-04-10'),
                isActive: true,
            },
            {
                name: 'Mobile Developer (Flutter)',
                skills: ['Flutter', 'Dart', 'Firebase', 'REST API'],
                company: {
                    _id: companies[4]._id,
                    name: companies[4].name,
                },
                salary: 22000000,
                quantity: 2,
                level: 'JUNIOR',
                description: 'Mobile Developer phát triển ứng dụng với Flutter',
                startDate: new Date('2025-02-15'),
                endDate: new Date('2025-05-15'),
                isActive: true,
            },
            {
                name: 'Data Engineer',
                skills: ['Python', 'Spark', 'Hadoop', 'SQL', 'ETL'],
                company: {
                    _id: companies[0]._id,
                    name: companies[0].name,
                },
                salary: 28000000,
                quantity: 1,
                level: 'MIDDLE',
                description: 'Data Engineer xây dựng data pipeline',
                startDate: new Date('2025-01-20'),
                endDate: new Date('2025-04-20'),
                isActive: true,
            },
            {
                name: 'QA Engineer',
                skills: ['Selenium', 'Jest', 'Postman', 'API Testing'],
                company: {
                    _id: companies[1]._id,
                    name: companies[1].name,
                },
                salary: 18000000,
                quantity: 2,
                level: 'JUNIOR',
                description: 'QA Engineer đảm bảo chất lượng sản phẩm',
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-05-01'),
                isActive: true,
            },
            {
                name: 'UI/UX Designer',
                skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
                company: {
                    _id: companies[2]._id,
                    name: companies[2].name,
                },
                salary: 20000000,
                quantity: 1,
                level: 'MIDDLE',
                description: 'UI/UX Designer thiết kế giao diện người dùng',
                startDate: new Date('2025-01-25'),
                endDate: new Date('2025-04-25'),
                isActive: true,
            },
            {
                name: 'Intern Backend Developer',
                skills: ['JavaScript', 'Node.js', 'Git', 'REST API'],
                company: {
                    _id: companies[3]._id,
                    name: companies[3].name,
                },
                salary: 5000000,
                quantity: 5,
                level: 'INTERN',
                description: 'Thực tập sinh Backend Developer',
                startDate: new Date('2025-03-01'),
                endDate: new Date('2025-06-01'),
                isActive: true,
            },
            {
                name: 'Product Manager',
                skills: ['Agile', 'Scrum', 'JIRA', 'Product Strategy'],
                company: {
                    _id: companies[4]._id,
                    name: companies[4].name,
                },
                salary: 40000000,
                quantity: 1,
                level: 'SENIOR',
                description: 'Product Manager quản lý sản phẩm công nghệ',
                startDate: new Date('2025-01-05'),
                endDate: new Date('2025-04-05'),
                isActive: true,
            },
        ];

        await this.jobModel.insertMany(jobs);
        this.logger.log(`>>> Created ${jobs.length} jobs`);
    }

    async initResumes() {
        this.logger.log('>>> START INIT RESUMES');

        // Lấy users, companies và jobs
        const users = await this.userModel.find({ role: 'USER' }).lean();
        const companies = await this.companyModel.find().lean();
        const jobs = await this.jobModel.find().lean();

        if (users.length === 0 || companies.length === 0 || jobs.length === 0) {
            this.logger.warn('>>> Missing users, companies or jobs, skipping resumes seeding');
            return;
        }

        const statuses = ['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED'];
        const resumes: any[] = [];

        // Tạo 15 resumes với dữ liệu đa dạng
        for (let i = 0; i < 15; i++) {
            const user = users[i % users.length];
            const company = companies[i % companies.length];
            const job = jobs[i % jobs.length];
            const status = statuses[i % statuses.length];

            resumes.push({
                email: user.email,
                userId: user._id,
                url: `https://example.com/resumes/cv-${user.email.split('@')[0]}-${i + 1}.pdf`,
                status: status,
                companyId: company._id,
                jobId: job._id,
                history: [{
                    status: status,
                    updatedAt: new Date(),
                    updatedBy: {
                        _id: user._id,
                        email: user.email,
                    }
                }],
                createdBy: {
                    _id: user._id,
                    email: user.email,
                },
            });
        }

        await this.resumeModel.insertMany(resumes);
        this.logger.log(`>>> Created ${resumes.length} resumes`);
    }
}
