'use client';

import { Globe } from 'lucide-react';
import { useState } from 'react';
import { getLocales, setLocale, useLocale, useTranslations  } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('LanguageSwitcher');
  const locales = getLocales();

  const handleChange = (newLocale: 'en' | 'hu') => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
        <Globe className="h-5 w-5" />
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg z-50">
          {locales.map((loc) => (
            <Button
              key={loc}
              variant={locale === loc ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => handleChange(loc)}
            >
              {loc === 'en' ? t('english') : t('hungarian')}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
