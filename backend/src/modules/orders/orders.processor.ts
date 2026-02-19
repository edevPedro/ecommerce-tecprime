import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../../database/prisma.service';
import { ProductsService } from '../products/products.service';
import { DEFAULT_STOCK } from '../products/constants';
import { ProductDto } from '../products/dto/product.dto';

@Processor('orders')
export class OrdersProcessor {
  private readonly logger = new Logger(OrdersProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  @Process('createOrder')
  async handleOrder(
    job: Job<CreateOrderDto & { userId: number; orderId: number }>,
  ) {
    this.logger.log(`Processing Order Job: ${job.id}`);
    const { produtos, userId, orderId } = job.data;

    this.logger.log(`Processing order ${orderId} for user ID: ${userId}`);

    try {
      // 1. Fetch external product data (price, name) first
      const productDetailsMap = new Map<number, ProductDto>();
      for (const item of produtos) {
        const product = await this.productsService.findOne(item.productId);
        productDetailsMap.set(item.productId, product);
      }

      // 2. Start Transaction
      await this.prisma.$transaction(async (tx) => {
        let totalAmount = 0;
        const orderItemsToCreate = [];

        for (const item of produtos) {
          const product = productDetailsMap.get(item.productId);
          if (!product) throw new Error(`Invalid product ${item.productId}`);

          // Check Stock
          const stockRecord = await tx.productStock.findUnique({
            where: { productId: item.productId },
          });

          const currentStock = stockRecord
            ? stockRecord.quantity
            : DEFAULT_STOCK;

          if (currentStock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${product.nome}. Available: ${currentStock}`,
            );
          }

          // Update Stock
          if (stockRecord) {
            await tx.productStock.update({
              where: { productId: item.productId },
              data: { quantity: currentStock - item.quantity },
            });
          } else {
            await tx.productStock.create({
              data: {
                productId: item.productId,
                quantity: DEFAULT_STOCK - item.quantity,
              },
            });
          }

          // Prepare Order Item
          const price = Number(product.preco);
          totalAmount += price * item.quantity;
          orderItemsToCreate.push({
            productId: item.productId,
            productName: product.nome,
            price: price,
            quantity: item.quantity,
          });
        }

        // Update Order
        await tx.order.update({
          where: { id: orderId },
          data: {
            totalAmount,
            status: 'COMPLETED',
            items: {
              create: orderItemsToCreate,
            },
          },
        });
      });

      this.logger.log(`Order processed successfully: ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to process order job ${job.id}`, error);
      // Mark order as cancelled if processing fails
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });
      throw error; // Bull will retry based on config
    }
  }
}
