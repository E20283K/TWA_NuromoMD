import { supabase } from '../lib/supabase';

/**
 * Upload a file to Supabase Storage and return the public URL.
 * Uses the native HTML file input (hidden) triggered by a button click.
 */
export const uploadProductImage = async (file: File, manufacturerId: string): Promise<string> => {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${manufacturerId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

/**
 * Trigger native Telegram image picker using WebApp.showScanQrPopup is not available,
 * so we use the hidden HTML file input trick which opens the native gallery on mobile.
 */
export const openImagePicker = (): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // opens camera; omit for gallery-only
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      document.body.removeChild(input);
      resolve(file);
    };

    input.oncancel = () => {
      document.body.removeChild(input);
      resolve(null);
    };

    input.click();
  });
};
