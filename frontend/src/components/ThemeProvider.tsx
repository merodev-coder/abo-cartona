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

  useEffect(() => {
    const savedStoreTheme = localStorage.getItem('store-theme') as ThemeMode | null;
    if (savedStoreTheme && themeColors[savedStoreTheme]) {
      setStoreThemeState(savedStoreTheme);
      const root = document.documentElement;
      root.setAttribute('data-theme', savedStoreTheme);
      root.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('store-theme', storeTheme);
  }, [storeTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', storeTheme);
    root.classList.add('dark');
  }, [storeTheme]);

  const setStoreTheme = (newTheme: ThemeMode) => {
    setStoreThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{ theme: 'dark', storeTheme, setStoreTheme, storeThemeColor: themeColors[storeTheme] }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
