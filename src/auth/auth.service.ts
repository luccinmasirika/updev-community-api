import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bycrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
const { OAuth2Client } = require('google-auth-library');

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  private async hashMatch(pwd: string, hash: string): Promise<boolean> {
    return await bycrypt.compare(pwd, hash);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException("Cet utilisateur n'existe pas");
    }
    if (!(await this.hashMatch(password, user.password))) {
      throw new ForbiddenException('Mot de passe incorrect');
    }
    if (user.accountStatus === 'DISABLED') {
      throw new ForbiddenException('Votre compte a été désactivé');
    }
    if (user.accountStatus === 'DELETED') {
      throw new NotFoundException("Cet utilisateur n'existe pas");
    }
    if (user.accountStatus === 'PENDING') {
      throw new ForbiddenException(
        'Vous devez activer votre compte avant de vous connecter',
      );
    }
    return user;
  }

  async login(user: any): Promise<any> {
    const payload = { email: user?.email, password: user?.password };
    const profile = await this.usersService.findOneByEmail(payload.email);
    delete profile.password;
    return {
      jwt: this.jwtService.sign(payload),
      user: profile,
    };
  }

  // register with google or login with google account if already registered
  async googleLogin(token: string) {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const user = await this.usersService.findOneByEmail(payload.email);
    if (user) {
      return this.login(user);
    } else {
      const newUser = await this.usersService.register({
        email: payload.email,
        password: payload.sub,
        firstName: payload.given_name,
        lastName: payload.family_name,
      });
      return this.login(newUser);
      const token = await this.login(newUser);
      return { ...token, new: true };
    }
  }
}
