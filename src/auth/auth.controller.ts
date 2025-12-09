import { Controller, Get, Req, Post, UseGuards, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService
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
    @HttpCode(HttpStatus.CREATED)
    async handeLogin(@Req() req) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        const data = await this.authService.login(req.user);
        await this.userService.updateUserToken(data.refreshToken, data._id);
        return {
            statusCode: 201,
            message: 'User Login',
            data: {
                access_token: data.access_token,
                user: {
                    _id: data._id,
                    name: data.name,
                    email: data.email
                }
            }
        };
    }

    @Get('profile')
    getProfile(@Req() req) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return req.user;
    }
}
