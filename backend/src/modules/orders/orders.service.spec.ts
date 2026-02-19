import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../database/prisma.service';
import { getQueueToken } from '@nestjs/bull';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockOrdersQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: getQueueToken('orders'),
          useValue: mockOrdersQueue,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a pending order and add a job to the queue', async () => {
      const createOrderDto: CreateOrderDto = {
        nome: 'Test User',
        email: 'test@example.com',
        endereco: 'Test Address',
        formaPagamento: 'Credit Card',
        produtos: [{ productId: 1, quantity: 2 }],
      };
      const userId = 1;

      const mockOrder = {
        id: 100,
        userId,
        status: 'PENDING',
        totalAmount: 0,
        paymentMethod: 'Credit Card',
      };

      const mockJob = { id: 'job-123' };

      mockPrismaService.order.create.mockResolvedValue(mockOrder);
      mockOrdersQueue.add.mockResolvedValue(mockJob);

      const result = await service.create(createOrderDto, userId);

      // Verify DB creation
      expect(mockPrismaService.order.create).toHaveBeenCalledWith({
        data: {
          userId,
          totalAmount: 0,
          status: 'PENDING',
          paymentMethod: createOrderDto.formaPagamento,
        },
      });

      // Verify Queue addition
      expect(mockOrdersQueue.add).toHaveBeenCalledWith(
        'createOrder',
        { ...createOrderDto, userId, orderId: mockOrder.id },
        expect.any(Object),
      );

      // Verify Response
      expect(result).toEqual({
        message: 'Order received and processing started',
        jobId: mockJob.id,
        id: mockOrder.id,
      });
    });
  });

  describe('findOne', () => {
    it('should return the order if it belongs to the user', async () => {
      const orderId = 100;
      const userId = 1;
      const mockOrder = { id: orderId, userId, items: [] };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne(orderId, userId);
      expect(result).toEqual(mockOrder);
    });

    it('should throw BadRequestException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException if order belongs to another user', async () => {
      const orderId = 100;
      const userId = 1;
      const otherUserId = 2;
      const mockOrder = { id: orderId, userId: otherUserId, items: [] };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.findOne(orderId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
