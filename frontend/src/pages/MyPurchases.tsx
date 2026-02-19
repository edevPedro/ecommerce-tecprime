import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, Clock, AlertTriangle } from 'lucide-react';
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
  createdAt: string;
  items: OrderItem[];
  status: string; // "Crafting Product"
  deliveryDate: string; // "12/10/2190"
}

interface BackendOrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface BackendOrder {
  id: number;
  totalAmount: number;
  createdAt: string;
  items: BackendOrderItem[];
}

export const MyPurchases = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      // Use the new secure endpoint that relies on the auth token
      try {
        const response = await api.get('/orders/mine');
        // Map backend orders to include the required fake status
        const mappedOrders = response.data.map((order: BackendOrder) => ({
          ...order,
          totalAmount: order.totalAmount.toString(), // Convert number to string to match Order interface
          items: order.items.map(item => ({ ...item, price: item.price.toString() })),
          status: 'Crafting Product',
          deliveryDate: '12/10/2190',
        }));
        setOrders(mappedOrders);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-b-brand-orange"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-black text-black mb-8 flex items-center gap-3 uppercase">
          <Package className="text-brand-orange" size={40} strokeWidth={2.5} />
          My Purchases
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-black p-12 text-center shadow-neu">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-black mb-2 uppercase">No orders yet</h3>
            <p className="text-gray-600 font-bold uppercase text-sm">Start shopping to see your purchases here.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-neu border-2 border-black overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-brand-orange border-b-2 border-black"></div>
                <div className="p-6 border-b-2 border-black bg-brand-gray/10 flex flex-wrap gap-4 justify-between items-center mt-2">
                  <div>
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest block">Order Placed</span>
                    <span className="text-black font-black uppercase">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest block">Total</span>
                    <span className="text-black font-black bg-brand-white px-2 border-2 border-black shadow-sm transform -rotate-1 inline-block">$ {Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest block">Order #</span>
                    <span className="text-black font-mono font-black">{order.id}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-1">
                      <h3 className="font-black text-xl text-black mb-2 uppercase">Estimated Delivery: <span className="underline decoration-wavy decoration-brand-orange">{order.deliveryDate}</span></h3>
                      <div className="flex items-center gap-2 text-black bg-brand-white px-3 py-1 rounded-full w-fit text-sm font-black border-2 border-black shadow-sm">
                        <Clock size={16} />
                        STATUS: {order.status.toUpperCase()}
                      </div>
                      <div className="w-full bg-brand-gray/30 rounded-full h-4 mt-4 overflow-hidden border-2 border-black">
                        <div className="bg-brand-orange h-full w-[15%] animate-pulse border-r-2 border-black"></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wide">Your item is being carefully crafted by our artisans.</p>
                    </div>
                  </div>

                  <div className="space-y-4 border-t-2 border-black border-dashed pt-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-black border-2 border-black shadow-sm">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-black text-black uppercase">{item.productName}</p>
                            <p className="text-xs font-bold text-gray-500 uppercase">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-black text-black">$ {Number(item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => setShowSupport(true)}
                      className="neu-btn bg-brand-blue text-xs"
                    >
                      <AlertTriangle size={16} strokeWidth={2.5} />
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="neu-card bg-white max-w-md w-full animate-in fade-in zoom-in duration-300">
            <div className="p-6 text-center">
              <h3 className="text-2xl font-black text-black mb-4 uppercase">Support Ticket Created?</h3>
              <div className="aspect-video w-full bg-brand-gray/20 rounded-xl overflow-hidden mb-6 relative border-2 border-black shadow-neu-sm">
                <img
                  src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHA3MmZyY3Fib2ZpczJ4anEzaGhiN2o0d2d2azZoaDZrdGl2cmdwcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26tk0aLx4Aj4lxx3W/giphy.gif"
                  alt="Fishing Rod"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent p-4">
                  <p className="text-white font-black text-lg drop-shadow-[2px_2px_0px_#000] uppercase">You've been fished! 🎣</p>
                </div>
              </div>
              <p className="text-black font-bold mb-6 uppercase text-sm">
                It seems you fell for the bait! Don't worry, your order (might) arrive by 2190. Patience is a virtue!
              </p>
              <button
                onClick={() => setShowSupport(false)}
                className="neu-btn w-full bg-brand-black text-white hover:bg-brand-orange hover:text-black"
              >
                Close (and keep waiting)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
