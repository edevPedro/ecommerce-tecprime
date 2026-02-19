import {
  IsEmail,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  Min,
  IsInt,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 1, description: 'The ID of the product' })
  @IsInt()
  @Min(1)
  productId!: number;

  @ApiProperty({ example: 2, description: 'Quantity of the product' })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the recipient' })
  @IsNotEmpty()
  @IsString()
  nome!: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address of the recipient',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123 Main St', description: 'Delivery address' })
  @IsNotEmpty()
  @IsString()
  endereco!: string;

  @ApiProperty({
    example: 'cartao',
    description: 'Payment method (cartao, pix, boleto)',
  })
  @IsNotEmpty()
  @IsString()
  formaPagamento!: string;

  @ApiProperty({
    type: [OrderItemDto],
    description: 'List of products to order',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  produtos!: OrderItemDto[];
}
