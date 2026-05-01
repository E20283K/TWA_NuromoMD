import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { Plus, Minus, ShoppingCart, Package } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from '../../lib/i18n';

interface ProductCardProps {
  product: Product;
  mode: 'catalog' | 'manager';
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, mode, viewMode = 'grid' }) => {
  const { addItem, updateQuantity, items } = useCartStore();
  const { t } = useTranslation();
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking inside the add/remove buttons
    if ((e.target as HTMLElement).closest('button')) return;
    if (mode === 'catalog') {
      navigate(`/product/${product.id}`);
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-tg-bg border border-tg-hint/10 rounded-2xl overflow-hidden flex items-center p-3 gap-4 active:bg-tg-secondary-bg transition-colors"
        onClick={handleCardClick}
      >
        <div className="w-16 h-16 bg-tg-secondary-bg rounded-xl flex items-center justify-center shrink-0 relative">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <Package size={24} className="opacity-20" />
          )}
          {quantity > 0 && mode === 'catalog' && (
            <div className="absolute -top-1 -right-1 bg-tg-button text-tg-button-text w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
              {quantity}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-0.5">
            <h3 className="font-bold text-sm truncate pr-2">{product.name}</h3>
            <span className="text-tg-button font-bold text-sm">${product.price}</span>
          </div>
          <p className="text-tg-hint text-[11px] truncate mb-2">{product.description || `${t('unit')}: ${product.unit}`}</p>
          
          <div className="flex items-center justify-between">
            {mode === 'catalog' ? (
              <div className="flex items-center gap-2">
                {quantity > 0 ? (
                  <div className="flex items-center gap-3 bg-tg-secondary-bg rounded-lg px-2 py-1">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="text-tg-button"><Minus size={14} /></button>
                    <span className="text-xs font-bold">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="text-tg-button"><Plus size={14} /></button>
                  </div>
                ) : (
                  <button onClick={() => addItem(product)} className="text-tg-button font-bold text-xs flex items-center gap-1">
                    <Plus size={14} /> {t('add')}
                  </button>
                )}
              </div>
            ) : (
              <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-bold uppercase', product.is_active ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500')}>
                {product.is_active ? t('active') : t('inactive')}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-tg-bg border border-tg-hint/20 rounded-xl overflow-hidden shadow-sm flex flex-col cursor-pointer active:scale-[0.98] transition-transform"
      onClick={handleCardClick}
    >
      <div className="aspect-square bg-tg-secondary-bg flex items-center justify-center relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl opacity-20">
            {product.category === 'medicine' ? '💊' : product.category === 'drink' ? '🥤' : product.category === 'food' ? '🍞' : '📦'}
          </span>
        )}
        {quantity > 0 && mode === 'catalog' && (
          <div className="absolute top-2 right-2 bg-tg-button text-tg-button-text w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
            {quantity}
          </div>
        )}
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-sm line-clamp-1">{product.name}</h3>
          <span className="text-tg-button font-bold text-sm">${product.price}</span>
        </div>
        <p className="text-tg-hint text-[11px] mb-3 flex-1 line-clamp-2">{product.description || `${t('unit')}: ${product.unit}`}</p>
        
        {mode === 'catalog' ? (
          <div className="flex items-center justify-between mt-auto">
            {quantity > 0 ? (
              <div className="flex items-center gap-3 bg-tg-secondary-bg rounded-lg p-1 w-full justify-between">
                <button 
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-tg-bg border border-tg-hint/20 shadow-sm"
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold text-sm">{quantity}</span>
                <button 
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-tg-button text-tg-button-text shadow-sm"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => addItem(product)}
                className="w-full py-2 bg-tg-button text-tg-button-text rounded-lg text-sm font-bold flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                {t('add')}
              </button>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center mt-auto">
             <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-bold uppercase', product.is_active ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500')}>
              {product.is_active ? t('active') : t('inactive')}
            </span>
            <span className="text-tg-hint text-[10px]">{t('minOrder')}: {product.min_order_qty ?? '1'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
