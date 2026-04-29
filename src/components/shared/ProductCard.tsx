import React from 'react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { clsx } from 'clsx';

interface ProductCardProps {
  product: Product;
  mode: 'catalog' | 'manager';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, mode }) => {
  const { addItem, updateQuantity, items } = useCartStore();
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="bg-tg-bg border border-tg-hint/20 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="aspect-square bg-tg-secondary-bg flex items-center justify-center relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl opacity-20">
            {product.category === 'medicine' ? '💊' : product.category === 'drink' ? '🥤' : product.category === 'food' ? '🍞' : '📦'}
          </span>
        )}
        {quantity > 0 && mode === 'catalog' && (
          <div className="absolute top-2 right-2 bg-tg-button text-tg-button-text w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {quantity}
          </div>
        )}
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-sm line-clamp-1">{product.name}</h3>
          <span className="text-tg-button font-bold text-sm">${product.price}</span>
        </div>
        <p className="text-tg-hint text-xs mb-3 flex-1 line-clamp-2">{product.description || `Per ${product.unit}`}</p>
        
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
                Add
              </button>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center mt-auto">
             <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-bold uppercase', product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700')}>
              {product.is_active ? 'Active' : 'Archived'}
            </span>
            <span className="text-tg-hint text-[10px]">Stock: {product.stock_qty ?? '∞'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
