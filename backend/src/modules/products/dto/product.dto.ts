import { ApiProperty } from '@nestjs/swagger';

export class ProductReview {
  @ApiProperty()
  rating!: number;
  @ApiProperty()
  comment!: string;
  @ApiProperty()
  date!: string;
  @ApiProperty()
  reviewerName!: string;
}

export class ProductDto {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  nome!: string;
  @ApiProperty()
  descricao!: string;
  @ApiProperty()
  preco!: number;
  @ApiProperty()
  estoque!: number;
  @ApiProperty()
  imagem!: string;
  @ApiProperty()
  categoria!: string;
  @ApiProperty({ type: [ProductReview] })
  avaliacoes!: ProductReview[];
  @ApiProperty()
  notaMedia!: number;
}

export interface ExternalReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ExternalProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  thumbnail: string;
  reviews: ExternalReview[];
  rating: number;
}

export interface DummyJsonResponse {
  products: ExternalProduct[];
  total: number;
  skip: number;
  limit: number;
}
