import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';

export const OrderProcessing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { jobId } = (location.state as any) || {};

  useEffect(() => {
    if (!jobId) {
      navigate('/');
    }
  }, [jobId, navigate]);

  if (!jobId) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full neu-card bg-white p-8 text-center">
        <div className="w-20 h-20 bg-brand-white rounded-full border-2 border-black flex items-center justify-center mx-auto mb-6 shadow-neu-sm">
          <CheckCircle className="text-black" size={40} strokeWidth={2.5} />
        </div>

        <h1 className="text-3xl font-black text-black mb-2 uppercase">Order Received!</h1>
        <p className="text-gray-600 font-bold mb-8 uppercase text-sm">
          Thank you for your purchase. Your order is currently being processed.
        </p>

        {jobId && (
          <div className="bg-brand-gray/20 rounded-xl p-4 mb-8 border-2 border-black border-dashed">
            <p className="text-xs text-black uppercase tracking-widest font-black mb-1">
              Order Reference
            </p>
            <p className="text-xl font-mono text-black font-black bg-brand-white inline-block px-2 border-2 border-black transform -rotate-1 shadow-sm">
              #{jobId}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <Link
            to="/"
            className="neu-btn w-full justify-center bg-brand-black text-white hover:bg-brand-blue hover:text-black"
          >
            <ShoppingBag size={20} className="mr-2" />
            Continue Shopping
          </Link>

          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 w-full text-gray-500 hover:text-black font-bold uppercase py-2 transition-colors text-xs tracking-wider"
          >
            Go to Home
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
