import { supabase } from '../lib/supabase';

/**
 * Crops an image file to a square (1:1 aspect ratio) from the center.
 */
export const cropToSquare = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));

        // Center crop
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas to Blob conversion failed'));
        }, 'image/jpeg', 0.9);
      };
      img.onerror = () => reject(new Error('Image load failed'));
    };
    reader.onerror = () => reject(new Error('FileReader failed'));
  });
};

/**
 * Upload a file to Supabase Storage and return the public URL.
 */
export const uploadProductImage = async (file: File, manufacturerId: string): Promise<string> => {
  // Always crop to square first
  const croppedBlob = await cropToSquare(file);
  
  const ext = 'jpg'; // We convert to jpeg in cropToSquare
  const fileName = `${manufacturerId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, croppedBlob, { 
      upsert: true, 
      contentType: 'image/jpeg' 
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

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
