import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, showBack = true, rightElement }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-tg-bg/90 backdrop-blur-md border-b border-tg-hint/10 px-4 py-3 flex items-center gap-3">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center bg-tg-secondary-bg rounded-full text-tg-hint active:scale-90 transition-transform shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="font-bold text-lg leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-tg-hint text-[11px] truncate">{subtitle}</p>}
      </div>
      {rightElement && <div className="shrink-0">{rightElement}</div>}
    </header>
  );
};
