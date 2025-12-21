import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/decorator/customize';
import type { IUser } from 'src/users/users.interface';
import { ResponseMessage } from 'src/decorator/customize';

@Controller('debug')
export class DebugController {
    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ResponseMessage('Get current user info')
    getMe(@User() user: IUser) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissionsCount: user.permissions?.length || 0,
            permissions: user.permissions
        };
    }
}
