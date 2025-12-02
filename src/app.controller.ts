import { Controller, Get, Req, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { Public } from './decorator/customize';
import { LocalAuthGuard } from './auth/local-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService
  ) { }

  // @Public()
  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // handeLogin(@Req() req) {
  //   return this.authService.login(req.user);
  // }

  // @Get('profile')
  // getProfile(@Req() req) {
  //   return req.user;
  // }

}
