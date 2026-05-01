import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../lib/i18n';
import { PageHeader } from '../shared/PageHeader';
import { haptic, tg } from '../../lib/telegram';
import { UserX, UserCheck, Package, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { StatusBadge } from '../shared/StatusBadge';
import type { User } from '../../types';

export const AgentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: agent, isLoading: isLoadingAgent } = useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as User;
    },
    enabled: !!id,
  });

  const { orders, isLoading: isLoadingOrders } = useOrders('agent', id);

  const toggleAgentStatus = useMutation({
    mutationFn: async (isActive: boolean) => {
      const { error } = await (supabase.from('users') as any)
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      haptic.notification('success');
    },
  });

  if (isLoadingAgent) {
    return (
      <div className="min-h-screen bg-tg-bg">
        <div className="h-14 bg-tg-secondary-bg animate-pulse" />
        <div className="p-4 space-y-4">
          <div className="h-32 bg-tg-secondary-bg rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-tg-secondary-bg rounded-2xl animate-pulse" />
            <div className="h-24 bg-tg-secondary-bg rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-tg-bg">
        <h2 className="text-xl font-bold mb-2">{t('agentNotFound')}</h2>
        <button onClick={() => navigate(-1)} className="bg-tg-button text-tg-button-text px-6 py-2 rounded-lg font-bold">
          {t('goBack')}
        </button>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  return (
    <div className="min-h-screen bg-tg-bg pb-24">
      <PageHeader title={t('agentDetails')} />

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-tg-secondary-bg p-6 rounded-3xl border border-tg-hint/10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-tg-bg rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner">
            👤
          </div>
          <h2 className="text-xl font-bold mb-1">{agent.full_name}</h2>
          <p className="text-tg-hint text-sm mb-4">@{agent.telegram_username || 'no_username'}</p>
          
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${agent.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {agent.is_active ? t('active') : t('inactive')}
            </span>
            <span className="px-3 py-1 bg-tg-button/10 text-tg-button rounded-full text-xs font-bold uppercase tracking-wider">
              {t('agent')}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/10">
            <div className="flex items-center gap-2 mb-2">
              <Package size={14} className="text-indigo-500" />
              <p className="text-tg-hint text-[10px] uppercase font-bold tracking-wider">{t('totalOrders')}</p>
            </div>
            <p className="text-2xl font-black text-indigo-500">{orders.length}</p>
          </div>
          
          <div className="bg-tg-secondary-bg p-4 rounded-2xl border border-tg-hint/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-green-500" />
              <p className="text-tg-hint text-[10px] uppercase font-bold tracking-wider">{t('totalEarned')}</p>
            </div>
            <p className="text-2xl font-black text-green-500">${totalRevenue.toFixed(0)}</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            haptic.impact('medium');
            toggleAgentStatus.mutate(!agent.is_active);
          }}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
            agent.is_active 
              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
              : 'bg-green-500 text-white shadow-green-500/20'
          }`}
        >
          {agent.is_active ? (
            <><UserX size={20} /> {t('blockAgent')}</>
          ) : (
            <><UserCheck size={20} /> {t('approveAgent')}</>
          )}
        </button>

        {/* Recent Orders */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-tg-hint uppercase tracking-wider ml-1">{t('history')}</h3>
          <div className="space-y-2">
            {isLoadingOrders ? (
              [1, 2].map(i => <div key={i} className="h-16 bg-tg-secondary-bg rounded-xl animate-pulse" />)
            ) : orders.length === 0 ? (
              <div className="text-center py-8 bg-tg-secondary-bg rounded-2xl border border-dashed border-tg-hint/20">
                <p className="text-tg-hint text-sm italic">{t('noOrdersYet')}</p>
              </div>
            ) : (
              orders.slice(0, 5).map(order => (
                <div 
                  key={order.id}
                  onClick={() => navigate(`/order/${order.id}`)}
                  className="bg-tg-secondary-bg p-3 rounded-xl flex items-center justify-between active:bg-tg-bg border border-tg-hint/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-tg-bg rounded-full flex items-center justify-center">
                      📦
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm">#{order.order_number}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-tg-hint text-[10px]">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-tg-button">${Number(order.total_amount).toFixed(2)}</p>
                    <ChevronRight size={14} className="ml-auto text-tg-hint" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
