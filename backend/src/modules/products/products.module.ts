import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    HttpModule,
    DatabaseModule,
    CacheModule.register({
      ttl: 60000, // 1 minute cache
      max: 10, // max 10 items in cache
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
