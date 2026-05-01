import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { StatusBadge } from '../shared/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../lib/i18n';
import { TrendingUp, Users, Package, Clock, ChevronRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { orders } = useOrders('manufacturer', user?.id);
  const { products } = useProducts(user?.id);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Removed unused today variable
  // const todayOrders = orders.filter(o => o.created_at.startsWith(today));
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  
  // Unique agents count from orders
  const activeAgentsCount = new Set(orders.map(o => o.agent_id)).size;

  return (
    <div className="p-4 space-y-6">
      <header>
        <p className="text-tg-hint text-sm">{t('manufacturer')} {t('dashboard').toLowerCase()}</p>
        <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <div className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-amber-500" />
            <p className="text-tg-hint text-[10px] uppercase font-bold tracking-wider">{t('newOrder')}</p>
          </div>
          <p className="text-2xl font-black text-amber-500">{pendingOrders.length}</p>
        </div>
        
        <div className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-green-500" />
            <p className="text-tg-hint text-[10px] uppercase font-bold tracking-wider">{t('totalSales')}</p>
          </div>
          <p className="text-2xl font-black text-green-500">${totalRevenue > 1000 ? (totalRevenue/1000).toFixed(1) + 'K' : totalRevenue.toFixed(0)}</p>
        </div>

        <div className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/10">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-tg-button" />
            <p className="text-tg-hint text-[10px] uppercase font-bold tracking-wider">{t('agents')}</p>
          </div>
          <p className="text-2xl font-black text-tg-button">{activeAgentsCount}</p>
        </div>

        <div className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/10">
          <div className="flex items-center gap-2 mb-2">
            <Package size={14} className="text-indigo-500" />
            <p className="text-tg-hint text-[10px] uppercase font-bold tracking-wider">{t('products')}</p>
          </div>
          <p className="text-2xl font-black text-indigo-500">{products.length}</p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">{t('recentActivity')}</h2>
          <button onClick={() => navigate('/orders')} className="text-tg-button text-xs font-medium">{t('manageOrders')}</button>
        </div>
        
        <div className="space-y-2">
          {orders.slice(0, 8).map((order) => (
            <div 
              key={order.id}
              onClick={() => navigate(`/order/${order.id}`)}
              className="bg-tg-bg border border-tg-hint/10 p-3 rounded-xl flex items-center justify-between active:bg-tg-secondary-bg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tg-secondary-bg rounded-full flex items-center justify-center text-lg">
                  👤
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sm">#{order.order_number}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-tg-hint text-[10px]">{order.agent?.full_name || t('agent')} • {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-tg-button">${Number(order.total_amount).toFixed(2)}</p>
                <ChevronRight size={14} className="ml-auto text-tg-hint" />
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-12 bg-tg-secondary-bg rounded-2xl border border-dashed border-tg-hint/20">
              <p className="text-tg-hint text-sm">{t('noOrdersYet')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
