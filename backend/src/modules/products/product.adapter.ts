import { ExternalProduct, ProductDto } from './dto/product.dto';

export class ProductAdapter {
  static toInternal(external: ExternalProduct, stock: number): ProductDto {
    const uniqueReviews = external.reviews
      ? Array.from(
          new Map(external.reviews.map((r) => [r.reviewerEmail, r])).values(),
        )
      : [];

    const averageRating =
      uniqueReviews.length > 0
        ? uniqueReviews.reduce((acc, r) => acc + r.rating, 0) /
          uniqueReviews.length
        : external.rating;

    return {
      id: external.id,
      nome: external.title,
      descricao: external.description,
      preco: external.price,
      estoque: stock,
      imagem: external.thumbnail, // Changed from image to thumbnail
      categoria: external.category,
      notaMedia: parseFloat(averageRating.toFixed(1)),
      avaliacoes: uniqueReviews.map((r) => ({
        rating: r.rating,
        comment: r.comment,
        date: r.date,
        reviewerName: r.reviewerName,
      })),
    };
  }
}
