'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

const LanguageSelector: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'en', name: t('languageSelector.english') },
    { code: 'si', name: t('languageSelector.sinhala') },
    { code: 'ta', name: t('languageSelector.tamil') }
  ];

  const changeLanguage = (locale: string) => {
    // Store the language preference in localStorage
    localStorage.setItem('language', locale);
    
    // Redirect to the same page with the new locale
    const path = window.location.pathname;
    const newPath = path.startsWith(`/${locale}`) ? path : `/${locale}${path}`;
    router.push(newPath);
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm font-medium text-gray-300 hover:text-white"
      >
        <span>{t('languageSelector.language')}</span>
        <svg 
          className="ml-1 h-5 w-5" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
