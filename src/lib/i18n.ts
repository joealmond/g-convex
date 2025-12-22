export function useTranslations(_namespace?: string) {
  return (key: string, params?: any) => {
    // Basic mock: return the key or a formatted version
    // In a real app, we'd look up a dictionary.
    if (params) {
        return `${key} ${JSON.stringify(params)}`;
    }
    return key;
  };
}

export function useLocale() {
  return 'en';
}
