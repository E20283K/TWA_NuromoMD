import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOrders } from '../../hooks/useOrders';
import { StatusBadge } from '../shared/StatusBadge';
import { ArrowLeft, X } from 'lucide-react';
import type { Order } from '../../types';

export const OrderHistory: React.FC = () => {
  const { user } = useAuthStore();
  const { orders, isLoading } = useOrders('agent', user?.id);
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  if (isLoading) {
    return <div className="p-4 animate-pulse space-y-3">
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-tg-secondary-bg rounded-xl"></div>)}
    </div>;
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/')}
          className="p-2 bg-tg-secondary-bg rounded-full text-tg-hint active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">My Orders</h1>
      </header>
      
      <div className="space-y-3">
        {orders.map((order) => (
          <div 
            key={order.id}
            onClick={() => setSelectedOrder(order)}
            className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/5 flex flex-col gap-2 active:scale-[0.98] transition-transform"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-lg">#{order.order_number}</span>
                <p className="text-tg-hint text-[10px]">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            
            <div className="flex justify-between items-end mt-1 pt-2 border-t border-tg-hint/10">
              <div>
                <p className="text-[10px] uppercase font-bold text-tg-hint tracking-wider">Delivery to</p>
                <p className="text-xs font-medium truncate max-w-[200px]">{order.delivery_address}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-tg-button">${Number(order.total_amount).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 opacity-20">📋</div>
            <p className="text-tg-hint italic">You haven't placed any orders yet</p>
          </div>
        )}
      </div>

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedOrder(null)}></div>
          <div className="relative bg-tg-bg rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-tg-hint/20 rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black">Order #{selectedOrder.order_number}</h2>
                <div className="mt-1"><StatusBadge status={selectedOrder.status} /></div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 bg-tg-secondary-bg rounded-full text-tg-hint">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 pb-10">
              <section className="bg-tg-secondary-bg p-4 rounded-2xl space-y-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-tg-hint tracking-wider mb-1">Delivery Address</p>
                  <p className="text-sm font-medium">📍 {selectedOrder.delivery_address}</p>
                </div>
                {selectedOrder.customer_name && (
                   <div className="pt-2 border-t border-tg-hint/10">
                    <p className="text-[10px] uppercase font-bold text-tg-hint tracking-wider mb-1">Customer</p>
                    <p className="text-sm font-medium">{selectedOrder.customer_name}</p>
                  </div>
                )}
              </section>

              <section>
                <h3 className="font-bold text-sm uppercase tracking-wider text-tg-hint mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-tg-hint/5">
                      <div>
                        <p className="font-bold text-sm">{item.product_name}</p>
                        <p className="text-[10px] text-tg-hint">Qty: {item.quantity} × ${item.unit_price}</p>
                      </div>
                      <p className="font-bold text-sm">${item.subtotal}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3">
                    <span className="font-black text-lg">Total</span>
                    <span className="font-black text-2xl text-tg-button">${Number(selectedOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </section>

              {selectedOrder.status === 'rejected' && selectedOrder.rejected_reason && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-[10px] uppercase font-bold text-red-500 mb-1">Reason for Rejection</p>
                  <p className="text-sm text-red-600 font-medium">{selectedOrder.rejected_reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
