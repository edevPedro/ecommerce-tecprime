import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Calendar, Home } from 'lucide-react';
import api from '../services/api';

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        const orderData = response.data;
        setOrder(orderData);

        // If order is still pending, poll again in 2 seconds
        if (orderData.status === 'PENDING') {
          intervalId = setTimeout(fetchOrder, 2000);
        }
      } catch (err: unknown) {
        console.error('Failed to fetch order', err);
        let errorMessage = 'Failed to load order details';
        if (typeof err === 'object' && err !== null && 'response' in err) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const axiosError = err as { response: { data: { message: string } } };
          if (axiosError.response?.data?.message) {
            errorMessage = axiosError.response.data.message;
          }
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      if (intervalId) clearTimeout(intervalId);
    };
  }, [id]);

  if (loading || (order && order.status === 'PENDING')) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-b-brand-orange mb-4"></div>
        <h2 className="text-2xl font-black text-black uppercase">Processing Order...</h2>
        <p className="text-black font-bold">Please wait while we confirm your payment and stock.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-background">
        <div className="neu-card bg-red-100 max-w-md w-full text-center">
          <h2 className="text-2xl font-black text-black mb-4 uppercase">Error</h2>
          <p className="text-black font-bold mb-6">{error}</p>
          <Link to="/" className="neu-btn bg-brand-white">Return to Home</Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-background">
        <div className="neu-card bg-brand-gray/20 max-w-md w-full text-center">
          <h2 className="text-2xl font-black text-black mb-4 uppercase">Order not found</h2>
          <Link to="/" className="neu-btn bg-brand-orange">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl bg-background min-h-screen">
      <div className="bg-white rounded-xl shadow-neu border-2 border-black overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-3 bg-brand-orange border-b-2 border-black"></div>

        <div className="p-8 sm:p-12 text-center border-b-2 border-black bg-brand-gray/10">
          <div className="mx-auto w-20 h-20 bg-brand-white border-2 border-black rounded-full flex items-center justify-center mb-6 shadow-neu-sm">
            <CheckCircle size={40} className="text-brand-orange" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-black mb-2 uppercase">Order Confirmed!</h1>
          <p className="text-black font-bold mb-6 uppercase">
            Thank you for your purchase. Your order <span className="bg-brand-orange px-1 border-2 border-black text-white rounded">#{order.id}</span> has been received.
          </p>
          <div className="inline-flex gap-2 px-4 py-2 bg-white rounded-lg border-2 border-black shadow-neu-sm text-sm font-black uppercase tracking-wide">
            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}</span>
            <span className="w-0.5 h-4 bg-black"></span>
            <span className="flex items-center gap-1"><Package size={14} /> {order.items.length} Items</span>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <h3 className="text-xl font-black text-black mb-6 flex items-center gap-2 uppercase">
            <Truck className="text-black" size={24} strokeWidth={2.5} /> Order Summary
          </h3>

          <div className="bg-white rounded-xl border-2 border-black overflow-hidden mb-8 shadow-neu-sm">
            <ul className="divide-y-2 divide-black divide-dashed">
              {order.items.map((item: OrderItem) => (
                <li key={item.id} className="flex justify-between items-center p-4 hover:bg-brand-gray/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-white rounded flex items-center justify-center text-xs font-black text-black border-2 border-black shadow-[1px_1px_0px_0px_#000]">
                      {item.quantity}x
                    </div>
                    <div>
                      <span className="font-bold text-black block uppercase">{item.productName}</span>
                      <span className="text-xs font-bold text-gray-500 uppercase">Unit: $ {Number(item.price).toFixed(2)}</span>
                    </div>
                  </div>
                  <span className="font-black text-black">$ {(Number(item.price) * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="bg-brand-gray/30 p-4 flex justify-between items-center border-t-2 border-black">
              <span className="font-black text-black uppercase">Total Amount</span>
              <span className="text-2xl font-black text-black bg-brand-white px-2 transform -rotate-1 border-2 border-black shadow-sm">$ {Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>


          <div className="text-center">
            <Link
              to="/"
              className="neu-btn text-lg bg-brand-blue text-white hover:bg-brand-blue hover:text-white w-full sm:w-auto"
            >
              <Home size={20} className="mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
