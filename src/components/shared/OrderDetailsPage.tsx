import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOrders } from '../../hooks/useOrders';
import { StatusBadge } from '../shared/StatusBadge';
import { PageHeader } from './PageHeader';
import { MapPin, User, FileText, Check, XCircle, Truck } from 'lucide-react';
import { haptic, tg } from '../../lib/telegram';

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Use the hook depending on the user's role
  const { orders, isLoading, updateStatus } = useOrders(user?.role as 'agent' | 'manufacturer', user?.id);
  const order = orders.find(o => o.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse pt-8">
        <div className="h-10 bg-tg-secondary-bg rounded-lg w-1/2"></div>
        <div className="h-32 bg-tg-secondary-bg rounded-2xl w-full"></div>
        <div className="h-64 bg-tg-secondary-bg rounded-2xl w-full"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-xl font-bold mb-2">Order not found</h2>
        <p className="text-tg-hint mb-6">This order may have been removed or you don't have access.</p>
        <button onClick={() => navigate(-1)} className="bg-tg-button text-tg-button-text px-6 py-2 rounded-lg font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const handleUpdateStatus = async (status: any) => {
    try {
      haptic.impact('medium');
      if (status === 'rejected') {
        tg.showConfirm('Are you sure you want to reject this order?', async (ok) => {
          if (ok) {
            await updateStatus({ orderId: order.id, status });
            navigate(-1);
          }
        });
      } else {
        await updateStatus({ orderId: order.id, status });
        if (status === 'shipped' || status === 'delivered') {
          haptic.notification('success');
        }
      }
    } catch (e: any) {
      tg.showAlert(e.message);
    }
  };

  return (
    <div className="pb-32 bg-tg-bg min-h-screen">
      <PageHeader
        title={`Order #${order.order_number}`}
        subtitle={new Date(order.created_at).toLocaleString()}
      />

      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/5">
          <span className="font-bold text-tg-hint uppercase tracking-wider text-xs">Status</span>
          <StatusBadge status={order.status} />
        </div>

        {order.status === 'rejected' && order.rejected_reason && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-[10px] uppercase font-bold text-red-500 mb-1">Reason for Rejection</p>
            <p className="text-sm text-red-600 font-medium">{order.rejected_reason}</p>
          </div>
        )}

        <section className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wider text-tg-hint flex items-center gap-2">
            <User size={16} /> Customer Details
          </h2>
          
          <div className="space-y-3">
            {user?.role === 'manufacturer' && order.agent && (
              <div>
                <p className="text-[10px] uppercase font-bold text-tg-hint mb-0.5">Agent</p>
                <p className="font-medium text-sm">{order.agent.full_name}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase font-bold text-tg-hint mb-0.5">Customer Name</p>
              <p className="font-medium text-sm">{order.customer_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-tg-hint mb-0.5 flex items-center gap-1">Phone</p>
              <p className="font-medium text-sm">{order.customer_phone || 'N/A'}</p>
            </div>
          </div>
        </section>

        <section className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wider text-tg-hint flex items-center gap-2">
            <MapPin size={16} /> Delivery Information
          </h2>
          <div>
            <p className="font-medium text-sm leading-relaxed">{order.delivery_address}</p>
          </div>
          {order.notes && (
            <div className="pt-3 border-t border-tg-hint/10">
              <p className="text-[10px] uppercase font-bold text-tg-hint mb-1 flex items-center gap-1">
                <FileText size={12} /> Notes
              </p>
              <p className="text-sm italic text-tg-hint">{order.notes}</p>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-bold text-sm uppercase tracking-wider text-tg-hint px-1">Order Items</h2>
          <div className="bg-tg-secondary-bg rounded-2xl border border-tg-hint/5 overflow-hidden">
            <div className="divide-y divide-tg-hint/10">
              {order.items?.map((item) => (
                <div key={item.id} className="p-4 flex justify-between items-center bg-tg-secondary-bg">
                  <div>
                    <p className="font-bold text-sm">{item.product_name}</p>
                    <p className="text-[11px] text-tg-hint mt-0.5">Qty: {item.quantity} × ${item.unit_price}</p>
                  </div>
                  <p className="font-black text-sm">${item.subtotal}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-tg-button/5 border-t border-tg-hint/10 flex justify-between items-center">
              <span className="font-black text-lg uppercase tracking-wider text-tg-hint">Total</span>
              <span className="font-black text-2xl text-tg-button">${Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </section>

        {user?.role === 'manufacturer' && order.status === 'pending' && (
          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => handleUpdateStatus('rejected')}
              className="flex-1 bg-red-500/10 text-red-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <XCircle size={18} />
              Reject
            </button>
            <button 
              onClick={() => handleUpdateStatus('confirmed')}
              className="flex-1 bg-green-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
            >
              <Check size={18} />
              Confirm
            </button>
          </div>
        )}

        {user?.role === 'manufacturer' && order.status === 'confirmed' && (
          <div className="pt-4">
            <button 
              onClick={() => handleUpdateStatus('shipped')}
              className="w-full bg-tg-button text-tg-button-text py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Truck size={20} />
              Mark as Shipped
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
