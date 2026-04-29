import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useClients } from '../../hooks/useClients';
import { PageHeader } from '../shared/PageHeader';
import { UserPlus, MapPin, Phone, Trash2, X, User } from 'lucide-react';
import { haptic, tg } from '../../lib/telegram';

export const ClientManager: React.FC = () => {
  const { user } = useAuthStore();
  const { clients, isLoading, fetchError, addClient, deleteClient } = useClients(user?.id);
  const [isAdding, setIsAdding] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGetLocation = () => {
    haptic.impact('light');
    if (!tg.LocationManager) {
      tg.showAlert('Location is not available in this version of Telegram.');
      return;
    }
    tg.LocationManager.init(() => {
      tg.LocationManager.getLocation((data) => {
        if (data && data.latitude && data.longitude) {
          setAddress(`${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`);
        }
      });
    });
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setAddress('');
  };

  const handleAdd = async () => {
    if (!name.trim() || !address.trim()) {
      tg.showAlert('Client name and address are required');
      return;
    }

    try {
      setIsSubmitting(true);
      haptic.impact('medium');
      await addClient({
        agent_id: user!.id,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      haptic.notification('success');
      setIsAdding(false);
      resetForm();
    } catch (e: any) {
      console.error('addClient error:', e);
      tg.showAlert(`Failed to save client: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, clientName: string) => {
    haptic.impact('medium');
    tg.showConfirm(`Delete "${clientName}"?`, async (ok) => {
      if (ok) {
        try {
          await deleteClient(id);
          haptic.notification('success');
        } catch (e: any) {
          tg.showAlert(e.message);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-tg-bg pb-24">
      <PageHeader
        title="Client Base"
        showBack={false}
        rightElement={
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 bg-tg-button text-tg-button-text text-sm font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform shadow-lg shadow-tg-button/20"
          >
            <UserPlus size={16} />
            Add
          </button>
        }
      />

      <div className="p-4 space-y-3">
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-tg-secondary-bg rounded-2xl" />)}
          </div>
        )}

        {!isLoading && fetchError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm">
            <p className="font-bold text-red-500 mb-1">Database Error</p>
            <p className="text-red-600">{fetchError.message}</p>
            <p className="text-tg-hint text-xs mt-2">The `clients` table may not exist yet. Run migration 003_clients.sql in Supabase SQL Editor.</p>
          </div>
        )}

        {!isLoading && clients.length === 0 && !fetchError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-tg-secondary-bg rounded-full flex items-center justify-center mb-4">
              <User size={36} className="text-tg-hint opacity-40" />
            </div>
            <h2 className="font-bold text-lg mb-1">No Clients Yet</h2>
            <p className="text-tg-hint text-sm mb-6 max-w-xs">
              Add your regular clients to speed up order creation — their info will be auto-filled in the cart.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-tg-button text-tg-button-text font-bold px-6 py-3 rounded-xl shadow-lg shadow-tg-button/20 active:scale-95 transition-transform"
            >
              Add First Client
            </button>
          </div>
        )}

        {clients.map(client => (
          <div key={client.id} className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/5 relative">
            <button
              onClick={() => handleDelete(client.id, client.name)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-red-500/60 bg-red-500/10 rounded-full active:scale-90 transition-transform"
            >
              <Trash2 size={15} />
            </button>

            <h3 className="font-bold text-base pr-10 mb-2">{client.name}</h3>

            <div className="space-y-1.5">
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-tg-hint">
                  <Phone size={13} className="shrink-0" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-2 text-sm text-tg-hint">
                  <MapPin size={13} className="shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{client.address}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Sheet */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setIsAdding(false); resetForm(); }} />
          <div className="relative bg-tg-bg rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-tg-hint/20 rounded-full mx-auto mb-6" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">New Client</h2>
              <button onClick={() => { setIsAdding(false); resetForm(); }} className="w-9 h-9 flex items-center justify-center bg-tg-secondary-bg rounded-full text-tg-hint">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">Client Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Alisher Pharmacy"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">Delivery Address *</label>
                <div className="relative">
                  <textarea
                    placeholder="Full delivery address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 min-h-[80px] text-sm focus:outline-none focus:border-tg-button resize-none pr-16"
                  />
                  <button
                    onClick={handleGetLocation}
                    className="absolute right-3 bottom-3 text-tg-button text-[11px] font-bold bg-tg-bg px-2 py-1 rounded-md border border-tg-button/30"
                  >
                    GPS
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={isSubmitting || !name.trim() || !address.trim()}
              className="w-full py-4 rounded-xl font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-40 shadow-lg"
              style={{ background: isSubmitting || !name.trim() || !address.trim() ? undefined : 'var(--tg-theme-button-color, #2563EB)' }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Client'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
