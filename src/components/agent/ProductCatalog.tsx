import React, { useState, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { ProductCard } from '../shared/ProductCard';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import { showMainButton, hideMainButton } from '../../lib/telegram';

const categories = ['All', 'Medicine', 'Drinks', 'Food', 'Other'];

export const ProductCatalog: React.FC = () => {
  const { user } = useAuthStore();
  const { products, isLoading } = useProducts(user?.manufacturer_id || undefined);
  const { getItemCount, getTotal } = useCartStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const cartCount = getItemCount();

  useEffect(() => {
    if (cartCount > 0) {
      showMainButton(`View Cart (${cartCount} items) • $${getTotal().toFixed(2)}`, () => {
        navigate('/cart');
      });
    } else {
      hideMainButton();
    }
    
    return () => hideMainButton();
  }, [cartCount, getTotal, navigate]);

  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="flex flex-col gap-3">
        <h1 className="text-xl font-bold">Catalog</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-tg-button"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-tg-hint"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                'px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap',
                selectedCategory === cat
                  ? 'bg-tg-button text-tg-button-text'
                  : 'bg-tg-secondary-bg text-tg-hint border border-tg-hint/10'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[3/4] bg-tg-secondary-bg rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} mode="catalog" />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <p className="text-tg-hint italic">No products found</p>
            </div>
          )}
        </div>
      )}

      {/* On-screen floating cart button (Fallback for Telegram Native Button) */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <button 
            onClick={() => navigate('/cart')}
            className="w-full bg-tg-button text-tg-button-text py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-between px-4 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-2">
              <div className="bg-tg-bg text-tg-button w-6 h-6 rounded-full flex items-center justify-center text-xs">
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
