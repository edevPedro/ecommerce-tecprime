import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';

interface UserPayload {
  userId: number;
  username: string;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<UserPayload | null> {
    const email = `${username}@example.com`;

    // Check if user exists in DB first
    let user = await this.prisma.user.findUnique({ where: { email } });

    // If user exists, verify password with bcrypt
    if (user) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        return {
          userId: user.id,
          username: username,
          email: user.email,
        };
      }
    } else {
      // If user does not exist, use hardcoded credentials to create initial account (demo mode)
      const testUsers: Record<string, string> = {
        admin: 'admin',
        user1: 'password',
        user2: 'password',
      };

      if (testUsers[username] && testUsers[username] === pass) {
        const hashedPassword = await bcrypt.hash(pass, 10);

        user = await this.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
          },
        });

        return {
          userId: user.id,
          username: username,
          email: user.email,
        };
      }
    }

    return null;
  }

  login(user: UserPayload) {
    this.logger.log(`User logged in: ${user.username} (ID: ${user.userId})`);
    const payload = {
      username: user.username,
      email: user.email,
      sub: user.userId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
      },
    };
  }
}
