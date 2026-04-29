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

    if (location.pathname !== '/') {
      tg.BackButton.show();
      tg.BackButton.onClick(handleBack);
    } else {
      tg.BackButton.hide();
    }

    return () => {
      tg.BackButton.offClick(handleBack);
    };
  }, [location.pathname, navigate]);

  return null;
};
