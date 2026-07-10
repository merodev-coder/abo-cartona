'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeMode } from '@/types';

type Theme = 'dark'; // Only dark mode allowed

interface ThemeContextType {
  theme: Theme;
  storeTheme: ThemeMode;
  setStoreTheme: (theme: ThemeMode) => void;
  storeThemeColor: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  storeTheme: 'normal',
  setStoreTheme: () => {},
  storeThemeColor: '#37D7AC',
});

const themeColors: Record<ThemeMode, string> = {
  normal: '#37D7AC',
  ramadan: '#F59E0B',
  eid: '#10B981',
  christmas: '#EF4444',
};

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [storeTheme, setStoreThemeState] = useState<ThemeMode>('normal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedStoreTheme = localStorage.getItem('store-theme') as ThemeMode | null;

    if (savedStoreTheme && themeColors[savedStoreTheme]) {
      setStoreThemeState(savedStoreTheme);
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute('data-theme', storeTheme);
    root.classList.add('dark');
    localStorage.setItem('store-theme', storeTheme);
  }, [storeTheme, mounted]);

  const setStoreTheme = (newTheme: ThemeMode) => {
    setStoreThemeState(newTheme);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: 'dark',
        storeTheme,
        setStoreTheme,
        storeThemeColor: themeColors[storeTheme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
