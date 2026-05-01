import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import type { User } from '../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserX, UserCheck, Search, Link as LinkIcon, Share2 } from 'lucide-react';
import { tg, haptic } from '../../lib/telegram';
import { useTranslation } from '../../lib/i18n';
import { useNavigate } from 'react-router-dom';

export const AgentManager: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const getInviteLink = () => {
    const botUsername = import.meta.env.VITE_BOT_USERNAME?.replace('@', '') || 'YourBotName';
    return `https://t.me/${botUsername}?startapp=invite_${user?.id}`;
  };

  const handleShareInvite = () => {
    haptic.impact('light');
    const inviteLink = getInviteLink();
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('Join as my sales agent!')}`;
    tg.openTelegramLink(shareUrl);
  };

  const handleCopyInvite = async () => {
    haptic.impact('light');
    const inviteLink = getInviteLink();
    
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteLink);
        tg.showAlert(t('linkCopied'));
        return;
      }
      
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
        tg.showAlert(t('linkCopied'));
      } else {
        tg.showAlert(`${t('inviteLink')}: ${inviteLink}`);
      }
    } catch (err) {
      tg.showAlert(`${t('inviteLink')}: ${inviteLink}`);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{t('salesAgents')}</h1>
        <button 
          onClick={handleShareInvite}
          className="bg-tg-button text-tg-button-text p-2 rounded-full shadow-lg active:scale-90 transition-transform"
        >
          <UserPlus size={24} />
        </button>
      </div>

      <div className="bg-tg-button/10 border border-tg-button/20 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-tg-button mb-1">{t('inviteLink')}</h3>
          <p className="text-[10px] text-tg-hint truncate mr-4">t.me/YourBot?start=invite_{user?.id.substring(0,8)}...</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleCopyInvite}
            className="bg-tg-secondary-bg text-tg-text px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform border border-tg-hint/10"
          >
            <LinkIcon size={14} />
            {t('copy')}
          </button>
          <button 
            onClick={handleShareInvite}
            className="bg-tg-button text-tg-button-text px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
          >
            <Share2 size={14} />
            {t('share')}
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
        <input
          type="text"
          placeholder={t('searchAgents')}
          className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-16 bg-tg-secondary-bg rounded-xl animate-pulse"></div>)
        ) : (
          <>
            {filteredAgents.some(a => !a.is_active) && (
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-tg-hint uppercase tracking-wider mb-3">{t('pendingApprovals')}</h2>
                {filteredAgents.filter(a => !a.is_active).map((agent) => (
                  <div 
                    key={agent.id} 
                    onClick={() => navigate(`/agent/${agent.id}`)}
                    className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20 flex items-center justify-between active:bg-yellow-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/20 text-yellow-600 rounded-full flex items-center justify-center text-lg">
                        ⏳
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-yellow-600">
                          {agent.full_name}
                        </h3>
                        <p className="text-[10px] text-yellow-600/70">@{agent.telegram_username || 'no_username'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAgentStatus.mutate({ agentId: agent.id, isActive: true });
                      }}
                      className="p-2 rounded-lg bg-green-500/10 text-green-500 active:scale-95 transition-transform"
                    >
                      <UserCheck size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-sm font-bold text-tg-hint uppercase tracking-wider mb-3">{t('activeAgents')}</h2>
              {filteredAgents.filter(a => a.is_active).length === 0 ? (
                <div className="text-center py-6 bg-tg-secondary-bg rounded-xl border border-dashed border-tg-hint/20">
                  <p className="text-tg-hint text-sm italic">{t('noActiveAgents')}</p>
                </div>
              ) : (
                filteredAgents.filter(a => a.is_active).map((agent) => (
                  <div 
                    key={agent.id} 
                    onClick={() => navigate(`/agent/${agent.id}`)}
                    className="bg-tg-secondary-bg p-3 rounded-xl border border-tg-hint/5 flex items-center justify-between active:bg-tg-bg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-tg-bg rounded-full flex items-center justify-center text-lg">
                        👤
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">
                          {agent.full_name}
                        </h3>
                        <p className="text-[10px] text-tg-hint">@{agent.telegram_username || 'no_username'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAgentStatus.mutate({ agentId: agent.id, isActive: false });
                      }}
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 active:scale-95 transition-transform"
                    >
                      <UserX size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        {filteredAgents.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-tg-hint italic">{t('noAgentsFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
