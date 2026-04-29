import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOrderById, useOrders } from '../../hooks/useOrders';
import { StatusBadge } from '../shared/StatusBadge';
import { PageHeader } from './PageHeader';
import { MapPin, User, Phone, FileText, Check, XCircle, Truck, Package } from 'lucide-react';
import { haptic, tg } from '../../lib/telegram';

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Fetch single order with all items directly — this is the fix
  const { data: order, isLoading, error } = useOrderById(id);

  // We still need updateStatus from useOrders
  const { updateStatus } = useOrders(user?.role as 'agent' | 'manufacturer', user?.id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tg-bg">
        <div className="sticky top-0 z-30 h-14 bg-tg-secondary-bg animate-pulse" />
        <div className="p-4 space-y-4 animate-pulse">
          <div className="h-16 bg-tg-secondary-bg rounded-2xl" />
          <div className="h-32 bg-tg-secondary-bg rounded-2xl" />
          <div className="h-48 bg-tg-secondary-bg rounded-2xl" />
          <div className="h-64 bg-tg-secondary-bg rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-tg-bg">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-bold mb-2">Order not found</h2>
        <p className="text-tg-hint mb-6 text-sm">
          {(error as any)?.message || "This order may have been removed or you don't have access."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-tg-button text-tg-button-text px-6 py-3 rounded-xl font-bold shadow-lg shadow-tg-button/20"
        >
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
            haptic.notification('success');
            navigate(-1);
          }
        });
      } else {
        await updateStatus({ orderId: order.id, status });
        haptic.notification('success');
      }
    } catch (e: any) {
      tg.showAlert(`Error: ${e.message}`);
    }
  };

  const items = order.items || [];

  return (
    <div className="pb-32 bg-tg-bg min-h-screen">
      <PageHeader
        title={`Order #${order.order_number}`}
        subtitle={new Date(order.created_at).toLocaleString()}
      />

      <div className="p-4 space-y-4">

        {/* Status */}
        <div className="flex items-center justify-between bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/5">
          <span className="font-bold text-tg-hint uppercase tracking-wider text-[11px]">Status</span>
          <StatusBadge status={order.status} />
        </div>

        {/* Rejection reason */}
        {order.status === 'rejected' && order.rejected_reason && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-[10px] uppercase font-bold text-red-500 mb-1">Reason for Rejection</p>
            <p className="text-sm text-red-600 font-medium">{order.rejected_reason}</p>
          </div>
        )}

        {/* Customer & Agent details */}
        <section className="bg-tg-secondary-bg rounded-2xl border border-tg-hint/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-tg-hint/10 flex items-center gap-2">
            <User size={15} className="text-tg-hint" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-tg-hint">Customer Details</h2>
          </div>
          <div className="p-4 space-y-3">
            {user?.role === 'manufacturer' && order.agent && (
              <div className="flex justify-between items-start">
                <p className="text-[10px] uppercase font-bold text-tg-hint">Agent</p>
                <p className="font-semibold text-sm text-right">{(order.agent as any).full_name}</p>
              </div>
            )}
            <div className="flex justify-between items-start">
              <p className="text-[10px] uppercase font-bold text-tg-hint">Customer</p>
              <p className="font-semibold text-sm text-right">{order.customer_name || '—'}</p>
            </div>
            <div className="flex justify-between items-start">
              <p className="text-[10px] uppercase font-bold text-tg-hint flex items-center gap-1">
                <Phone size={10} /> Phone
              </p>
              <p className="font-semibold text-sm text-right">{order.customer_phone || '—'}</p>
            </div>
          </div>
        </section>

        {/* Delivery */}
        <section className="bg-tg-secondary-bg rounded-2xl border border-tg-hint/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-tg-hint/10 flex items-center gap-2">
            <MapPin size={15} className="text-tg-hint" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-tg-hint">Delivery</h2>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm font-medium leading-relaxed">{order.delivery_address}</p>
            {order.notes && (
              <div className="pt-3 border-t border-tg-hint/10">
                <p className="text-[10px] uppercase font-bold text-tg-hint mb-1 flex items-center gap-1">
                  <FileText size={10} /> Notes
                </p>
                <p className="text-sm italic text-tg-hint">{order.notes}</p>
              </div>
            )}
          </div>
        </section>

        {/* Order Items */}
        <section className="bg-tg-secondary-bg rounded-2xl border border-tg-hint/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-tg-hint/10 flex items-center gap-2">
            <Package size={15} className="text-tg-hint" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-tg-hint">
              Items ({items.length})
            </h2>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center text-tg-hint text-sm">
              <Package size={28} className="mx-auto mb-2 opacity-20" />
              <p>No items found for this order.</p>
            </div>
          ) : (
            <div className="divide-y divide-tg-hint/10">
              {items.map((item: any) => (
                <div key={item.id} className="px-4 py-3 flex justify-between items-center">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold text-sm truncate">{item.product_name}</p>
                    <p className="text-[11px] text-tg-hint mt-0.5">
                      {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-black text-sm text-tg-button shrink-0">
                    ${Number(item.subtotal).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="px-4 py-4 flex justify-between items-center bg-tg-button/5">
                <span className="font-black text-base">Total</span>
                <span className="font-black text-2xl text-tg-button">
                  ${Number(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Manufacturer Actions */}
        {user?.role === 'manufacturer' && order.status === 'pending' && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleUpdateStatus('rejected')}
              className="flex-1 bg-red-500/10 text-red-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform border border-red-500/20"
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
          <button
            onClick={() => handleUpdateStatus('shipped')}
            className="w-full bg-tg-button text-tg-button-text py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-tg-button/20"
          >
            <Truck size={20} />
            Mark as Shipped
          </button>
        )}
      </div>
    </div>
  );
};
