import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should validate an existing user with correct password', async () => {
      const username = 'testuser';
      const password = 'password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        id: 1,
        username,
        email: 'testuser@example.com',
        password: hashedPassword,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.validateUser(username, password);

      expect(result).toEqual({
        userId: user.id,
        username: user.username,
        email: user.email,
      });
    });

    it('should return null for invalid password', async () => {
      const username = 'testuser';
      const password = 'password';
      const hashedPassword = await bcrypt.hash('wrongpassword', 10);
      const user = {
        id: 1,
        username,
        email: 'testuser@example.com',
        password: hashedPassword,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.validateUser(username, password);

      expect(result).toBeNull();
    });

    it('should create a demo user if not found and credentials match demo list', async () => {
      const username = 'admin';
      const password = 'admin';
      const email = `${username}@example.com`;

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        email,
        password: 'hashedPassword',
      });

      const result = await service.validateUser(username, password);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email,
          password: expect.any(String),
        },
      });

      expect(result).toEqual({
        userId: 1,
        username,
        email,
      });
    });

    it('should return null if user not found and not in demo list', async () => {
      const username = 'unknown';
      const password = 'password';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(username, password);

      expect(result).toBeNull();
    });
  });
});
