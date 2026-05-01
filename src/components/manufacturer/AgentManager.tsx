import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import type { User } from '../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserX, UserCheck, Search, Link as LinkIcon, Share2 } from 'lucide-react';
import { tg, haptic } from '../../lib/telegram';
import { useTranslation } from '../../lib/i18n';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../shared/PageHeader';

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
      queryClient.invalidateQueries({ queryKey: ['agent'] }); // Invalidate details too
      haptic.notification('success');
    },
    onError: (error: any) => {
      tg.showAlert(`${t('error')}: ${error.message}`);
      haptic.notification('error');
    }
  });

  const filteredAgents = agents.filter(a => 
    a.full_name.toLowerCase().includes(search.toLowerCase()) || 
    a.telegram_username?.toLowerCase().includes(search.toLowerCase())
  );

  const getInviteLink = () => {
    const botUsername = import.meta.env.VITE_BOT_USERNAME?.replace('@', '') || 'nuromomed_bot';
    // Use startapp for direct mini app opening if supported, otherwise start
    return `https://t.me/${botUsername}?start=invite_${user?.id}`;
  };

  const handleShareInvite = () => {
    try {
      haptic.impact('medium');
      const inviteLink = getInviteLink();
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('Join as my sales agent!')}`;
      
      // Attempt 1: Internal Share (if available)
      if ((tg as any).shareUrl) {
        (tg as any).shareUrl(inviteLink, 'Join as my sales agent!');
        return;
      }

      // Attempt 2: openTelegramLink with t.me/ format
      const tmeUrl = shareUrl.replace('https://', '');
      tg.openTelegramLink(tmeUrl);
    } catch (e) {
      // Attempt 3: openLink
      const inviteLink = getInviteLink();
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}`;
      tg.openLink(shareUrl);
    }
  };

  const handleCopyInvite = async () => {
    try {
      haptic.impact('medium');
      const inviteLink = getInviteLink();
      
      // Try Modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteLink);
        tg.showAlert(t('linkCopied'));
        return;
      }
      
      // Fallback to older method
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
        tg.showAlert(`${t('inviteLink')}:\n${inviteLink}`);
      }
    } catch (err) {
      const inviteLink = getInviteLink();
      tg.showAlert(`${t('inviteLink')}:\n${inviteLink}`);
    }
  };

  return (
    <div className="min-h-screen bg-tg-bg pb-24">
      <PageHeader 
        title={t('salesAgents')} 
        showBack={false}
        rightElement={
          <button 
            onClick={handleShareInvite}
            className="bg-tg-button text-tg-button-text p-2 rounded-xl shadow-lg active:scale-90 transition-transform flex items-center justify-center"
          >
            <UserPlus size={20} />
          </button>
        }
      />

      <div className="p-4 space-y-4">
        <div className="bg-tg-button/10 border border-tg-button/20 p-4 rounded-3xl space-y-4">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-tg-button mb-1.5 opacity-80">{t('inviteLink')}</h3>
            <div className="bg-tg-bg/50 p-3 rounded-xl border border-tg-button/5">
              <p className="text-[11px] text-tg-hint break-all font-medium leading-relaxed">
                {getInviteLink()}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleCopyInvite}
              className="bg-tg-secondary-bg text-tg-text h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all border border-tg-hint/10 shadow-sm"
            >
              <LinkIcon size={16} />
              {t('copy')}
            </button>
            <button 
              onClick={handleShareInvite}
              className="bg-tg-button text-tg-button-text h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-tg-button/20"
            >
              <Share2 size={16} />
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
    </div>
  );
};
