import { Test, TestingModule } from '@nestjs/testing';
import { OrdersProcessor } from './orders.processor';
import { PrismaService } from '../../database/prisma.service';
import { ProductsService } from '../products/products.service';
import { Job } from 'bull';
import { CreateOrderDto } from './dto/create-order.dto';

describe('OrdersProcessor', () => {
  let processor: OrdersProcessor;

  const mockPrismaService = {
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
    productStock: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    order: {
      update: jest.fn(),
    },
  };

  const mockProductsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersProcessor,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    processor = module.get<OrdersProcessor>(OrdersProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process order successfully', async () => {
    const jobData: CreateOrderDto & { userId: number; orderId: number } = {
      nome: 'Test User',
      email: 'test@example.com',
      endereco: 'Test Address',
      formaPagamento: 'Credit Card',
      userId: 1,
      orderId: 100,
      produtos: [{ productId: 1, quantity: 2 }],
    };

    const job = {
      id: 1,
      data: jobData,
    } as unknown as Job<CreateOrderDto & { userId: number; orderId: number }>;

    mockProductsService.findOne.mockResolvedValue({
      id: 1,
      nome: 'Test Product',
      preco: 100,
    });

    mockPrismaService.productStock.findUnique.mockResolvedValue({
      productId: 1,
      quantity: 50,
    });

    await processor.handleOrder(job);

    expect(mockProductsService.findOne).toHaveBeenCalledWith(1);
    expect(mockPrismaService.productStock.findUnique).toHaveBeenCalledWith({
      where: { productId: 1 },
    });
    expect(mockPrismaService.productStock.update).toHaveBeenCalledWith({
      where: { productId: 1 },
      data: { quantity: 48 },
    });
    expect(mockPrismaService.order.update).toHaveBeenCalledWith({
      where: { id: 100 },
      data: expect.objectContaining({
        status: 'COMPLETED',
        totalAmount: 200,
      }),
    });
  });

  it('should fail if stock is insufficient', async () => {
    const jobData: CreateOrderDto & { userId: number; orderId: number } = {
      nome: 'Test User',
      email: 'test@example.com',
      endereco: 'Test Address',
      formaPagamento: 'Credit Card',
      userId: 1,
      orderId: 100,
      produtos: [{ productId: 1, quantity: 10 }],
    };

    const job = {
      id: 1,
      data: jobData,
    } as unknown as Job<CreateOrderDto & { userId: number; orderId: number }>;

    mockProductsService.findOne.mockResolvedValue({
      id: 1,
      nome: 'Test Product',
      preco: 100,
    });

    mockPrismaService.productStock.findUnique.mockResolvedValue({
      productId: 1,
      quantity: 5, // Less than requested 10
    });

    await expect(processor.handleOrder(job)).rejects.toThrow(
      'Insufficient stock',
    );

    expect(mockPrismaService.order.update).toHaveBeenCalledWith({
      where: { id: 100 },
      data: { status: 'CANCELLED' },
    });
  });
});
