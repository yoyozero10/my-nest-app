import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [UsersModule, PassportModule.register({ defaultStrategy: 'local' })],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService]
  //hello
})
export class AuthModule { } 
