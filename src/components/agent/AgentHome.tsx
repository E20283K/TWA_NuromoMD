import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useOrders } from '../../hooks/useOrders';
import { StatusBadge } from '../shared/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { ShoppingPlus, ChevronRight } from 'lucide-react';

export const AgentHome: React.FC = () => {
  const { user } = useAuthStore();
  const { orders } = useOrders('agent', user?.id);
  const navigate = useNavigate();

  const todayOrders = orders.filter(o => {
    const today = new Date().toISOString().split('T')[0];
    return o.created_at.startsWith(today);
  });

  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="p-4 space-y-6">
      <header>
        <p className="text-tg-hint text-sm">Welcome back,</p>
        <h1 className="text-2xl font-bold">{user?.full_name}</h1>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <div className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/10">
          <p className="text-tg-hint text-[10px] uppercase font-bold tracking-wider mb-1">Orders Today</p>
          <p className="text-2xl font-black text-tg-button">{todayOrders.length}</p>
        </div>
        <div className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/10">
          <p className="text-tg-hint text-[10px] uppercase font-bold tracking-wider mb-1">Revenue Today</p>
          <p className="text-2xl font-black text-green-500">${todayRevenue.toFixed(2)}</p>
        </div>
      </section>

      <button 
        onClick={() => navigate('/catalog')}
        className="w-full bg-tg-button text-tg-button-text py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
      >
        <span>New Order</span>
        <span className="text-2xl">➕</span>
      </button>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">Recent Orders</h2>
          <button onClick={() => navigate('/history')} className="text-tg-button text-xs font-medium">View All</button>
        </div>
        
        <div className="space-y-2">
          {orders.slice(0, 5).map((order) => (
            <div 
              key={order.id}
              className="bg-tg-bg border border-tg-hint/10 p-3 rounded-xl flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">#{order.order_number}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-tg-hint text-[10px]">{order.delivery_address || 'No address'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-tg-button">${Number(order.total_amount).toFixed(2)}</p>
                <p className="text-tg-hint text-[10px]">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-8 bg-tg-secondary-bg rounded-xl border border-dashed border-tg-hint/20">
              <p className="text-tg-hint text-sm italic">No orders yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
