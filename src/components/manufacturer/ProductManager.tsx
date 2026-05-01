import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../shared/ProductCard';
import { PageHeader } from '../shared/PageHeader';
import { Plus, Search, Image as ImageIcon, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../lib/i18n';

export const ProductManager: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { products, isLoading } = useProducts(user?.id);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-tg-bg pb-24">
      <PageHeader
        title={t('productCatalog')}
        showBack={false}
        rightElement={
          <button
            onClick={() => navigate('/product/new')}
            className="flex items-center gap-1.5 bg-tg-button text-tg-button-text text-sm font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform shadow-lg shadow-tg-button/20"
          >
            <Plus size={16} />
            {t('add')}
          </button>
        }
      />

      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
            <input
              type="text"
              placeholder={t('searchProducts')}
              className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-tg-button"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="bg-tg-secondary-bg p-2.5 rounded-xl border border-tg-hint/10 text-tg-hint active:scale-95 transition-transform"
          >
            {viewMode === 'grid' ? <List size={20} /> : <LayoutGrid size={20} />}
          </button>
        </div>

        {isLoading ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-3" : "space-y-3"}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`bg-tg-secondary-bg rounded-2xl animate-pulse ${viewMode === 'grid' ? 'aspect-[4/5]' : 'h-24'}`} />
            ))}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-3" : "space-y-3"}>
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)} 
                className="cursor-pointer active:scale-[0.98] transition-transform"
              >
                <ProductCard product={product} mode="manager" viewMode={viewMode} />
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-16 opacity-50">
            <ImageIcon size={40} className="mx-auto mb-3 text-tg-hint" />
            <p className="text-tg-hint">{t('noProductsYet')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
