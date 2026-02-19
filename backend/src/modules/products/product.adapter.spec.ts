import { ProductAdapter } from './product.adapter';
import { ExternalProduct } from './dto/product.dto';

describe('ProductAdapter', () => {
  it('should transform external product to internal DTO', () => {
    const externalProduct: ExternalProduct = {
      id: 1,
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
      thumbnail: 'test.jpg',
      category: 'Test Category',
      rating: 4.5,
      reviews: [],
    };
    const stock = 50;

    const result = ProductAdapter.toInternal(externalProduct, stock);

    expect(result).toEqual({
      id: 1,
      nome: 'Test Product',
      descricao: 'Test Description',
      preco: 100,
      estoque: 50,
      imagem: 'test.jpg',
      categoria: 'Test Category',
      notaMedia: 4.5,
      avaliacoes: [],
    });
  });

  it('should deduplicate reviews by email', () => {
    const externalProduct: ExternalProduct = {
      id: 1,
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
      thumbnail: 'test.jpg',
      category: 'Test Category',
      rating: 0,
      reviews: [
        {
          rating: 5,
          comment: 'Great',
          date: '2023-01-01',
          reviewerName: 'John',
          reviewerEmail: 'john@example.com',
        },
        {
          rating: 1,
          comment: 'Bad',
          date: '2023-01-02',
          reviewerName: 'John',
          reviewerEmail: 'john@example.com', // Duplicate email
        },
      ],
    };
    const stock = 50;

    const result = ProductAdapter.toInternal(externalProduct, stock);

    expect(result.avaliacoes).toHaveLength(1);
    expect(result.avaliacoes[0].reviewerName).toBe('John');
  });

  it('should calculate average rating from unique reviews', () => {
    const externalProduct: ExternalProduct = {
      id: 1,
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
      thumbnail: 'test.jpg',
      category: 'Test Category',
      rating: 0,
      reviews: [
        {
          rating: 5,
          comment: 'Great',
          date: '2023-01-01',
          reviewerName: 'John',
          reviewerEmail: 'john@example.com',
        },
        {
          rating: 3,
          comment: 'Okay',
          date: '2023-01-02',
          reviewerName: 'Jane',
          reviewerEmail: 'jane@example.com',
        },
      ],
    };
    const stock = 50;

    const result = ProductAdapter.toInternal(externalProduct, stock);

    expect(result.notaMedia).toBe(4.0); // (5 + 3) / 2
  });
});
