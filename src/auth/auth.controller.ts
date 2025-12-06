import { Controller, Get, Req, Post, UseGuards, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterDto } from './dto/register.dto';

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto) {
        const data = await this.authService.register(registerDto);
        return {
            message: 'Register a new user',
            data,
        };
    }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    handeLogin(@Req() req) {
        return this.authService.login(req.user);
    }

    @Get('profile')
    getProfile(@Req() req) {
        return req.user;
    }
}
