import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../database/prisma.service';
import {
  ProductDto,
  ExternalProduct,
  DummyJsonResponse,
} from './dto/product.dto';
import { ProductAdapter } from './product.adapter';
import { DEFAULT_STOCK } from './constants';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly EXTERNAL_API = 'https://dummyjson.com/products';

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll(): Promise<ProductDto[]> {
    const cachedProducts =
      await this.cacheManager.get<ProductDto[]>('products');
    if (cachedProducts) {
      this.logger.log('Returning cached products');
      return cachedProducts;
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<DummyJsonResponse>(this.EXTERNAL_API),
      );

      // Get local stock for all products
      const stocks = await this.prisma.productStock.findMany();
      const stockMap = new Map(stocks.map((s) => [s.productId, s.quantity]));

      const products = data.products.map((externalProduct) => {
        // Default to 100 if no local record exists
        const stock = stockMap.get(externalProduct.id) ?? DEFAULT_STOCK;
        return ProductAdapter.toInternal(externalProduct, stock);
      });

      await this.cacheManager.set('products', products, 60000); // 1 minute
      return products;
    } catch (error) {
      this.logger.error('Failed to fetch products', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<ProductDto> {
    const { data } = await firstValueFrom(
      this.httpService.get<ExternalProduct>(`${this.EXTERNAL_API}/${id}`),
    );

    const stockRecord = await this.prisma.productStock.findUnique({
      where: { productId: id },
    });

    const stock = stockRecord ? stockRecord.quantity : DEFAULT_STOCK;
    return ProductAdapter.toInternal(data, stock);
  }
}
