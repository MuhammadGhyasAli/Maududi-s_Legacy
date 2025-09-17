import React, { useState, useRef, useEffect } from 'react';
import LanguageIcon from './icons/LanguageIcon';

interface LanguageSelectorProps {
  languages: string[];
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ languages, selectedLanguage, onSelectLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);


  const handleSelect = (lang: string) => {
    onSelectLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="fixed bottom-24 right-4 md:right-8 z-20">
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up">
          <ul>
            {languages.map(lang => (
              <li key={lang}>
                <button
                  onClick={() => handleSelect(lang)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedLanguage === lang ? 'bg-brand-blue text-white' : 'text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {lang}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-blue text-white rounded-full shadow-lg flex items-center justify-center hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-brand-blue/50 dark:focus:ring-brand-blue/50 transition-all transform hover:scale-110"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <LanguageIcon className="w-7 h-7" />
      </button>
    </div>
  );
};

export default LanguageSelector;