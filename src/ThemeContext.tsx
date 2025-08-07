import { createContext, useContext } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export const darkThemeClasses = {
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    tertiary: 'text-gray-400',
    interactive: 'text-gray-300 hover:text-white',
  },
  bg: {
    primary: 'bg-gray-900',
    secondary: 'bg-gray-800',
    interactive: 'bg-gray-700 hover:bg-gray-600',
  },
  border: 'border-gray-700',
};

export const lightThemeClasses = {
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500',
    interactive: 'text-gray-600 hover:text-gray-800',
  },
  bg: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    interactive: 'bg-gray-100 hover:bg-gray-200',
  },
  border: 'border-gray-200',
};
