import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-tg-bg p-6">
      <div className="w-12 h-12 border-4 border-tg-button border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-tg-hint animate-pulse font-medium">Initializing OrderFlow...</p>
    </div>
  );
};
