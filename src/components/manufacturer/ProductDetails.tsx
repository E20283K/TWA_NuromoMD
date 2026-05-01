import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useAuthStore } from '../../store/authStore';
import { PageHeader } from '../shared/PageHeader';
import { Trash2, Camera, Loader2, Save } from 'lucide-react';
import { tg, haptic } from '../../lib/telegram';
import { uploadProductImage, openImagePicker } from '../../lib/storage';
import { useTranslation } from '../../lib/i18n';
import type { Product } from '../../types';

export const ManufacturerProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { products, updateProduct, deleteProduct, isLoading } = useProducts(user?.id);

  const product = products.find(p => p.id === id);
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (product) {
      setEditedProduct(product);
      setImagePreview(product.image_url || null);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tg-bg">
        <div className="h-14 bg-tg-secondary-bg animate-pulse" />
        <div className="p-4 space-y-4 animate-pulse">
          <div className="aspect-video bg-tg-secondary-bg rounded-2xl" />
          <div className="h-10 bg-tg-secondary-bg rounded-lg" />
          <div className="h-24 bg-tg-secondary-bg rounded-lg" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-tg-bg">
        <h2 className="text-xl font-bold mb-2">{t('productNotFound')}</h2>
        <button onClick={() => navigate(-1)} className="bg-tg-button text-tg-button-text px-6 py-2 rounded-lg font-bold">
          {t('goBack')}
        </button>
      </div>
    );
  }

  const handlePickImage = async () => {
    haptic.impact('light');
    try {
      const file = await openImagePicker();
      if (!file) return;
      setImagePreview(URL.createObjectURL(file));
      setImageFile(file);
    } catch (e: any) {
      tg.showAlert(`${t('error')}: ${e.message}`);
    }
  };

  const handleDelete = () => {
    haptic.impact('heavy');
    tg.showConfirm(`${t('deleteConfirm')} "${product.name}"?`, async (ok) => {
      if (ok) {
        try {
          await deleteProduct(product.id);
          haptic.notification('success');
          navigate(-1);
        } catch (error: any) {
          tg.showAlert(`${t('error')}: ${error.message}`);
        }
      }
    });
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      haptic.impact('medium');

      let image_url = editedProduct.image_url;

      if (imageFile) {
        image_url = await uploadProductImage(imageFile, user!.id);
      }

      await updateProduct({
        ...editedProduct,
        id: product.id,
        image_url,
      } as any);

      haptic.notification('success');
      tg.showAlert(t('productUpdated'));
    } catch (error: any) {
      tg.showAlert(`${t('error')}: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-tg-bg pb-32">
      <PageHeader 
        title={t('editProduct')} 
        rightElement={
          <button onClick={handleDelete} className="p-2 text-red-500 bg-red-500/10 rounded-xl active:scale-90 transition-transform">
            <Trash2 size={20} />
          </button>
        }
      />

      <div className="p-4 space-y-6">
        <div 
          onClick={handlePickImage}
          className="relative aspect-video bg-tg-secondary-bg rounded-2xl overflow-hidden border-2 border-dashed border-tg-hint/20 flex items-center justify-center group cursor-pointer"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Camera size={32} className="text-tg-hint opacity-40" />
              <p className="text-[10px] uppercase font-bold text-tg-hint">{t('tapToSelect')}</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
            {t('tapToSelect')}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">{t('productName')}</label>
            <input
              type="text"
              className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
              value={editedProduct.name || ''}
              placeholder={t('productNamePlaceholder')}
              onChange={e => setEditedProduct({ ...editedProduct, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">{t('price')} ($)</label>
              <input
                type="number"
                className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                value={editedProduct.price || ''}
                placeholder={t('pricePlaceholder')}
                onChange={e => setEditedProduct({ ...editedProduct, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">{t('unit')}</label>
              <input
                type="text"
                className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                value={editedProduct.unit || ''}
                placeholder={t('unitPlaceholder')}
                onChange={e => setEditedProduct({ ...editedProduct, unit: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">{t('category')}</label>
            <select
              className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
              value={editedProduct.category}
              onChange={e => setEditedProduct({ ...editedProduct, category: e.target.value as any })}
            >
              <option value="medicine">{t('medicine')}</option>
              <option value="drink">{t('drink')}</option>
              <option value="food">{t('food')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">{t('minOrderQty')}</label>
            <input
              type="number"
              className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
              value={editedProduct.min_order_qty || 1}
              onChange={e => setEditedProduct({ ...editedProduct, min_order_qty: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">{t('description')}</label>
            <textarea
              className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button min-h-[100px] resize-none"
              value={editedProduct.description || ''}
              placeholder={t('descriptionPlaceholder')}
              onChange={e => setEditedProduct({ ...editedProduct, description: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-tg-bg/80 backdrop-blur-md border-t border-tg-hint/10 z-40 pb-safe">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full bg-tg-button text-tg-button-text py-4 rounded-xl font-bold shadow-lg shadow-tg-button/20 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {t('saveChanges')}
        </button>
      </div>
    </div>
  );
};
