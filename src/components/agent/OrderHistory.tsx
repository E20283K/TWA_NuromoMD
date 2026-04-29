import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOrders } from '../../hooks/useOrders';
import { StatusBadge } from '../shared/StatusBadge';
import { ArrowLeft } from 'lucide-react';

export const OrderHistory: React.FC = () => {
  const { user } = useAuthStore();
  const { orders, isLoading } = useOrders('agent', user?.id);
  const navigate = useNavigate();

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
            onClick={() => navigate(`/order/${order.id}`)}
            className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/5 flex flex-col gap-2 active:scale-[0.98] transition-transform cursor-pointer"
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
    </div>
  );
};
