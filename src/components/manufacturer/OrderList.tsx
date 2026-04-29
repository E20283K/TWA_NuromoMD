import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOrders } from '../../hooks/useOrders';
import { StatusBadge } from '../shared/StatusBadge';
import type { OrderStatus } from '../../types';
import { Search } from 'lucide-react';

export const OrderList: React.FC = () => {
  const { user } = useAuthStore();
  const { orders } = useOrders('manufacturer', user?.id);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || 
                          o.agent?.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-xl font-bold">Order Management</h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={16} />
          <input
            type="text"
            placeholder="Order # or Agent..."
            className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="bg-tg-secondary-bg border border-tg-hint/10 rounded-xl px-2 text-xs font-bold focus:outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-2">
        {filteredOrders.map((order) => (
          <div 
            key={order.id}
            onClick={() => navigate(`/order/${order.id}`)}
            className="bg-tg-secondary-bg p-3 rounded-xl border border-tg-hint/5 active:scale-[0.98] transition-transform cursor-pointer"
          >
             <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">#{order.order_number}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-tg-hint text-[10px] mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-tg-button">${Number(order.total_amount).toFixed(2)}</p>
                  <p className="text-tg-hint text-[10px] truncate max-w-[100px]">{order.agent?.full_name}</p>
                </div>
             </div>
             <div className="flex items-center gap-1 text-tg-hint text-[10px]">
               <span className="truncate flex-1">📍 {order.delivery_address}</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
