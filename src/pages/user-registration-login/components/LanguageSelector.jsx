import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const LanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  useEffect(() => {
    const savedLanguage = localStorage.getItem('medchain_language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const handleLanguageChange = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('medchain_language', languageCode);
    setIsOpen(false);
  };

  const currentLang = languages?.find(lang => lang?.code === currentLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-medical hover:bg-muted"
      >
        <span className="text-base">{currentLang?.flag}</span>
        <span className="hidden sm:inline">{currentLang?.name}</span>
        <Icon name="ChevronDown" size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-40 bg-popover border border-border rounded-medical shadow-medical-lg z-dropdown">
          <div className="py-1">
            {languages?.map((language) => (
              <button
                key={language?.code}
                onClick={() => handleLanguageChange(language?.code)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm hover:bg-muted transition-colors duration-200 ${
                  currentLanguage === language?.code ? 'bg-primary/10 text-primary' : 'text-popover-foreground'
                }`}
              >
                <span className="text-base">{language?.flag}</span>
                <span>{language?.name}</span>
                {currentLanguage === language?.code && (
                  <Icon name="Check" size={14} className="ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;