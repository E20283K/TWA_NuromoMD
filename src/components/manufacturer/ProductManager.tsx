import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../shared/ProductCard';
import { Plus, X, Search, Image as ImageIcon } from 'lucide-react';
import { tg, haptic } from '../../lib/telegram';
import { Product } from '../../types';

export const ProductManager: React.FC = () => {
  const { user } = useAuthStore();
  const { products, addProduct, updateProduct, isLoading } = useProducts(user?.id);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'other',
    unit: 'pcs',
    min_order_qty: 1,
    is_active: true,
  });

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      tg.showAlert('Please provide name and price');
      return;
    }

    try {
      haptic.impact('medium');
      await addProduct({
        ...newProduct,
        manufacturer_id: user?.id,
      } as any);
      
      setIsAdding(false);
      setNewProduct({
        name: '',
        price: 0,
        category: 'other',
        unit: 'pcs',
        min_order_qty: 1,
        is_active: true,
      });
      tg.showAlert('Product added successfully');
    } catch (error: any) {
      tg.showAlert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Product Catalog</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-tg-button text-tg-button-text p-2 rounded-full shadow-lg"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
        <input
          type="text"
          placeholder="Search your products..."
          className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => (
          <div key={product.id} className="relative group">
             <ProductCard product={product} mode="manager" />
             <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => updateProduct({ id: product.id, is_active: !product.is_active })}
                  className="bg-white/90 backdrop-blur p-1.5 rounded-lg shadow-sm text-xs"
                >
                  {product.is_active ? 'Archive' : 'Activate'}
                </button>
             </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAdding(false)}></div>
          <div className="relative bg-tg-bg rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
            <div className="w-12 h-1.5 bg-tg-hint/20 rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-black">Add Product</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 bg-tg-secondary-bg rounded-full text-tg-hint">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="aspect-video bg-tg-secondary-bg rounded-2xl border-2 border-dashed border-tg-hint/20 flex flex-col items-center justify-center gap-2 text-tg-hint">
                <ImageIcon size={32} />
                <p className="text-xs font-bold uppercase tracking-wider">Upload Photo</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-tg-hint ml-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol 500mg"
                  className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-tg-hint ml-1">Price ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-tg-hint ml-1">Unit</label>
                  <input
                    type="text"
                    placeholder="box, pcs, bottle"
                    className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-tg-hint ml-1">Category</label>
                <select
                  className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                >
                  <option value="medicine">Medicine</option>
                  <option value="drink">Drink</option>
                  <option value="food">Food</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button 
                onClick={handleSaveProduct}
                className="w-full bg-tg-button text-tg-button-text py-4 rounded-xl font-bold mt-4 shadow-lg shadow-tg-button/20"
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
