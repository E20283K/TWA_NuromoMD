import WebApp from '@twa-dev/sdk';

export const tg = WebApp;

export const initTWA = () => {
  // Only call SDK methods if they exist (prevents crash in regular browsers)
  if (typeof tg.ready === 'function') tg.ready();
  if (typeof tg.expand === 'function') tg.expand();
  
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
  tg.MainButton.setText(text);
  tg.MainButton.onClick(onClick);
  tg.MainButton.show();
};

export const hideMainButton = () => {
  tg.MainButton.hide();
};

export const showBackButton = (onClick: () => void) => {
  tg.BackButton.onClick(onClick);
  tg.BackButton.show();
};

export const hideBackButton = () => {
  tg.BackButton.hide();
};
