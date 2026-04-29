import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { initTWA } from './lib/telegram';

// Components - Agent
import { AgentHome } from './components/agent/AgentHome';
import { ProductCatalog } from './components/agent/ProductCatalog';
import { OrderHistory as AgentOrderHistory } from './components/agent/OrderHistory';
import { Cart } from './components/agent/Cart';

// Components - Manufacturer
import { Dashboard as ManufacturerDashboard } from './components/manufacturer/Dashboard';
import { OrderList as ManufacturerOrderList } from './components/manufacturer/OrderList';
import { ProductManager } from './components/manufacturer/ProductManager';
import { AgentManager } from './components/manufacturer/AgentManager';

// Shared
import { BottomNav } from './components/shared/BottomNav';
import { LoadingScreen } from './components/shared/LoadingScreen';

import { BackButtonManager } from './components/shared/BackButtonManager';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { user, isLoading, login, error } = useAuthStore();

  useEffect(() => {
    initTWA();
    login();
  }, [login]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-tg-bg text-tg-text">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
        <p className="text-tg-hint mb-6 max-w-xs mx-auto">
          {error || 'Please open this app through the official Telegram bot.'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-tg-button text-tg-button-text px-6 py-3 rounded-xl font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (user.role === 'agent' && !user.is_active) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-tg-bg text-tg-text safe-top">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold mb-2">Pending Approval</h1>
        <p className="text-tg-hint mb-6 max-w-xs mx-auto">
          Your account is waiting for approval from the manufacturer. Please check back later.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-tg-button text-tg-button-text px-6 py-3 rounded-xl font-bold"
        >
          Refresh Status
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text pb-20 safe-top">
      <BackButtonManager />
      <Routes>
        {user.role === 'agent' ? (
          <>
            <Route path="/" element={<AgentHome />} />
            <Route path="/catalog" element={<ProductCatalog />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/history" element={<AgentOrderHistory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<ManufacturerDashboard />} />
            <Route path="/orders" element={<ManufacturerOrderList />} />
            <Route path="/products" element={<ProductManager />} />
            <Route path="/agents" element={<AgentManager />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
      <BottomNav role={user.role} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
