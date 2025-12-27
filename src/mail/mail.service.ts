import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Gửi email đơn giản
     */
    async sendMail(to: string, subject: string, text: string, html?: string) {
        try {
            await this.mailerService.sendMail({
                to,
                subject,
                text,
                html: html || text,
            });
            return { success: true, message: 'Email đã được gửi thành công' };
        } catch (error) {
            console.error('Lỗi gửi email:', error);
            return { success: false, message: 'Gửi email thất bại', error: error.message };
        }
    }

    /**
     * Gửi email với template
     */
    async sendMailWithTemplate(
        to: string,
        subject: string,
        template: string,
        context: any,
    ) {
        try {
            await this.mailerService.sendMail({
                to,
                subject,
                template,
                context,
            });
            return { success: true, message: 'Email đã được gửi thành công' };
        } catch (error) {
            console.error('Lỗi gửi email:', error);
            return { success: false, message: 'Gửi email thất bại', error: error.message };
        }
    }

    /**
     * Gửi email chào mừng
     */
    async sendWelcomeEmail(to: string, name: string) {
        const subject = 'Chào mừng bạn đến với NestJS App!';
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Xin chào ${name}!</h2>
        <p>Chào mừng bạn đến với NestJS App. Chúng tôi rất vui khi bạn tham gia cộng đồng của chúng tôi.</p>
        <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
        <br>
        <p>Trân trọng,<br>Đội ngũ NestJS App</p>
      </div>
    `;

        return this.sendMail(to, subject, `Chào mừng ${name}!`, html);
    }

    /**
     * Gửi email reset password
     */
    async sendResetPasswordEmail(to: string, name: string, resetToken: string) {
        const resetUrl = `${this.configService.get('APP_URL')}/reset-password?token=${resetToken}`;
        const subject = 'Yêu cầu đặt lại mật khẩu';
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Xin chào ${name}!</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
        <p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Đặt lại mật khẩu
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Hoặc copy link sau vào trình duyệt:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Link này sẽ hết hạn sau 1 giờ.
        </p>
        <p style="color: #666; font-size: 14px;">
          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        </p>
        <br>
        <p>Trân trọng,<br>Đội ngũ NestJS App</p>
      </div>
    `;

        return this.sendMail(to, subject, `Đặt lại mật khẩu cho ${name}`, html);
    }

    /**
     * Gửi email thông báo job mới cho subscriber
     */
    async sendNewJobNotification(
        to: string,
        subscriberName: string,
        jobTitle: string,
        jobCompany: string,
        jobSalary: number,
        jobSkills: string[],
        jobId: string,
    ) {
        const jobUrl = `${this.configService.get('APP_URL')}/jobs/${jobId}`;
        const subject = `Công việc mới phù hợp với bạn: ${jobTitle}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Xin chào ${subscriberName}!</h2>
        <p>Chúng tôi có một công việc mới phù hợp với kỹ năng của bạn:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2196F3; margin-top: 0;">${jobTitle}</h3>
          <p><strong>Công ty:</strong> ${jobCompany}</p>
          <p><strong>Mức lương:</strong> ${jobSalary.toLocaleString('vi-VN')} VNĐ</p>
          <p><strong>Kỹ năng yêu cầu:</strong></p>
          <ul>
            ${jobSkills.map(skill => `<li>${skill}</li>`).join('')}
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${jobUrl}" 
             style="background-color: #2196F3; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Xem chi tiết công việc
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          Nếu bạn không muốn nhận email thông báo nữa, vui lòng cập nhật cài đặt trong tài khoản của bạn.
        </p>
        <br>
        <p>Chúc bạn may mắn!<br>Đội ngũ NestJS App</p>
      </div>
    `;

        return this.sendMail(to, subject, `Công việc mới: ${jobTitle}`, html);
    }

    /**
     * Gửi email xác nhận đăng ký
     */
    async sendVerificationEmail(to: string, name: string, verificationToken: string) {
        const verifyUrl = `${this.configService.get('APP_URL')}/verify-email?token=${verificationToken}`;
        const subject = 'Xác nhận địa chỉ email của bạn';
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Xin chào ${name}!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác nhận địa chỉ email của bạn bằng cách nhấp vào nút bên dưới:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Xác nhận Email
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          Hoặc copy link sau vào trình duyệt:<br>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </p>

        <p style="color: #666; font-size: 14px;">
          Link này sẽ hết hạn sau 24 giờ.
        </p>
        <br>
        <p>Trân trọng,<br>Đội ngũ NestJS App</p>
      </div>
    `;

        return this.sendMail(to, subject, `Xác nhận email cho ${name}`, html);
    }
}
