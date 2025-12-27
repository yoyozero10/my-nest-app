# Mail Module - Hướng dẫn sử dụng

Module gửi email cho ứng dụng NestJS sử dụng `@nestjs-modules/mailer` và Nodemailer.

## Cấu hình

### 1. Biến môi trường (.env)

```env
# Email Configuration
MAIL_HOST = smtp.gmail.com
MAIL_PORT = 587
MAIL_USER = your-email@gmail.com
MAIL_PASS = your-app-password
MAIL_FROM = "NestJS App <noreply@nestjs-app.com>"
MAIL_PREVIEW = false

# Application URL
APP_URL = http://localhost:8000
```

### 2. Lấy App Password từ Gmail

1. Đăng nhập vào tài khoản Google
2. Truy cập: https://myaccount.google.com/security
3. Bật "2-Step Verification" (xác thực 2 bước)
4. Tìm "App passwords" (Mật khẩu ứng dụng)
5. Tạo mật khẩu mới cho "Mail"
6. Copy mật khẩu 16 ký tự và paste vào `MAIL_PASS`

**Lưu ý:** Không sử dụng mật khẩu Gmail thông thường!

## Sử dụng trong Code

### 1. Import MailModule

Trong module của bạn:

```typescript
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  // ...
})
export class YourModule {}
```

### 2. Inject MailService

```typescript
import { MailService } from '../mail/mail.service';

@Injectable()
export class YourService {
  constructor(private readonly mailService: MailService) {}

  async someMethod() {
    // Sử dụng mailService ở đây
  }
}
```

## Các phương thức có sẵn

### 1. Gửi email đơn giản

```typescript
await this.mailService.sendMail(
  'user@example.com',
  'Tiêu đề email',
  'Nội dung text',
  '<h1>Nội dung HTML</h1>' // optional
);
```

### 2. Gửi email chào mừng

```typescript
await this.mailService.sendWelcomeEmail(
  'user@example.com',
  'Nguyễn Văn A'
);
```

### 3. Gửi email reset password

```typescript
await this.mailService.sendResetPasswordEmail(
  'user@example.com',
  'Nguyễn Văn A',
  'reset-token-here'
);
```

### 4. Gửi email xác thực

```typescript
await this.mailService.sendVerificationEmail(
  'user@example.com',
  'Nguyễn Văn A',
  'verification-token-here'
);
```

### 5. Gửi thông báo job mới

```typescript
await this.mailService.sendNewJobNotification(
  'subscriber@example.com',
  'Nguyễn Văn A',
  'Senior Developer',
  'ABC Company',
  50000000,
  ['JavaScript', 'TypeScript', 'NestJS'],
  'job-id-here'
);
```

### 6. Gửi email với template

```typescript
await this.mailService.sendMailWithTemplate(
  'user@example.com',
  'Tiêu đề',
  'welcome', // tên file template (welcome.hbs)
  {
    name: 'Nguyễn Văn A',
    appUrl: 'http://localhost:8000'
  }
);
```

## API Endpoints (để test)

### GET /api/v1/mail/test
Kiểm tra mail service có hoạt động không

```bash
curl http://localhost:8000/api/v1/mail/test
```

### POST /api/v1/mail/send
Gửi email đơn giản

```bash
curl -X POST http://localhost:8000/api/v1/mail/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Test Email",
    "text": "This is a test email",
    "html": "<h1>This is a test email</h1>"
  }'
```

### POST /api/v1/mail/welcome
Gửi email chào mừng

```bash
curl -X POST http://localhost:8000/api/v1/mail/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "name": "Nguyễn Văn A"
  }'
```

### POST /api/v1/mail/job-notification
Gửi thông báo job mới

```bash
curl -X POST http://localhost:8000/api/v1/mail/job-notification \
  -H "Content-Type: application/json" \
  -d '{
    "to": "subscriber@example.com",
    "subscriberName": "Nguyễn Văn A",
    "jobTitle": "Senior Developer",
    "jobCompany": "ABC Company",
    "jobSalary": 50000000,
    "jobSkills": ["JavaScript", "TypeScript", "NestJS"],
    "jobId": "123456"
  }'
```

## Templates

Templates được lưu trong `src/mail/templates/` và sử dụng Handlebars.

### Tạo template mới

1. Tạo file `.hbs` trong `src/mail/templates/`
2. Sử dụng cú pháp Handlebars:

```handlebars
<!DOCTYPE html>
<html>
<body>
    <h1>Xin chào {{name}}!</h1>
    <p>{{message}}</p>
</body>
</html>
```

3. Gọi template:

```typescript
await this.mailService.sendMailWithTemplate(
  'user@example.com',
  'Subject',
  'your-template', // tên file không cần .hbs
  {
    name: 'User Name',
    message: 'Your message here'
  }
);
```

## Ví dụ tích hợp

### Gửi email khi tạo user mới

```typescript
// users.service.ts
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly mailService: MailService,
    // ... other dependencies
  ) {}

  async create(createUserDto: CreateUserDto) {
    // Tạo user
    const user = await this.userModel.create(createUserDto);

    // Gửi email chào mừng
    await this.mailService.sendWelcomeEmail(
      user.email,
      user.name
    );

    return user;
  }
}
```

### Gửi email khi tạo job mới cho subscribers

```typescript
// jobs.service.ts
import { MailService } from '../mail/mail.service';
import { SubscribersService } from '../subscribers/subscribers.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly mailService: MailService,
    private readonly subscribersService: SubscribersService,
    // ... other dependencies
  ) {}

  async create(createJobDto: CreateJobDto) {
    // Tạo job
    const job = await this.jobModel.create(createJobDto);

    // Lấy danh sách subscribers có skills phù hợp
    const subscribers = await this.subscribersService.findBySkills(
      createJobDto.skills
    );

    // Gửi email thông báo cho từng subscriber
    for (const subscriber of subscribers) {
      await this.mailService.sendNewJobNotification(
        subscriber.email,
        subscriber.name,
        job.name,
        job.company.name,
        job.salary,
        job.skills,
        job._id.toString()
      );
    }

    return job;
  }
}
```

## Troubleshooting

### Lỗi: "Invalid login"
- Kiểm tra MAIL_USER và MAIL_PASS
- Đảm bảo đã bật 2-Step Verification
- Sử dụng App Password, không phải mật khẩu Gmail

### Lỗi: "Connection timeout"
- Kiểm tra MAIL_HOST và MAIL_PORT
- Kiểm tra firewall/antivirus
- Thử đổi port: 465 (secure: true) hoặc 587 (secure: false)

### Email không gửi được
- Kiểm tra logs trong console
- Kiểm tra spam folder
- Đảm bảo email người nhận hợp lệ

### Template không tìm thấy
- Kiểm tra tên file template (không cần .hbs khi gọi)
- Kiểm tra đường dẫn thư mục templates
- Đảm bảo file template tồn tại

## Best Practices

1. **Async/Await**: Luôn sử dụng await khi gửi email
2. **Error Handling**: Wrap trong try-catch để xử lý lỗi
3. **Queue**: Với số lượng email lớn, nên sử dụng queue (Bull, BullMQ)
4. **Rate Limiting**: Giới hạn số email gửi để tránh bị spam
5. **Testing**: Test với email thật trước khi deploy
6. **Environment**: Sử dụng email service khác nhau cho dev/prod

## Dependencies

```json
{
  "@nestjs-modules/mailer": "^latest",
  "nodemailer": "^latest",
  "handlebars": "^latest",
  "@types/nodemailer": "^latest"
}
```
