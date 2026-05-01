import WebApp from '@twa-dev/sdk';

export const tg = WebApp;

export const initTWA = () => {
  // Only call SDK methods if they exist (prevents crash in regular browsers)
  if (typeof tg.ready === 'function') tg.ready();
  if (typeof tg.expand === 'function') tg.expand();
  if (typeof tg.requestFullscreen === 'function') {
    try { tg.requestFullscreen(); } catch (e) {}
  }
  
  // Apply theme colors to body with safety check
  if (tg.themeParams && tg.themeParams.bg_color) {
    document.body.style.backgroundColor = tg.themeParams.bg_color;
  }
  if (tg.themeParams && tg.themeParams.text_color) {
    document.body.style.color = tg.themeParams.text_color;
  }
};

export const haptic = {
  impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    if (tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
      tg.HapticFeedback.impactOccurred(style);
    }
  },
  notification: (type: 'error' | 'success' | 'warning') => {
    if (tg.HapticFeedback && typeof tg.HapticFeedback.notificationOccurred === 'function') {
      tg.HapticFeedback.notificationOccurred(type);
    }
  },
  selection: () => {
    if (tg.HapticFeedback && typeof tg.HapticFeedback.selectionChanged === 'function') {
      tg.HapticFeedback.selectionChanged();
    }
  }
};

export const showMainButton = (text: string, onClick: () => void) => {
  if (tg && tg.MainButton) {
    try {
      tg.MainButton.setText(text);
      tg.MainButton.onClick(onClick);
      tg.MainButton.show();
    } catch (e) {
      console.error('Error showing MainButton', e);
    }
  }
};

export const hideMainButton = () => {
  if (tg && tg.MainButton) {
    try {
      tg.MainButton.hide();
    } catch (e) {
      console.error('Error hiding MainButton', e);
    }
  }
};

export const showBackButton = (onClick: () => void) => {
  if (tg && tg.BackButton) {
    try {
      tg.BackButton.onClick(onClick);
      tg.BackButton.show();
    } catch (e) {
      console.error('Error showing BackButton', e);
    }
  }
};

export const hideBackButton = () => {
  if (tg && tg.BackButton) {
    try {
      tg.BackButton.hide();
    } catch (e) {
      console.error('Error hiding BackButton', e);
    }
  }
};
