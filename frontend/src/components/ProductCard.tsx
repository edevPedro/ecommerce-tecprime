// Update ProductCard to show star ratings and handle reviews
import { ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../contexts/CartContext';
import { useCart } from '../contexts/CartContext';
import type { FC } from 'react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const { dispatch } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  return (
    <div className="bg-white rounded-xl border-2 border-black p-0 relative overflow-hidden flex flex-col h-full shadow-neu transition-all hover:shadow-neu-lg hover:-translate-y-1 group">
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs text-white bg-brand-blue border-2 border-black shadow-neu-sm uppercase tracking-wider transform rotate-2">
          In Stock
        </span>
      </div>

      <Link to={`/products/${product.id}`} className="h-64 p-6 flex items-center justify-center bg-white border-b-2 border-black group-hover:bg-brand-gray/10 transition-colors block relative overflow-hidden">
        <img
          src={product.imagem}
          alt={product.nome}
          className="max-h-full max-w-full object-contain group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300 ease-out z-10 filter drop-shadow-md"
        />
      </Link>

      <div className="p-5 flex flex-col flex-grow bg-white">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 bg-brand-white px-2 py-1 rounded border-2 border-black shadow-neu-sm transform -rotate-1">
              <Star size={14} fill="black" className="text-black" />
              <span className="text-xs font-black">{product.notaMedia?.toFixed(1) || '0.0'}</span>
            </div>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border-2 border-transparent uppercase tracking-wider">({product.avaliacoes?.length || 0} reviews)</span>
          </div>

          <h3 className="font-black text-xl leading-tight mb-2 line-clamp-2 uppercase tracking-tight">
            <Link to={`/products/${product.id}`} className="hover:bg-brand-orange hover:px-1 hover:-ml-1 transition-all rounded-sm border-2 border-transparent hover:border-black">
              {product.nome}
            </Link>
          </h3>
          <p className="text-gray-700 text-sm line-clamp-2 font-medium border-l-4 border-brand-orange pl-3 my-3">
            {product.descricao}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t-2 border-black border-dashed flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Price</span>
            <span className="text-2xl font-black text-black bg-brand-white px-2 py-0.5 transform -rotate-2 inline-block border-2 border-black shadow-neu-sm rounded-sm">
              $ {Number(product.preco).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="neu-btn !p-3 !rounded-full !w-12 !h-12 flex items-center justify-center bg-brand-black text-white hover:bg-brand-orange hover:text-black"
            aria-label="Add to cart"
          >
            <ShoppingCart size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
