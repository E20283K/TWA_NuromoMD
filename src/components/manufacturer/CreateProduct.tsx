import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useProducts } from '../../hooks/useProducts';
import { PageHeader } from '../shared/PageHeader';
import { Camera, Loader2, Plus } from 'lucide-react';
import { tg, haptic } from '../../lib/telegram';
import { uploadProductImage, openImagePicker } from '../../lib/storage';
import { useTranslation } from '../../lib/i18n';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';

export const CreateProduct: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addProduct } = useProducts(user?.id);
  
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

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      tg.showAlert(t('error'));
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

      haptic.notification('success');
      navigate(-1);
    } catch (error: any) {
      tg.showAlert(`${t('error')}: ${error.message}`);
      setIsUploadingImage(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-tg-bg pb-32">
      <PageHeader title={t('addProduct')} />

      <div className="p-4 space-y-6">
        {/* Image Picker */}
        <div 
          onClick={handlePickImage}
          className="relative aspect-video bg-tg-secondary-bg rounded-2xl border-2 border-dashed border-tg-hint/20 flex flex-col items-center justify-center gap-2 text-tg-hint overflow-hidden active:scale-[0.98] transition-transform"
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Camera size={14} />
                  {t('tapToSelect')}
                </div>
              </div>
            </>
          ) : (
            <>
              <Camera size={32} className="opacity-40" />
              <p className="text-xs font-bold uppercase tracking-wider opacity-60">{t('tapToSelect')}</p>
              <p className="text-[10px] opacity-40">{t('fromGallery')}</p>
            </>
          )}
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">{t('productName')} *</label>
            <input
              type="text"
              placeholder={t('productNamePlaceholder')}
              className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">{t('price')} ($) *</label>
              <input
                type="number"
                placeholder={t('pricePlaceholder')}
                className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                value={newProduct.price || ''}
                onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">{t('unit')}</label>
              <input
                type="text"
                placeholder={t('unitPlaceholder')}
                className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">{t('category')}</label>
            <select
              className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
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
              placeholder="1"
              className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button"
              value={newProduct.min_order_qty || 1}
              onChange={(e) => setNewProduct({ ...newProduct, min_order_qty: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-tg-hint ml-1 mb-1 block">{t('description')}</label>
            <textarea
              placeholder={t('descriptionPlaceholder')}
              className="w-full bg-tg-secondary-bg border border-tg-hint/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-tg-button min-h-[100px] resize-none"
              value={newProduct.description || ''}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-tg-bg/80 backdrop-blur-md border-t border-tg-hint/10 z-40">
        <button
          onClick={handleSaveProduct}
          disabled={isSubmitting || !newProduct.name || !newProduct.price}
          className="w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-[0.98] transition-transform disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: 'var(--tg-theme-button-color, #2563EB)' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {isUploadingImage ? t('uploadingImage') : t('creating')}
            </>
          ) : (
            <>
              <Plus size={20} />
              {t('createProduct')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
