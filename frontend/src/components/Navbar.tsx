import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, Code, User, Menu } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export const Navbar = () => {
  const { state } = useCart();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cartItemCount = state.items.reduce((acc, item) => acc + item.quantity, 0);

  const handleScrollToCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToCatalog: true } });
    } else {
      const element = document.getElementById('catalog');
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 bg-[#f8f9fa] border-b-2 border-black transition-all duration-300">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-orange rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] group-hover:-translate-y-[2px] group-hover:shadow-[4px_4px_0px_0px_#000] transition-all">
              <Code className="text-black" size={24} strokeWidth={3} />
            </div>
            <span className="text-2xl font-black uppercase tracking-tight text-black">
              TecPrime
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#catalog" onClick={handleScrollToCatalog} className="font-bold uppercase tracking-wide text-black hover:text-brand-orange hover:underline decoration-2 underline-offset-4 decoration-wavy transition-colors cursor-pointer">
              Products
            </a>
            
            <div className="flex items-center gap-4 border-l-2 border-black pl-8">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <User size={16} className="text-black" strokeWidth={2.5} />
                    <span className="text-sm font-bold uppercase">{user.username}</span>
                  </div>
                  <Link
                    to="/my-purchases"
                    className="text-sm font-bold uppercase hover:bg-brand-gray px-3 py-1 rounded-md border-2 border-transparent hover:border-black transition-all"
                  >
                    Purchases
                  </Link>
                  <button 
                    onClick={logout} 
                    className="p-2 text-black hover:bg-brand-orange rounded-lg border-2 border-transparent hover:border-black transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut size={20} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-sm font-bold uppercase bg-white border-2 border-black px-4 py-2 rounded-lg shadow-[2px_2px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                  Sign In
                </Link>
              )}

              <Link 
                to="/cart" 
                className="relative p-2.5 bg-brand-white rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#000] transition-all duration-200 group"
              >
                <ShoppingCart size={22} className="text-black" strokeWidth={2.5} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-orange text-black text-xs font-black border-2 border-black rounded-full h-6 w-6 flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 border-t-2 border-black animate-in slide-in-from-top-2 bg-white rounded-xl border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex flex-col gap-4">
              <a href="#catalog" onClick={handleScrollToCatalog} className="font-bold uppercase py-2 hover:bg-brand-gray px-2 rounded border-2 border-transparent hover:border-black transition-all">Products</a>
              <div className="h-0.5 bg-black my-1"></div>
              {user ? (
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold">HI, {user.username.toUpperCase()}</span>
                  <button onClick={logout} className="bg-brand-orange px-3 py-1 rounded border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-y-[2px] transition-all">LOGOUT</button>
                </div>
              ) : (
                <Link to="/login" className="bg-brand-white text-center font-bold uppercase py-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-y-[2px] transition-all">Sign In</Link>
              )}
              <Link to="/cart" className="flex items-center justify-between bg-brand-black text-white p-3 rounded border-2 border-black font-bold uppercase shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-y-[2px] transition-all">
                <span>View Cart</span>
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} strokeWidth={2.5} />
                  {cartItemCount > 0 && <span className="font-black">({cartItemCount})</span>}
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
