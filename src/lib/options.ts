'use client';

import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import ISO6391 from 'iso-639-1';

// Register English locale for country names
countries.registerLocale(enLocale as any);

// Full list of country names (official English names), sorted alphabetically
export const COUNTRIES: string[] = Object.values(
  countries.getNames('en', { select: 'official' })
).sort();

// Full list of language names (ISO-639-1), sorted alphabetically
export const LANGUAGES: string[] = ISO6391.getAllNames().sort();

