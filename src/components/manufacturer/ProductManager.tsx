import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../shared/ProductCard';
import { PageHeader } from '../shared/PageHeader';
import { Plus, X, Search, Image as ImageIcon, Loader2, Camera } from 'lucide-react';
import { tg, haptic } from '../../lib/telegram';
import { uploadProductImage, openImagePicker } from '../../lib/storage';
import type { Product } from '../../types';

export const ProductManager: React.FC = () => {
  const { user } = useAuthStore();
  const { products, addProduct, updateProduct } = useProducts(user?.id);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const defaultProduct: Partial<Product> = {
    name: '',
    price: 0,
    category: 'other',
    unit: 'pcs',
    min_order_qty: 1,
    is_active: true,
  };

  const [newProduct, setNewProduct] = useState<Partial<Product>>(defaultProduct);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePickImage = async () => {
    haptic.impact('light');
    try {
      const file = await openImagePicker();
      if (!file) return;

      // Preview locally first
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      setImageFile(file);
    } catch (e: any) {
      tg.showAlert(`Could not select image: ${e.message}`);
    }
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      tg.showAlert('Please provide a product name and price');
      return;
    }

    try {
      setIsSubmitting(true);
      haptic.impact('medium');

      let image_url: string | undefined;

      if (imageFile) {
        setIsUploadingImage(true);
        image_url = await uploadProductImage(imageFile, user!.id);
        setIsUploadingImage(false);
      }

      await addProduct({
        ...newProduct,
        manufacturer_id: user?.id,
        image_url,
      } as any);

      // Reset
      setIsAdding(false);
      setNewProduct(defaultProduct);
      setImagePreview(null);
      setImageFile(null);
      haptic.notification('success');
    } catch (error: any) {
      tg.showAlert(`Error: ${error.message}`);
      setIsUploadingImage(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-tg-bg pb-24">
      <PageHeader
        title="Product Catalog"
        showBack={false}
        rightElement={
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 bg-tg-button text-tg-button-text text-sm font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform shadow-lg shadow-tg-button/20"
          >
            <Plus size={16} />
            Add
          </button>
        }
      />

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
          <input
            type="text"
            placeholder="Search your products..."
            className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-tg-button"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} mode="manager" />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => updateProduct({ id: product.id, is_active: !product.is_active })}
                  className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg"
                >
                  {product.is_active ? 'Archive' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && !isAdding && (
          <div className="text-center py-16 opacity-50">
            <ImageIcon size={40} className="mx-auto mb-3 text-tg-hint" />
            <p className="text-tg-hint">No products yet. Tap "Add" to create one.</p>
          </div>
        )}
      </div>

      {/* Add Product Sheet */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAdding(false)} />
          <div className="relative bg-tg-bg rounded-t-3xl shadow-2xl max-h-[95vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-tg-hint/20 rounded-full mx-auto mt-4 mb-2 shrink-0" />

            {/* Sheet header */}
            <div className="flex justify-between items-center px-6 py-3 border-b border-tg-hint/10 shrink-0">
              <h2 className="text-xl font-black">Add Product</h2>
              <button onClick={() => setIsAdding(false)} className="w-9 h-9 flex items-center justify-center bg-tg-secondary-bg rounded-full text-tg-hint">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5 flex-1">
              {/* Image picker */}
              <div>
                <label className="text-[10px] uppercase font-bold text-tg-hint mb-2 block">Product Photo</label>
                <button
                  onClick={handlePickImage}
                  className="relative w-full aspect-video bg-tg-secondary-bg rounded-2xl border-2 border-dashed border-tg-hint/20 flex flex-col items-center justify-center gap-2 text-tg-hint overflow-hidden active:scale-[0.98] transition-transform"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                          <Camera size={14} />
                          Change Photo
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera size={32} className="opacity-40" />
                      <p className="text-xs font-bold uppercase tracking-wider opacity-60">Tap to Select Photo</p>
                      <p className="text-[10px] opacity-40">From Gallery or Camera</p>
                    </>
                  )}
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol 500mg"
                  className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>

              {/* Price + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">Price ($) *</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                    value={newProduct.price || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">Unit</label>
                  <input
                    type="text"
                    placeholder="box, pcs, bottle"
                    className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">Category</label>
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

              {/* Min order qty */}
              <div>
                <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">Min Order Qty</label>
                <input
                  type="number"
                  placeholder="1"
                  className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                  value={newProduct.min_order_qty || 1}
                  onChange={(e) => setNewProduct({ ...newProduct, min_order_qty: Number(e.target.value) })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">Description (Optional)</label>
                <textarea
                  placeholder="Brief product description..."
                  className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button min-h-[70px] resize-none"
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <button
                onClick={handleSaveProduct}
                disabled={isSubmitting || !newProduct.name || !newProduct.price}
                className="w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-[0.98] transition-transform disabled:opacity-40"
                style={{ background: 'var(--tg-theme-button-color, #2563EB)' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    {isUploadingImage ? (
                      <><Loader2 size={18} className="animate-spin" /> Uploading image...</>
                    ) : (
                      <><Loader2 size={18} className="animate-spin" /> Creating...</>
                    )}
                  </span>
                ) : (
                  'Create Product'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
