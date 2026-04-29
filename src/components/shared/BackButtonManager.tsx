import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { tg } from '../../lib/telegram';

export const BackButtonManager: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleBack = () => {
      navigate(-1);
    };

    if (tg && tg.BackButton) {
      if (location.pathname !== '/') {
        try {
          tg.BackButton.show();
          tg.BackButton.onClick(handleBack);
        } catch (e) {
          console.error("Error showing back button", e);
        }
      } else {
        try {
          tg.BackButton.hide();
        } catch (e) {
          console.error("Error hiding back button", e);
        }
      }
    }

    return () => {
      if (tg && tg.BackButton) {
        try {
          tg.BackButton.offClick(handleBack);
        } catch (e) {
          console.error("Error removing back button click", e);
        }
      }
    };
  }, [location.pathname, navigate]);

  return null;
};
