/**
 * Internationalization (i18n) utilities
 */

export type Language = 'en' | 'ar' | 'fr' | 'es';

export const supportedLanguages: Language[] = ['en', 'ar', 'fr', 'es'];

export const defaultLanguage: Language = 'en';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

// Translation dictionary
const translations: Translations = {
  // Navigation
  'nav.home': {
    en: 'Home',
    ar: 'الرئيسية',
    fr: 'Accueil',
    es: 'Inicio',
  },
  'nav.about': {
    en: 'About',
    ar: 'من نحن',
    fr: 'À propos',
    es: 'Acerca de',
  },
  'nav.services': {
    en: 'Services',
    ar: 'الخدمات',
    fr: 'Services',
    es: 'Servicios',
  },
  'nav.chat': {
    en: 'Chat',
    ar: 'محادثة',
    fr: 'Chat',
    es: 'Chat',
  },
  'nav.login': {
    en: 'Login',
    ar: 'تسجيل الدخول',
    fr: 'Connexion',
    es: 'Iniciar sesión',
  },
  'nav.logout': {
    en: 'Logout',
    ar: 'تسجيل الخروج',
    fr: 'Déconnexion',
    es: 'Cerrar sesión',
  },
  // Authentication
  'auth.login': {
    en: 'Login',
    ar: 'تسجيل الدخول',
    fr: 'Connexion',
    es: 'Iniciar sesión',
  },
  'auth.register': {
    en: 'Register',
    ar: 'التسجيل',
    fr: "S'inscrire",
    es: 'Registrarse',
  },
  'auth.password': {
    en: 'Password',
    ar: 'كلمة المرور',
    fr: 'Mot de passe',
    es: 'Contraseña',
  },
  'auth.forgot_password': {
    en: 'Forgot Password?',
    ar: 'نسيت كلمة المرور؟',
    fr: 'Mot de passe oublié?',
    es: '¿Olvidaste tu contraseña?',
  },
  // Common
  'common.submit': {
    en: 'Submit',
    ar: 'إرسال',
    fr: 'Soumettre',
    es: 'Enviar',
  },
  'common.cancel': {
    en: 'Cancel',
    ar: 'إلغاء',
    fr: 'Annuler',
    es: 'Cancelar',
  },
  'common.save': {
    en: 'Save',
    ar: 'حفظ',
    fr: 'Enregistrer',
    es: 'Guardar',
  },
  'common.loading': {
    en: 'Loading...',
    ar: 'جاري التحميل...',
    fr: 'Chargement...',
    es: 'Cargando...',
  },
  'common.error': {
    en: 'An error occurred',
    ar: 'حدث خطأ',
    fr: "Une erreur s'est produite",
    es: 'Ocurrió un error',
  },
};

export function getLanguage(): Language {
  if (typeof window === 'undefined') return defaultLanguage;
  const stored = localStorage.getItem('language') as Language;
  return supportedLanguages.includes(stored) ? stored : defaultLanguage;
}

export function setLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('language', lang);
  // Update HTML lang attribute
  document.documentElement.lang = lang;
  // Update text direction for RTL languages
  if (lang === 'ar') {
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.dir = 'ltr';
  }
}

export function t(key: string, lang?: Language): string {
  const currentLang = lang || getLanguage();
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    value = value?.[k];
    if (!value) break;
  }
  
  return value?.[currentLang] || value?.[defaultLanguage] || key;
}

// Initialize language on load
if (typeof window !== 'undefined') {
  const lang = getLanguage();
  setLanguage(lang);
}

