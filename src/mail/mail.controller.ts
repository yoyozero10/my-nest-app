import { Controller, Post, Body, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';

class SendMailDto {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

class SendWelcomeEmailDto {
    to: string;
    name: string;
}

class SendJobNotificationDto {
    to: string;
    subscriberName: string;
    jobTitle: string;
    jobCompany: string;
    jobSalary: number;
    jobSkills: string[];
    jobId: string;
}

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) { }

    @Get('test')
    @Public()
    @ResponseMessage('Test mail service')
    test() {
        return {
            message: 'Mail service is ready',
            endpoints: {
                sendMail: 'POST /mail/send',
                sendWelcome: 'POST /mail/welcome',
                sendJobNotification: 'POST /mail/job-notification',
            }
        };
    }

    @Post('send')
    @Public()
    @ResponseMessage('Send email')
    async sendMail(@Body() sendMailDto: SendMailDto) {
        return await this.mailService.sendMail(
            sendMailDto.to,
            sendMailDto.subject,
            sendMailDto.text,
            sendMailDto.html,
        );
    }

    @Post('welcome')
    @Public()
    @ResponseMessage('Send welcome email')
    async sendWelcomeEmail(@Body() dto: SendWelcomeEmailDto) {
        return await this.mailService.sendWelcomeEmail(dto.to, dto.name);
    }

    @Post('job-notification')
    @Public()
    @ResponseMessage('Send job notification email')
    async sendJobNotification(@Body() dto: SendJobNotificationDto) {
        return await this.mailService.sendNewJobNotification(
            dto.to,
            dto.subscriberName,
            dto.jobTitle,
            dto.jobCompany,
            dto.jobSalary,
            dto.jobSkills,
            dto.jobId,
        );
    }
}
