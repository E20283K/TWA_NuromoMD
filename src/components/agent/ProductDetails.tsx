import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { products, isLoading } = useProducts(user?.manufacturer_id || undefined);
  const { addItem, updateQuantity, items, getTotal } = useCartStore();

  const product = products.find(p => p.id === id);
  const cartItem = items.find((item) => item.id === id);
  const quantity = cartItem?.quantity || 0;
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse pt-8">
        <div className="w-full aspect-square bg-tg-secondary-bg rounded-2xl"></div>
        <div className="h-8 bg-tg-secondary-bg rounded-lg w-2/3"></div>
        <div className="h-4 bg-tg-secondary-bg rounded-lg w-1/3"></div>
        <div className="h-24 bg-tg-secondary-bg rounded-lg w-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-xl font-bold mb-2">Product not found</h2>
        <p className="text-tg-hint mb-6">The product you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/catalog')} className="bg-tg-button text-tg-button-text px-6 py-2 rounded-lg font-bold">
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32 bg-tg-bg min-h-screen">
      <div className="relative aspect-square bg-tg-secondary-bg flex items-center justify-center w-full">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl opacity-20">
            {product.category === 'medicine' ? '💊' : product.category === 'drink' ? '🥤' : product.category === 'food' ? '🍞' : '📦'}
          </span>
        )}
      </div>

      <div className="p-5 space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-tg-hint mb-1 block">
              {product.category}
            </span>
            <h1 className="text-2xl font-black leading-tight">{product.name}</h1>
          </div>
          <span className="text-2xl font-black text-tg-button">${product.price}</span>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-sm">Description</h3>
          <p className="text-tg-hint text-sm leading-relaxed">
            {product.description || 'No description available for this product.'}
          </p>
        </div>

        <div className="flex justify-between items-center py-4 border-y border-tg-hint/10">
          <div>
            <p className="text-[10px] uppercase font-bold text-tg-hint">Unit Size</p>
            <p className="font-bold">{product.unit || '1 item'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-tg-hint">Min Order</p>
            <p className="font-bold">{product.min_order_qty} units</p>
          </div>
        </div>

        <div className="pt-4">
          {quantity > 0 ? (
            <div className="flex items-center gap-4 bg-tg-secondary-bg rounded-2xl p-2 justify-between">
              <button 
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-tg-bg border border-tg-hint/10 shadow-sm active:scale-95 transition-transform"
              >
                <Minus size={20} />
              </button>
              <div className="flex flex-col items-center">
                <span className="font-black text-2xl">{quantity}</span>
                <span className="text-[10px] text-tg-hint uppercase font-bold tracking-wider">in cart</span>
              </div>
              <button 
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-tg-button text-tg-button-text shadow-sm active:scale-95 transition-transform"
              >
                <Plus size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => addItem(product)}
              className="w-full py-4 bg-tg-button text-tg-button-text rounded-2xl text-lg font-black flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-tg-button/20"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          )}
        </div>
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <button 
            onClick={() => navigate('/cart')}
            className="w-full bg-tg-bg border-2 border-tg-button text-tg-button py-3.5 rounded-xl font-black shadow-2xl flex items-center justify-between px-4 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-2">
              <div className="bg-tg-button text-tg-button-text w-6 h-6 rounded-full flex items-center justify-center text-xs">
                {cartCount}
              </div>
              <span>View Cart</span>
            </div>
            <span>${getTotal().toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
};
