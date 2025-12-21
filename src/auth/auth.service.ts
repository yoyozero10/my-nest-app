import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { response, type Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(username);
        if (user && this.usersService.checkUserPassword(pass, user.password)) {
            return user;
        }
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    async login(user: IUser, response: Response) {
        const { _id, name, email, role } = user;

        // Extract permissions từ role để lưu vào JWT
        const permissions = role?.permissions || [];

        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role,
            permissions // Thêm permissions vào payload
        };

        // Create refresh token with different payload
        const refreshTokenPayload = {
            ...payload,
            type: 'refresh'
        };

        // Create access token with type
        const accessTokenPayload = {
            ...payload,
            type: 'access'
        };

        const refreshToken = this.createRefreshToken(refreshTokenPayload);

        return {
            response,
            access_token: this.jwtService.sign(accessTokenPayload),
            refreshToken,
            user: {
                _id,
                name,
                email,
                role,
                permissions
            }
        };
    }
    async register(registerDto: RegisterDto) {
        // Check if user already exists
        const emailExists = await this.usersService.checkEmailExists(registerDto.email);
        if (emailExists) {
            throw new ConflictException('Email already exists');
        }

        // Hash password and set role to USER
        const hashPassword = this.usersService.hashPassword(registerDto.password);
        const user = await this.usersService.register(
            registerDto.name,
            registerDto.email,
            hashPassword
        );

        // Return only _id and createdAt
        return {
            _id: user._id,
            createdAt: user.createdAt,
        };
    }

    createRefreshToken = (payload: any) => {
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRED') as StringValue,
        });
        return refreshToken;
    }

    refreshToken = async (refreshToken: string, response: Response) => {
        try {
            // Verify refresh token with refresh secret
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            });

            // Find user from database
            const user = await this.usersService.findOne(payload._id) as any;

            // Extract permissions từ role
            const permissions = user.role?.permissions || [];

            // Create new access token
            const accessTokenPayload = {
                sub: "token login",
                iss: "from server",
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions, // Thêm permissions vào payload
                type: 'access'
            };
            // Create new refresh token with fresh user data
            const newRefreshTokenPayload = {
                sub: "token login",
                iss: "from server",
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions, // Thêm permissions vào payload
                type: 'refresh'
            };

            // Set new refresh token cookie
            response.clearCookie('refreshToken');
            const newRefreshToken = this.createRefreshToken(newRefreshTokenPayload);
            response.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                maxAge: ms(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRED') as StringValue),
            });

            return {
                access_token: this.jwtService.sign(accessTokenPayload),
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    permissions
                }
            };
        } catch (error) {
            console.error('Refresh token error:', error.message || error);
            throw new Error('Invalid refresh token');
        }
    }

    logout = async (refreshToken: string) => {
        try {
            // Verify refresh token with refresh secret
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            });

            // Remove refresh token from user using updateUserToken
            await this.usersService.updateUserToken('', payload._id);

            return {
                statusCode: 200,
                message: 'User Logout',
                data: null
            };
        } catch (error) {
            console.error('Logout error:', error.message || error);
            throw new Error('Invalid refresh token');
        }
    }
}
