import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { tg, haptic } from '../../lib/telegram';

export const LinkManufacturer: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLink = async () => {
    if (!inviteCode.trim()) return;
    setIsLoading(true);
    try {
      // Find manufacturer by telegram_id or UUID (if they paste the full link)
      let mId = inviteCode.trim();
      
      // If they pasted the full link, extract the ID
      if (mId.includes('invite_')) {
        mId = mId.split('invite_')[1];
      }

      // First try to find by UUID directly
      let { data: manufacturer } = await supabase
        .from('users')
        .select('id')
        .eq('id', mId)
        .eq('role', 'manufacturer')
        .single();

      // If not found, try to find by telegram_id (in case we use shorter numbers later)
      if (!manufacturer && !isNaN(Number(mId))) {
        const { data: m2 } = await supabase
          .from('users')
          .select('id')
          .eq('telegram_id', Number(mId))
          .eq('role', 'manufacturer')
          .single();
        if (m2) manufacturer = m2;
      }

      if (!manufacturer) {
        throw new Error('Manufacturer not found. Please check the code.');
      }

      // Update the current user's manufacturer_id
      const { data: updatedUser, error } = await (supabase.from('users') as any)
        .update({ manufacturer_id: manufacturer.id })
        .eq('id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      haptic.notification('success');
      setUser(updatedUser);
    } catch (error: any) {
      haptic.notification('error');
      tg.showAlert(error.message || 'Invalid invite code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-tg-bg text-tg-text safe-top">
      <div className="text-6xl mb-4">🔗</div>
      <h1 className="text-2xl font-bold mb-2">Link Account</h1>
      <p className="text-tg-hint mb-6 max-w-xs mx-auto">
        Please paste the invite link or code provided by your manufacturer to continue.
      </p>
      
      <input
        type="text"
        placeholder="Paste invite link or code..."
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-center mb-4 focus:outline-none focus:border-tg-button"
      />

      <button 
        onClick={handleLink}
        disabled={isLoading || !inviteCode.trim()}
        className="w-full bg-tg-button text-tg-button-text py-3 rounded-xl font-bold disabled:opacity-50"
      >
        {isLoading ? 'Linking...' : 'Connect to Manufacturer'}
      </button>
    </div>
  );
};
