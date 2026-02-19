import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../contexts/CartContext';
import api from '../services/api';

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Failed to fetch product details', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      dispatch({ type: 'ADD_ITEM', payload: product });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-b-brand-orange"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h2 className="text-3xl font-black text-black uppercase mb-4">Product not found</h2>
        <button
          onClick={() => navigate('/')}
          className="neu-btn bg-brand-orange"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen px-4 py-8">
      <div className="container mx-auto max-w-6xl">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 text-black font-black uppercase hover:underline decoration-2 decoration-brand-orange underline-offset-4"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          Back to Catalog
        </button>

        <div className="bg-white rounded-xl shadow-neu border-2 border-black overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0 relative">
          <div className="absolute top-4 right-4 z-10 md:hidden">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs text-white bg-brand-blue border-2 border-black shadow-neu-sm uppercase tracking-wider transform rotate-2">
              In Stock
            </span>
          </div>

          {/* Product Image Section */}
          <div className="p-8 md:p-12 flex items-center justify-center bg-brand-gray/10 border-b-2 md:border-b-0 md:border-r-2 border-black relative group">
            <div className="absolute top-4 left-4 z-10 hidden md:block">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs text-white bg-brand-blue border-2 border-black shadow-neu-sm uppercase tracking-wider transform rotate-2">
                In Stock
              </span>
            </div>
            <img
              src={product.imagem}
              alt={product.nome}
              className="max-h-[500px] w-full object-contain transition-transform duration-500 group-hover:scale-105 z-10 filter drop-shadow-md"
            />
          </div>

          {/* Product Info Section */}
          <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 text-xs font-black tracking-wider text-black uppercase bg-brand-white border-2 border-black shadow-[2px_2px_0px_0px_#000] rounded-lg mb-4 transform -rotate-1">
                {product.categoria || 'Tech'}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-black mb-4 leading-tight uppercase">
                {product.nome}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 bg-brand-white px-2 py-1 rounded border-2 border-black shadow-neu-sm">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill="orange"
                      className={i < Math.round(product.notaMedia || 0) ? "text-black" : "text-gray-300"}
                      strokeWidth={2}
                    />
                  ))}
                  <span className="ml-2 text-xs font-black border-l-2 border-black pl-2">
                    {product.notaMedia?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                  ({product.avaliacoes?.length || 0} reviews)
                </span>
              </div>

              <p className="text-gray-800 text-lg leading-relaxed mb-8 font-medium border-l-4 border-brand-orange pl-4">
                {product.descricao}
              </p>
            </div>

            <div className="mt-auto pt-8 border-t-2 border-black border-dashed">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="text-xs text-gray-500 font-black uppercase tracking-widest block mb-1">Price</span>
                  <span className="text-4xl font-black text-black bg-brand-white px-2 transform -rotate-1 inline-block border-2 border-black shadow-neu-sm">
                    $ {Number(product.preco).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="neu-btn text-lg w-full sm:w-auto bg-brand-black text-white hover:bg-brand-orange hover:text-black"
                >
                  <ShoppingCart size={20} strokeWidth={2.5} />
                  Add to Cart
                </button>
              </div>

              <div className="mt-6 flex items-center gap-4 text-xs font-bold uppercase text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-black"></div>
                  In Stock
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-orange border-2 border-black"></div>
                  Fast Delivery
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16 bg-white rounded-xl border-2 border-black shadow-neu overflow-hidden p-8 md:p-12 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-orange border-b-2 border-black"></div>
          <h2 className="text-3xl font-black text-black mb-8 border-b-2 border-black pb-4 uppercase inline-block">
            Customer Reviews
          </h2>

          {product.avaliacoes && product.avaliacoes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {product.avaliacoes.map((review, index) => (
                <div key={index} className="bg-brand-gray/10 p-6 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-brand-white border-2 border-black flex items-center justify-center text-black font-black text-sm uppercase shadow-sm">
                        {review.reviewerName?.charAt(0) || 'A'}
                      </div>
                      <span className="font-bold text-black uppercase text-sm">
                        {review.reviewerName || 'Anonymous'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-500 border border-black px-2 py-0.5 rounded bg-white">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < review.rating ? "black" : "none"}
                        className={i < review.rating ? "text-black" : "text-gray-300"}
                        strokeWidth={2}
                      />
                    ))}
                  </div>

                  <p className="text-gray-700 text-sm font-medium border-l-2 border-black pl-2 italic">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-brand-gray/10 rounded-xl border-2 border-dashed border-black">
              <p className="text-gray-500 font-bold uppercase">No reviews yet for this product.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
