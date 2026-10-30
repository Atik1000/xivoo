import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthedRequest } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: { email?: string; password?: string }) {
    return this.auth.login(body.email ?? '', body.password ?? '');
  }

  @Post('signup')
  signup(@Body() body: { name?: string; email?: string; password?: string }) {
    return this.auth.signup(body.name ?? '', body.email ?? '', body.password ?? '');
  }

  @Post('logout')
  logout(@Req() req: AuthedRequest) {
    const header = req.headers.authorization ?? '';
    if (header.startsWith('Bearer ')) this.auth.logout(header.slice(7));
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: AuthedRequest) {
    return req.user;
  }
}
