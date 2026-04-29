import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useOrders } from '../../hooks/useOrders';
import { StatusBadge } from '../shared/StatusBadge';
import type { Order, OrderStatus } from '../../types';
import { Search, X, Check, XCircle, Truck } from 'lucide-react';
import { haptic, tg } from '../../lib/telegram';

export const OrderList: React.FC = () => {
  const { user } = useAuthStore();
  const { orders, updateStatus } = useOrders('manufacturer', user?.id);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || 
                          o.agent?.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      haptic.impact('medium');
      if (status === 'rejected') {
        tg.showConfirm('Are you sure you want to reject this order?', async (ok) => {
          if (ok) {
            await updateStatus({ orderId, status });
            setSelectedOrder(null);
          }
        });
      } else {
        await updateStatus({ orderId, status });
        // Update local state if needed, but the hook should handle it via query invalidation
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      }
    } catch (error: any) {
      tg.showAlert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 space-y-4">
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
            onClick={() => setSelectedOrder(order)}
            className="bg-tg-secondary-bg p-3 rounded-xl border border-tg-hint/5 active:bg-tg-bg transition-colors"
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

      {/* Order Detail Modal (Bottom Sheet style) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedOrder(null)}></div>
          <div className="relative bg-tg-bg rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
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

            <div className="space-y-6">
              <section className="bg-tg-secondary-bg p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-tg-bg rounded-full flex items-center justify-center text-lg">👤</div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-tg-hint tracking-wider">Agent</p>
                    <p className="font-bold text-sm">{selectedOrder.agent?.full_name}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-tg-hint/10">
                  <p className="text-[10px] uppercase font-bold text-tg-hint tracking-wider mb-1">Delivery Address</p>
                  <p className="text-sm font-medium">📍 {selectedOrder.delivery_address}</p>
                </div>
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

              {selectedOrder.status === 'pending' && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'rejected')}
                    className="flex-1 bg-red-500/10 text-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-red-500/20"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                  >
                    <Check size={18} />
                    Confirm
                  </button>
                </div>
              )}

              {selectedOrder.status === 'confirmed' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                  className="w-full bg-tg-button text-tg-button-text py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Truck size={20} />
                  Mark as Shipped
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
