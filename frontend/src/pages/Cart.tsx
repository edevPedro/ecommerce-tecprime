import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export const Cart = () => {
  const { state, dispatch } = useCart();

  if (state.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-background">
        <div className="p-6 bg-brand-white border-2 border-black rounded-full mb-6 shadow-neu">
          <ShoppingCart size={48} className="text-black" />
        </div>
        <h2 className="text-3xl font-black text-black uppercase mb-2">Your cart is empty</h2>
        <p className="text-gray-600 font-bold mb-8 max-w-sm uppercase text-sm">
          Looks like you haven't added anything to your cart yet. Explore our catalog to find great products.
        </p>
        <Link
          to="/"
          className="neu-btn bg-brand-orange hover:bg-brand-black hover:text-white"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-background min-h-screen">
      <h1 className="text-4xl font-black mb-8 text-black uppercase drop-shadow-[2px_2px_0px_#fff]">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-neu border-2 border-black overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-brand-gray/30 border-b-2 border-black text-sm font-black text-black uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Total</div>
            </div>

            <ul className="divide-y-2 divide-black divide-dashed">
              {state.items.map((item) => (
                <li key={item.id} className="p-4 sm:p-6 hover:bg-brand-gray/10 transition-colors">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Product Info */}
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="h-20 w-20 flex-shrink-0 rounded-lg border-2 border-black bg-white p-2 shadow-neu-sm">
                        <img
                          src={item.imagem}
                          alt={item.nome}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-black uppercase line-clamp-1">{item.nome}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1 font-bold">{item.descricao}</p>
                        <button
                          onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                          className="mt-2 text-sm text-red-600 font-bold hover:text-black flex items-center gap-1 sm:hidden uppercase"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center hidden sm:block">
                      <span className="text-black font-bold">$ {Number(item.preco).toFixed(2)}</span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-span-2 flex justify-center">
                      <div className="flex items-center border-2 border-black rounded-lg bg-white shadow-[2px_2px_0px_0px_#000]">
                        <button
                          onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: Math.max(1, item.quantity - 1) } })}
                          className="p-2 text-black hover:bg-brand-gray rounded-l-md transition-colors border-r-2 border-black"
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                        <button
                          onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: Math.min(item.quantity + 1, item.estoque) } })}
                          className="p-2 text-black hover:bg-brand-gray rounded-r-md transition-colors border-l-2 border-black"
                          disabled={item.quantity >= item.estoque}
                        >
                          <Plus size={14} className={item.quantity >= item.estoque ? 'opacity-50' : ''} strokeWidth={3} />
                        </button>
                      </div>
                    </div>

                    {/* Total & Remove Desktop */}
                    <div className="col-span-2 flex items-center justify-between sm:justify-center gap-4">
                      <span className="font-black text-black bg-brand-white px-2 transform -rotate-2 border-2 border-black shadow-sm text-sm">
                        $ {(item.preco * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                        className="text-black hover:text-red-600 transition-colors hidden sm:block p-2 hover:bg-red-100 rounded border-2 border-transparent hover:border-black"
                        title="Remove item"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-neu border-2 border-black p-6 sticky top-24">
            <h2 className="text-xl font-black text-black uppercase mb-6 border-b-2 border-black pb-4">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 font-bold uppercase">
                <span>Subtotal</span>
                <span>$ {state.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-bold uppercase">
                <span>Shipping</span>
                <span className="text-white bg-brand-blue px-1 border-2 border-black rounded text-xs">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600 font-bold uppercase">
                <span>Tax Estimate</span>
                <span>$ 0.00</span>
              </div>

              <div className="h-0.5 bg-black border-dashed my-4"></div>

              <div className="flex justify-between text-xl font-black text-black uppercase">
                <span>Order Total</span>
                <span>$ {state.total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="neu-btn w-full justify-center text-lg bg-brand-black text-white hover:bg-brand-orange hover:text-black"
            >
              Proceed to Checkout
            </Link>

            <p className="text-center text-xs font-bold text-gray-400 mt-4 uppercase">
              Secure Checkout powered by TecPrime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
