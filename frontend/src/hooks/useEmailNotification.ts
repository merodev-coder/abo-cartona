'use client';

import { useState, useCallback } from 'react';

interface UseEmailNotificationReturn {
  isVisible: boolean;
  variant: 'friendly' | 'formal' | 'tactical';
  showEmailNotification: (variant?: 'friendly' | 'formal' | 'tactical') => void;
  hideEmailNotification: () => void;
}

export function useEmailNotification(): UseEmailNotificationReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [variant, setVariant] = useState<'friendly' | 'formal' | 'tactical'>('friendly');

  const showEmailNotification = useCallback((newVariant: 'friendly' | 'formal' | 'tactical' = 'friendly') => {
    setVariant(newVariant);
    setIsVisible(true);
  }, []);

  const hideEmailNotification = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    variant,
    showEmailNotification,
    hideEmailNotification
  };
}
