import { Controller, Get, Req, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

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
