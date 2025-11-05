'use client';

import { useState, useEffect } from 'react';
import { getLanguage, setLanguage, Language, t } from '@/lib/i18n';

export function useTranslation() {
  const [lang, setLangState] = useState<Language>(getLanguage());

  useEffect(() => {
    const currentLang = getLanguage();
    setLangState(currentLang);
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang);
    setLangState(newLang);
  };

  const translate = (key: string) => t(key, lang);

  return {
    t: translate,
    language: lang,
    setLanguage: changeLanguage,
  };
}

