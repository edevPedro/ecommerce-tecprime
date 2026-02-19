import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

interface CheckoutForm {
  nome: string;
  email: string;
  endereco: string;
  formaPagamento: string;
}

export const Checkout = () => {
  const { state, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is not logged in, redirect to login page but save the current location to redirect back
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location } });
    }
  }, [user, navigate, location]);

  const [formData, setFormData] = useState<CheckoutForm>(() => {
    const saved = localStorage.getItem('checkout_details');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Basic schema validation
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          typeof parsed.nome === 'string' &&
          typeof parsed.email === 'string' &&
          typeof parsed.endereco === 'string' &&
          typeof parsed.formaPagamento === 'string'
        ) {
          return parsed;
        }
      } catch {
        // Invalid JSON or schema, ignore saved data
        localStorage.removeItem('checkout_details');
      }
    }
    return {
      nome: user?.username || '',
      email: user?.email || '',
      endereco: '',
      formaPagamento: 'cartao',
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update name if user logs in after initial load and no saved name exists
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nome: prev.nome || user.username || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Save checkout details for next time
    localStorage.setItem('checkout_details', JSON.stringify(formData));

    try {
      const payload = {
        ...formData,
        produtos: state.items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await api.post('/orders', payload);
      dispatch({ type: 'CLEAR_CART' });

      // Handle Async Response (Job ID)
      if (response.data.id) {
        navigate(`/orders/${response.data.id}`);
      } else if (response.data.jobId) {
        // Fallback if ID is missing but Job ID is present
        navigate('/order-processing', { state: { jobId: response.data.jobId } });
      } else {
        navigate(`/orders/${response.data.id}`);
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to create order. Please try again.');
      } else {
        setError('Failed to create order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Prevent flash while redirecting

  if (state.items.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <p className="text-xl font-bold uppercase text-black bg-brand-orange p-4 border-2 border-black shadow-neu">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-black mb-8 text-black uppercase text-center drop-shadow-[2px_2px_0px_#fff]">Secure Checkout</h1>

      {error && (
        <div className="bg-red-400 border-2 border-black text-black font-bold px-4 py-3 rounded-lg mb-6 shadow-neu uppercase animate-pulse">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="neu-card space-y-6">
            <h2 className="text-xl font-black text-black uppercase mb-4 pb-2 border-b-2 border-black inline-block bg-brand-white px-2 transform -rotate-1">Shipping Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-black uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="neu-input"
                  placeholder="JOHN DOE"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-black text-black uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="neu-input"
                  placeholder="JOHN@EXAMPLE.COM"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-black text-black uppercase mb-1">Delivery Address</label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  className="neu-input"
                  placeholder="123 MAIN ST, APT 4B"
                  required
                />
              </div>
            </div>

            <h2 className="text-xl font-black text-black uppercase mt-8 mb-4 pb-2 border-b-2 border-black inline-block bg-brand-white px-2 transform rotate-1">Payment</h2>

            <div>
              <label className="block text-sm font-black text-black uppercase mb-1">Method</label>
              <select
                name="formaPagamento"
                value={formData.formaPagamento}
                onChange={handleInputChange}
                className="neu-input appearance-none cursor-pointer uppercase"
              >
                <option value="cartao">Credit Card</option>
                <option value="pix">Pix (Instant)</option>
                <option value="boleto">Boleto Bancário</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`neu-btn w-full mt-6 text-lg ${loading
                ? 'bg-gray-400 cursor-not-allowed opacity-75'
                : 'bg-brand-black text-white hover:bg-brand-orange hover:text-black'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  PROCESSING...
                </span>
              ) : 'CONFIRM ORDER'}
            </button>
          </form>
        </div>

        {/* Sidebar Summary */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl border-2 border-black shadow-neu sticky top-24">
            <h3 className="font-black text-black uppercase mb-4 text-xl border-b-2 border-black pb-2">Order Summary</h3>
            <ul className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {state.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm font-bold border-b border-gray-200 pb-2 border-dashed last:border-0">
                  <span className="text-gray-600 line-clamp-1 flex-1 pr-2 uppercase">
                    {item.quantity}x {item.nome}
                  </span>
                  <span className="text-black whitespace-nowrap">
                    $ {(item.preco * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t-2 border-black pt-4 space-y-2 bg-brand-gray/30 -mx-6 px-6 pb-4 -mb-6 rounded-b-lg">
              <div className="flex justify-between text-sm font-bold text-gray-600 uppercase">
                <span>Subtotal</span>
                <span>$ {state.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-600 uppercase">
                <span>Shipping</span>
                <span className="text-white bg-brand-blue px-1 border border-black rounded text-xs">FREE</span>
              </div>
              <div className="flex justify-between text-xl font-black text-black pt-2 border-t-2 border-black border-dashed mt-2 uppercase">
                <span>Total</span>
                <span className="bg-brand-white px-2 transform -rotate-2 border border-black shadow-sm">$ {state.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
