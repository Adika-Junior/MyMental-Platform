'use client';

import { useState, useEffect } from 'react';
import { getLanguage, setLanguage, supportedLanguages, Language, t } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>(getLanguage());

  useEffect(() => {
    setCurrentLang(getLanguage());
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCurrentLang(lang);
    // Reload page to apply language changes
    window.location.reload();
  };

  const languageNames: Record<Language, string> = {
    en: 'English',
    ar: 'العربية',
    fr: 'Français',
    es: 'Español',
  };

  return (
    <div className="relative inline-block">
      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value as Language)}
        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Select language"
      >
        {supportedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {languageNames[lang]}
          </option>
        ))}
      </select>
    </div>
  );
}

