import { Controller, Get, Req, Post, UseGuards, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, User } from '../decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import type { Response } from 'express';
import ms from 'ms';
import { ConfigService } from '@nestjs/config';
import type { IUser as UserInterface } from '../users/users.interface';

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService,
        private readonly configService: ConfigService
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
    async handeLogin(
        @Req() req,
        @Res({ passthrough: true }) response: Response
    ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        const data = await this.authService.login(req.user, response);
        await this.userService.updateUserToken(data.refreshToken, data.user._id);
        response.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            maxAge: ms('7d')
        });
        return {
            statusCode: 201,
            message: 'User Login',
            data: {
                access_token: data.access_token,
                user: data.user
            }
        };
    }

    @Get('account')
    @HttpCode(HttpStatus.CREATED)
    getAccount(@User() user: UserInterface) {
        return {
            statusCode: 200,
            message: 'User Information',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    permissions: user.role?.permissions || []
                }
            }
        };
    }

    @Public()
    @Get('refresh')
    @HttpCode(HttpStatus.CREATED)
    async refreshToken(
        @Req() req,
        @Res({ passthrough: true }) response: Response
    ) {
        const refreshToken = req.cookies.refreshToken;
        return this.authService.refreshToken(refreshToken, response);
    }

    @Post('logout')
    @HttpCode(HttpStatus.CREATED)
    async logout(
        @Req() req,
        @Res({ passthrough: true }) response: Response
    ) {
        const refreshToken = req.cookies.refreshToken;
        await this.authService.logout(refreshToken);
        response.clearCookie('refreshToken');
        return {
            statusCode: 200,
            message: 'User Logout',
            data: null
        };
    }
}
