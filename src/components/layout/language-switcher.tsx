'use client';

import { useLocale } from '@/lib/i18n';
// import { useRouter, usePathname } from '@tanstack/react-router'; 
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useState } from 'react';

// Mock routing config
const routing = {
    locales: ['en', 'hu']
};

export default function LocaleSwitcher() {
  const locale = useLocale();
  // const router = useRouter(); 
  // const pathname = usePathname(); // TanStack Router uses useLocation
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (newLocale: string) => {
    // Mock locale change
    console.log("Change locale to", newLocale);
    setIsOpen(false);
  };

  const t = (key: string) => key === 'english' ? 'English' : 'Magyar';

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
        <Globe className="h-5 w-5" />
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg z-50">
          {routing.locales.map((loc) => (
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
