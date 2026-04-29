import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useOrders } from '../../hooks/useOrders';
import { useClients } from '../../hooks/useClients';
import { useNavigate } from 'react-router-dom';
import { Trash2, MapPin, Plus, Minus, User, Phone, FileText, ShoppingCart, ChevronDown } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { showMainButton, hideMainButton, showBackButton, hideBackButton, haptic, tg } from '../../lib/telegram';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { createOrder } = useOrders('agent', user?.id);
  const { clients } = useClients(user?.id);
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);

  const resetForm = () => {
    setAddress('');
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
  };

  useEffect(() => {
    showBackButton(() => navigate(-1));

    if (items.length > 0 && !showSuccess) {
      showMainButton(`Submit Order • $${getTotal().toFixed(2)}`, handleSubmit);
    } else {
      hideMainButton();
    }

    return () => {
      hideBackButton();
      hideMainButton();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, showSuccess]);

  const handleSubmit = async () => {
    if (items.length === 0 || isSubmitting) return;
    if (!address.trim()) {
      tg.showAlert('Please provide a delivery address');
      return;
    }

    try {
      setIsSubmitting(true);
      haptic.impact('medium');

      const orderData = {
        agent_id: user?.id,
        manufacturer_id: user?.manufacturer_id || items[0].manufacturer_id,
        delivery_address: address,
        customer_name: customerName,
        customer_phone: customerPhone,
        notes: notes,
        total_amount: getTotal(),
        status: 'pending' as const,
      };

      const orderItems = items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      await createOrder({ order: orderData, items: orderItems });

      haptic.notification('success');
      // Fully reset everything
      clearCart();
      resetForm();
      setShowSuccess(true);
    } catch (error: any) {
      console.error(error);
      tg.showAlert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetLocation = () => {
    haptic.impact('light');
    tg.LocationManager.init(() => {
      tg.LocationManager.getLocation((data) => {
        if (data && data.latitude && data.longitude) {
          setAddress(`${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`);
        }
      });
    });
  };

  const selectClient = (client: any) => {
    setCustomerName(client.name || '');
    setCustomerPhone(client.phone || '');
    setAddress(client.address || '');
    setShowClientPicker(false);
    haptic.selection();
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in fade-in zoom-in duration-500 bg-tg-bg">
        <div className="w-28 h-28 bg-green-500/10 rounded-full flex items-center justify-center mb-6 text-6xl">
          ✅
        </div>
        <h2 className="text-2xl font-black mb-2">Order Submitted!</h2>
        <p className="text-tg-hint mb-8 max-w-xs leading-relaxed">
          Your order has been sent to the manufacturer for approval.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate('/history')}
            className="w-full bg-tg-button text-tg-button-text py-4 rounded-2xl font-bold shadow-lg shadow-tg-button/20"
          >
            Track Order
          </button>
          <button
            onClick={() => {
              setShowSuccess(false);
              navigate('/catalog');
            }}
            className="w-full bg-tg-secondary-bg text-tg-text py-4 rounded-2xl font-bold"
          >
            New Order
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-tg-bg">
        <div className="w-24 h-24 bg-tg-secondary-bg rounded-full flex items-center justify-center mb-4">
          <ShoppingCart size={40} className="text-tg-hint opacity-30" />
        </div>
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-tg-hint mb-6">Add products from the catalog to start a new order.</p>
        <button
          onClick={() => navigate('/catalog')}
          className="bg-tg-button text-tg-button-text px-8 py-3 rounded-xl font-bold shadow-lg shadow-tg-button/20"
        >
          Go to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tg-bg pb-52">
      <PageHeader title="Your Order" />

      <div className="p-4 space-y-6">
        {/* Items */}
        <section className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-tg-secondary-bg p-3 rounded-xl flex gap-3 border border-tg-hint/5">
              <div className="w-16 h-16 bg-tg-bg rounded-lg flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  item.category === 'medicine' ? '💊' : item.category === 'drink' ? '🥤' : item.category === 'food' ? '🍞' : '📦'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{item.name}</h3>
                <p className="text-tg-button font-bold text-sm mb-2">${item.price}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-tg-bg rounded-lg p-0.5 px-2 border border-tg-hint/10">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-tg-button p-1 active:scale-90 transition-transform">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-tg-button p-1 active:scale-90 transition-transform">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-500 p-1.5 bg-red-500/10 rounded-lg active:scale-90 transition-transform">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Delivery Details */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm uppercase tracking-wider text-tg-hint">Delivery Details</h2>
            {clients.length > 0 && (
              <button
                onClick={() => setShowClientPicker(true)}
                className="flex items-center gap-1 bg-tg-button/10 text-tg-button text-[11px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
              >
                <User size={12} />
                Pick Client
                <ChevronDown size={12} />
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div className="relative">
              <div className="absolute left-3 top-3 text-tg-hint">
                <MapPin size={18} />
              </div>
              <textarea
                placeholder="Delivery Address *"
                className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 pl-10 pr-16 text-sm focus:outline-none focus:border-tg-button min-h-[80px] resize-none"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button
                onClick={handleGetLocation}
                className="absolute right-3 bottom-3 text-tg-button text-xs font-bold bg-tg-bg px-2 py-1 rounded-md border border-tg-button/30"
              >
                GPS
              </button>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-tg-button"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                placeholder="Customer Phone (Optional)"
                className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-tg-button"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-3 text-tg-hint">
                <FileText size={18} />
              </div>
              <textarea
                placeholder="Order Notes (Optional)"
                className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-tg-button min-h-[60px] resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Total Summary */}
        <section className="bg-tg-secondary-bg p-4 rounded-2xl space-y-2 border border-tg-hint/5">
          <div className="flex justify-between items-center text-tg-hint text-sm">
            <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>${getTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-tg-hint text-sm">
            <span>Delivery</span>
            <span className="text-green-500 font-bold uppercase text-[10px] tracking-wider">Free</span>
          </div>
          <div className="pt-2 mt-2 border-t border-tg-hint/10 flex justify-between items-center">
            <span className="font-bold">Total</span>
            <span className="text-xl font-black text-tg-button">${getTotal().toFixed(2)}</span>
          </div>
        </section>
      </div>

      {/* Opaque Submit Button — fixed above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 z-50 px-4 pb-3 pt-2 bg-tg-bg/95 backdrop-blur-sm border-t border-tg-hint/10">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !address.trim()}
          className="w-full bg-tg-button text-tg-button-text py-4 rounded-xl font-black shadow-lg shadow-tg-button/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40"
          style={{ background: 'var(--tg-theme-button-color, #2563EB)' }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            `Submit Order • $${getTotal().toFixed(2)}`
          )}
        </button>
      </div>

      {/* Client Picker Sheet */}
      {showClientPicker && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowClientPicker(false)} />
          <div className="relative bg-tg-bg rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[70vh] flex flex-col">
            <div className="w-12 h-1.5 bg-tg-hint/20 rounded-full mx-auto mt-4 mb-2 shrink-0" />
            <div className="px-6 py-3 border-b border-tg-hint/10 shrink-0">
              <h3 className="font-bold text-lg">Select Client</h3>
              <p className="text-tg-hint text-xs mt-0.5">Tap to autofill delivery details</p>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {clients.map(client => (
                <button
                  key={client.id}
                  onClick={() => selectClient(client)}
                  className="w-full text-left p-4 bg-tg-secondary-bg rounded-xl border border-tg-hint/5 active:scale-[0.98] transition-transform"
                >
                  <p className="font-bold">{client.name}</p>
                  {client.phone && <p className="text-tg-hint text-sm mt-0.5">{client.phone}</p>}
                  {client.address && <p className="text-tg-hint text-xs mt-0.5 truncate">{client.address}</p>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
