import {
  Injectable,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('orders') private ordersQueue: Queue,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    this.logger.log(`Creating pending order for User ID: ${userId}`);

    // Create PENDING order
    const order = await this.prisma.order.create({
      data: {
        userId,
        totalAmount: 0, // Will be updated by processor
        status: 'PENDING',
        paymentMethod: createOrderDto.formaPagamento,
      },
    });

    this.logger.log(`[ORDER_CREATED] Order #${order.id} created for User ${userId}. Items: ${createOrderDto.produtos.length}`);

    this.logger.log(`Queueing new order job for order ${order.id}`);

    // Add job to the queue
    const job = await this.ordersQueue.add(
      'createOrder',
      { ...createOrderDto, userId, orderId: order.id },
      {
        attempts: 3,
        backoff: 1000,
      },
    );

    return {
      message: 'Order received and processing started',
      jobId: job.id,
      id: order.id,
    };
  }

  async findAllByUserId(userId: number) {
    this.logger.log(`Fetching orders for user ID: ${userId}`);
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.userId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to access order ${id} belonging to ${order.userId}`,
      );
      throw new ForbiddenException(
        'You do not have permission to view this order',
      );
    }

    return order;
  }
}
