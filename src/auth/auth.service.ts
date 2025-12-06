import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterDto } from './dto/register.dto';


@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) { }
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
        return {
            access_token: this.jwtService.sign(payload),
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
}
