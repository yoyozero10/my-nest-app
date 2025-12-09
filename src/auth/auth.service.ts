import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';

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
    async login(user: IUser) {
        const { _id, name, email, role } = user;
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
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
            access_token: this.jwtService.sign(accessTokenPayload),
            refreshToken,
            _id,
            name,
            email,
            role
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
            expiresIn: ms(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRED') as StringValue) / 1000,
        });
        return refreshToken;
    }
}

