import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useOrders } from '../../hooks/useOrders';
import { useClients } from '../../hooks/useClients';
import { useNavigate } from 'react-router-dom';
import { Trash2, MapPin, Plus, Minus, User, Phone, FileText, ShoppingCart, ArrowLeft } from 'lucide-react';
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
  }, [items, getTotal, navigate, showSuccess]);

  const handleSubmit = async () => {
    if (items.length === 0 || isSubmitting) return;
    if (!address) {
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
        subtotal: item.price * item.quantity
      }));

      await createOrder({ order: orderData, items: orderItems });
      
      haptic.notification('success');
      clearCart();
      setAddress('');
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
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
          setAddress(`GPS: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`);
        }
      });
    });
  };

  const selectClient = (client: any) => {
    setCustomerName(client.name);
    setCustomerPhone(client.phone);
    setAddress(client.address);
    haptic.impact('light');
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 text-5xl">
          ✅
        </div>
        <h2 className="text-2xl font-black mb-2">Order Submitted!</h2>
        <p className="text-tg-hint mb-8 max-w-xs">Your order has been sent to the manufacturer for approval.</p>
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={() => navigate('/history')}
            className="w-full bg-tg-button text-tg-button-text py-4 rounded-2xl font-bold shadow-lg"
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
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="w-20 h-20 bg-tg-secondary-bg rounded-full flex items-center justify-center mb-4">
          <ShoppingCart size={40} className="text-tg-hint opacity-30" />
        </div>
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-tg-hint mb-6">Add some products from the catalog to start a new order.</p>
        <button 
          onClick={() => navigate('/catalog')}
          className="bg-tg-button text-tg-button-text px-8 py-3 rounded-xl font-bold"
        >
          Go to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-48">
      <header className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-tg-secondary-bg rounded-full text-tg-hint active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Your Order</h1>
      </header>

      <section className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-tg-secondary-bg p-3 rounded-xl flex gap-3 border border-tg-hint/5">
            <div className="w-16 h-16 bg-tg-bg rounded-lg flex items-center justify-center text-xl shrink-0">
               {item.category === 'medicine' ? '💊' : item.category === 'drink' ? '🥤' : item.category === 'food' ? '🍞' : '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate">{item.name}</h3>
              <p className="text-tg-button font-bold text-sm mb-2">${item.price}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 bg-tg-bg rounded-lg p-0.5 px-2 border border-tg-hint/10">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-tg-button p-1"><Minus size={14} /></button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-tg-button p-1"><Plus size={14} /></button>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-red-500 p-1"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-sm uppercase tracking-wider text-tg-hint">Delivery Details</h2>
          {clients.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[200px]">
              {clients.map((client) => (
                <button 
                  key={client.id}
                  onClick={() => selectClient(client)}
                  className="bg-tg-button/10 text-tg-button text-[10px] px-2 py-1 rounded-md whitespace-nowrap font-bold"
                >
                  {client.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-3 top-3 text-tg-hint"><MapPin size={18} /></div>
            <textarea
              placeholder="Delivery Address *"
              className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-tg-button min-h-[80px]"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button 
              onClick={handleGetLocation}
              className="absolute right-3 bottom-3 text-tg-button text-xs font-bold bg-tg-bg px-2 py-1 rounded-md border border-tg-button/20"
            >
              GPS
            </button>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint"><User size={18} /></div>
            <input
              type="text"
              placeholder="Customer Name (Optional)"
              className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-tg-button"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint"><Phone size={18} /></div>
            <input
              type="tel"
              placeholder="Customer Phone (Optional)"
              className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-tg-button"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute left-3 top-3 text-tg-hint"><FileText size={18} /></div>
            <textarea
              placeholder="Order Notes (Optional)"
              className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-tg-button min-h-[60px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="bg-tg-secondary-bg p-4 rounded-2xl space-y-2">
        <div className="flex justify-between items-center text-tg-hint text-sm">
          <span>Subtotal</span>
          <span>${getTotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-tg-hint text-sm">
          <span>Delivery</span>
          <span className="text-green-500 font-bold uppercase text-[10px]">Free</span>
        </div>
        <div className="pt-2 mt-2 border-t border-tg-hint/10 flex justify-between items-center">
          <span className="font-bold">Total</span>
          <span className="text-xl font-black text-tg-button">${getTotal().toFixed(2)}</span>
        </div>
      </section>

      {/* On-screen floating submit button (Fallback for Telegram Native Button) */}
      <div className="fixed bottom-24 left-4 right-4 z-50">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || !address.trim()}
          className="w-full bg-tg-button text-tg-button-text py-4 rounded-xl font-black shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="animate-pulse">Submitting...</span>
          ) : (
            `Submit Order • $${getTotal().toFixed(2)}`
          )}
        </button>
      </div>
    </div>
  );
};
