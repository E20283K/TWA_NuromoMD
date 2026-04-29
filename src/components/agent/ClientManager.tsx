import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useClients } from '../../hooks/useClients';
import { UserPlus, MapPin, Phone, Trash2, X } from 'lucide-react';
import { haptic, tg } from '../../lib/telegram';

export const ClientManager: React.FC = () => {
  const { user } = useAuthStore();
  const { clients, isLoading, addClient, deleteClient } = useClients(user?.id);
  const [isAdding, setIsAdding] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAdd = async () => {
    if (!name || !address) {
      tg.showAlert('Name and address are required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      haptic.impact('medium');
      await addClient({
        agent_id: user!.id,
        name,
        phone,
        address
      });
      haptic.notification('success');
      setIsAdding(false);
      setName('');
      setPhone('');
      setAddress('');
    } catch (e: any) {
      tg.showAlert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    haptic.impact('medium');
    tg.showConfirm('Delete this client?', async (ok) => {
      if (ok) {
        await deleteClient(id);
      }
    });
  };

  if (isLoading) {
    return <div className="p-4 space-y-4 animate-pulse"><div className="h-20 bg-tg-secondary-bg rounded-xl"></div></div>;
  }

  return (
    <div className="p-4 pb-32 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Client Base</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-tg-button/10 text-tg-button p-2 rounded-xl active:scale-95 transition-transform"
        >
          <UserPlus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {clients.length === 0 && !isAdding && (
          <div className="text-center py-10 opacity-50">
            <p>No clients added yet.</p>
          </div>
        )}

        {clients.map(client => (
          <div key={client.id} className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/5 flex flex-col gap-3 relative">
            <button 
              onClick={() => handleDelete(client.id)}
              className="absolute top-3 right-3 text-red-500/50 hover:text-red-500 p-1"
            >
              <Trash2 size={16} />
            </button>
            
            <h3 className="font-bold text-lg pr-8">{client.name}</h3>
            
            <div className="space-y-1.5">
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-tg-hint">
                  <Phone size={14} />
                  <span>{client.phone}</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm text-tg-hint">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                <span className="line-clamp-2">{client.address}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAdding(false)}></div>
          <div className="relative bg-tg-bg rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">New Client</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 bg-tg-secondary-bg rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Client Name *"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 focus:outline-none focus:border-tg-button"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 focus:outline-none focus:border-tg-button"
              />
              <div className="relative">
                <textarea
                  placeholder="Delivery Address *"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 min-h-[80px] focus:outline-none focus:border-tg-button pr-12"
                />
                <button 
                  onClick={handleGetLocation}
                  className="absolute right-3 bottom-3 text-tg-button text-xs font-bold bg-tg-bg px-2 py-1 rounded-md border border-tg-button/20"
                >
                  GPS
                </button>
              </div>
            </div>

            <button 
              onClick={handleAdd}
              disabled={isSubmitting || !name || !address}
              className="w-full bg-tg-button text-tg-button-text py-4 rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Client'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
