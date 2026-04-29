import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import type { User } from '../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserX, UserCheck, Search, Link as LinkIcon } from 'lucide-react';
import { tg, haptic } from '../../lib/telegram';
import { clsx } from 'clsx';

export const AgentManager: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'agent')
        .eq('manufacturer_id', user?.id || '');
      if (error) throw error;
      return data as User[];
    },
    enabled: !!user?.id,
  });

  const toggleAgentStatus = useMutation({
    mutationFn: async ({ agentId, isActive }: { agentId: string, isActive: boolean }) => {
      const { error } = await (supabase.from('users') as any)
        .update({ is_active: isActive })
        .eq('id', agentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      haptic.notification('success');
    },
  });

  const filteredAgents = agents.filter(a => 
    a.full_name.toLowerCase().includes(search.toLowerCase()) || 
    a.telegram_username?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyInvite = async () => {
    try {
      haptic.impact('light');
    } catch (e) {
      console.error('Haptic error:', e);
    }
    
    const botUsername = import.meta.env.VITE_BOT_USERNAME?.replace('@', '') || 'YourBotName';
    const inviteLink = `https://t.me/${botUsername}?start=invite_${user?.id}`;
    
    try {
      // Primary method: navigator.clipboard
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteLink);
        tg.showAlert('Invite link copied to clipboard! Send it to your agents.');
        return;
      }
      
      // Fallback method: hidden textarea
      const textArea = document.createElement("textarea");
      textArea.value = inviteLink;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        tg.showAlert('Invite link copied to clipboard! Send it to your agents.');
      } else {
        tg.showAlert(`Invite link: ${inviteLink}`);
      }
    } catch (err) {
      tg.showAlert(`Invite link: ${inviteLink}`);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Sales Agents</h1>
        <button 
          onClick={handleCopyInvite}
          className="bg-tg-button text-tg-button-text p-2 rounded-full shadow-lg active:scale-90 transition-transform"
        >
          <UserPlus size={24} />
        </button>
      </div>

      <div className="bg-tg-button/10 border border-tg-button/20 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-tg-button mb-1">Invite Link</h3>
          <p className="text-[10px] text-tg-hint truncate mr-4">t.me/YourBot?start=invite_{user?.id.substring(0,8)}...</p>
        </div>
        <button 
          onClick={handleCopyInvite}
          className="bg-tg-button text-tg-button-text px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
        >
          <LinkIcon size={14} />
          Copy
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
        <input
          type="text"
          placeholder="Search agents..."
          className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-16 bg-tg-secondary-bg rounded-xl animate-pulse"></div>)
        ) : (
          filteredAgents.map((agent) => (
            <div key={agent.id} className="bg-tg-secondary-bg p-3 rounded-xl border border-tg-hint/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tg-bg rounded-full flex items-center justify-center text-lg">
                  {agent.is_active ? '👤' : '💤'}
                </div>
                <div>
                  <h3 className={clsx('font-bold text-sm', !agent.is_active && 'text-tg-hint')}>
                    {agent.full_name}
                  </h3>
                  <p className="text-[10px] text-tg-hint">@{agent.telegram_username || 'no_username'}</p>
                </div>
              </div>
              <button 
                onClick={() => toggleAgentStatus.mutate({ agentId: agent.id, isActive: !agent.is_active })}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  agent.is_active ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                )}
              >
                {agent.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
              </button>
            </div>
          ))
        )}
        {filteredAgents.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-tg-hint italic">No agents found</p>
          </div>
        )}
      </div>
    </div>
  );
};
