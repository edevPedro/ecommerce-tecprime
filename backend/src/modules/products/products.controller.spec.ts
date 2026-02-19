import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ProductsModule } from './products.module';
import { DatabaseModule } from '../../database/database.module';
import { PrismaService } from '../../database/prisma.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let httpService: HttpService;
  let cacheManager: Cache;

  const mockProduct = {
    id: 1,
    title: 'Test Product',
    description: 'Test Description',
    price: 100,
    category: 'Test Category',
    thumbnail: 'test.jpg',
    rating: 4.5,
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  // Mock PrismaService to avoid database connection errors
  const mockPrismaService = {
    productStock: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProductsModule, DatabaseModule],
    })
      .overrideProvider(HttpService)
      .useValue(mockHttpService)
      .overrideProvider(CACHE_MANAGER)
      .useValue(mockCacheManager)
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    httpService = moduleFixture.get<HttpService>(HttpService);
    cacheManager = moduleFixture.get<Cache>(CACHE_MANAGER);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (GET) - Success (Cache Miss)', async () => {
    mockCacheManager.get.mockResolvedValue(null);
    mockHttpService.get.mockReturnValue(
      of({
        data: {
          products: [mockProduct],
        },
      }),
    );

    const response = await request(app.getHttpServer() as unknown)
      .get('/products')
      .expect(200);

    const products = response.body as { nome: string }[];
    expect(products).toHaveLength(1);
    expect(products[0].nome).toEqual(mockProduct.title);
    expect(cacheManager.get).toHaveBeenCalledWith('products');
    expect(cacheManager.set).toHaveBeenCalled();
  });

  it('/products (GET) - Success (Cache Hit)', async () => {
    const cachedProduct = {
      id: 1,
      nome: 'Cached Product',
    };
    mockCacheManager.get.mockResolvedValue([cachedProduct]);

    const response = await request(app.getHttpServer() as unknown)
      .get('/products')
      .expect(200);

    const products = response.body as { nome: string }[];
    expect(products).toEqual([cachedProduct]);
    expect(cacheManager.get).toHaveBeenCalledWith('products');
    // HttpService should NOT be called on cache hit
    const httpServiceGetSpy = jest.spyOn(httpService, 'get');
    expect(httpServiceGetSpy).toHaveBeenCalledTimes(1); // From previous test
  });
});
