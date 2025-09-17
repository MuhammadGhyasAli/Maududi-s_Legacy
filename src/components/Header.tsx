import React, { useState } from 'react';
import BookOpenIcon from './icons/BookOpenIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import Logo from "/logo.png";

import SystemIcon from './icons/SystemIcon';
import SparklesIcon from './icons/SparklesIcon';
import { Theme } from '../App';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onOpenContextFinder: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, onOpenContextFinder }) => {
  const [logoError, setLogoError] = useState(false);

  const handleThemeChange = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const themeIcons: Record<Theme, React.ReactNode> = {
    light: <SunIcon className="w-6 h-6" />,
    dark: <MoonIcon className="w-6 h-6" />,
    system: <SystemIcon className="w-6 h-6" />,
  };

  return (
    <header className="bg-brand-bg-light/80 dark:bg-brand-bg-dark/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {logoError ? (
          <BookOpenIcon className="w-28 h-15 text-gray-800 dark:text-gray-200" />
        ) : (
           <img src={Logo} alt="Maududi's legacy logo" className="w-28 h-15 text-gray-800 dark:text-gray-200" />
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenContextFinder}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Open AI Context Finder"
          >
            <SparklesIcon className="w-6 h-6" />
          </button>
          <button
            onClick={handleThemeChange}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
          >
            {themeIcons[theme]}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
