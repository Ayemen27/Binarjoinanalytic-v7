import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from './Button';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

const languages: Language[] = [
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr'
  }
];

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle';
  size?: 'sm' | 'md' | 'lg';
  showFlag?: boolean;
  showText?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  size = 'md',
  showFlag = true,
  showText = true,
  className = ''
}) => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLanguage = languages.find(lang => lang.code === router.locale) || languages[0];
  const otherLanguages = languages.filter(lang => lang.code !== router.locale);

  const handleLanguageChange = async (locale: string) => {
    const selectedLang = languages.find(lang => lang.code === locale);
    
    if (selectedLang) {
      // حفظ تفضيل اللغة في localStorage
      localStorage.setItem('preferred-language', locale);
      
      // تحديث اتجاه النص
      document.documentElement.dir = selectedLang.direction;
      document.documentElement.lang = locale;
      
      // تغيير اللغة
      await router.push(router.asPath, router.asPath, { locale });
      
      setIsOpen(false);
    }
  };

  // تحديث اتجاه النص عند تحميل المكون
  React.useEffect(() => {
    document.documentElement.dir = currentLanguage.direction;
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage]);

  if (variant === 'toggle') {
    const otherLang = otherLanguages[0];
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={() => handleLanguageChange(otherLang.code)}
        className={`flex items-center gap-2 ${className}`}
      >
        {showFlag && <span className="text-lg">{otherLang.flag}</span>}
        {showText && (
          <span className="text-sm font-medium">
            {otherLang.nativeName}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        {showFlag && <span className="text-lg">{currentLanguage.flag}</span>}
        {showText && (
          <span className="text-sm font-medium">
            {currentLanguage.nativeName}
          </span>
        )}
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="py-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    language.code === router.locale 
                      ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {language.nativeName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {language.name}
                    </span>
                  </div>
                  {language.code === router.locale && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Hook مساعد لاستخدام معلومات اللغة الحالية
export const useCurrentLanguage = () => {
  const router = useRouter();
  return languages.find(lang => lang.code === router.locale) || languages[0];
};

// Hook لتحديد ما إذا كانت اللغة الحالية RTL
export const useIsRTL = () => {
  const currentLang = useCurrentLanguage();
  return currentLang.direction === 'rtl';
};

export default LanguageSwitcher;