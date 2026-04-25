export interface Country {
  name: string;
  slug: string;
  flag: string;
  isActive: boolean;
}

export interface RegionGroup {
  label: string;
  icon: string;
  slug: string;
  countries: Country[];
}

export const SCHENGEN_COUNTRIES: Country[] = [
  { name: 'Germany', slug: 'germany', flag: '🇩🇪', isActive: true },
  { name: 'Austria', slug: 'austria', flag: '🇦🇹', isActive: true },
  { name: 'Belgium', slug: 'belgium', flag: '🇧🇪', isActive: true },
  { name: 'Bulgaria', slug: 'bulgaria', flag: '🇧🇬', isActive: true },
  { name: 'Croatia', slug: 'croatia', flag: '🇭🇷', isActive: true },
  { name: 'Czech Republic', slug: 'czech-republic', flag: '🇨🇿', isActive: true },
  { name: 'Denmark', slug: 'denmark', flag: '🇩🇰', isActive: true },
  { name: 'Estonia', slug: 'estonia', flag: '🇪🇪', isActive: true },
  { name: 'Finland', slug: 'finland', flag: '🇫🇮', isActive: true },
  { name: 'France', slug: 'france', flag: '🇫🇷', isActive: true },
  { name: 'Greece', slug: 'greece', flag: '🇬🇷', isActive: true },
  { name: 'Hungary', slug: 'hungary', flag: '🇭🇺', isActive: true },
  { name: 'Iceland', slug: 'iceland', flag: '🇮🇸', isActive: true },
  { name: 'Italy', slug: 'italy', flag: '🇮🇹', isActive: true },
  { name: 'Latvia', slug: 'latvia', flag: '🇱🇻', isActive: true },
  { name: 'Liechtenstein', slug: 'liechtenstein', flag: '🇱🇮', isActive: true },
  { name: 'Lithuania', slug: 'lithuania', flag: '🇱🇹', isActive: true },
  { name: 'Luxembourg', slug: 'luxembourg', flag: '🇱🇺', isActive: true },
  { name: 'Malta', slug: 'malta', flag: '🇲🇹', isActive: true },
  { name: 'Netherlands', slug: 'netherlands', flag: '🇳🇱', isActive: true },
  { name: 'Norway', slug: 'norway', flag: '🇳🇴', isActive: true },
  { name: 'Poland', slug: 'poland', flag: '🇵🇱', isActive: true },
  { name: 'Portugal', slug: 'portugal', flag: '🇵🇹', isActive: true },
  { name: 'Romania', slug: 'romania', flag: '🇷🇴', isActive: true },
  { name: 'Slovakia', slug: 'slovakia', flag: '🇸🇰', isActive: true },
  { name: 'Slovenia', slug: 'slovenia', flag: '🇸🇮', isActive: true },
  { name: 'Spain', slug: 'spain', flag: '🇪🇸', isActive: true },
  { name: 'Sweden', slug: 'sweden', flag: '🇸🇪', isActive: true },
  { name: 'Switzerland', slug: 'switzerland', flag: '🇨🇭', isActive: true },
];

export const UK_COUNTRIES: Country[] = [
  { name: 'England', slug: 'uk',    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', isActive: true },
  { name: 'Wales',   slug: 'wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', isActive: true },
];

export const OCEANIA_COUNTRIES: Country[] = [
  { name: 'Australia',    slug: 'australia',    flag: '🇦🇺', isActive: true },
  { name: 'New Zealand',  slug: 'new-zealand',  flag: '🇳🇿', isActive: true },
];

export const ASIA_COUNTRIES: Country[] = [
  { name: 'Malaysia',    slug: 'malaysia',     flag: '🇲🇾', isActive: true },
  { name: 'Japan',       slug: 'japan',        flag: '🇯🇵', isActive: true },
  { name: 'South Korea', slug: 'south-korea',  flag: '🇰🇷', isActive: true },
];

export const REGION_GROUPS: RegionGroup[] = [
  {
    label: 'Europe (Schengen)',
    icon: '🇪🇺',
    slug: 'schengen',
    countries: SCHENGEN_COUNTRIES,
  },
  {
    label: 'United Kingdom',
    icon: '🇬🇧',
    slug: 'uk-group',
    countries: UK_COUNTRIES,
  },
  {
    label: 'Ireland',
    icon: '🇮🇪',
    slug: 'ireland',
    countries: [{ name: 'Ireland', slug: 'ireland', flag: '🇮🇪', isActive: true }],
  },
  {
    label: 'United States',
    icon: '🇺🇸',
    slug: 'usa',
    countries: [{ name: 'United States', slug: 'usa', flag: '🇺🇸', isActive: true }],
  },
  {
    label: 'Oceania',
    icon: '🌏',
    slug: 'oceania',
    countries: OCEANIA_COUNTRIES,
  },
  {
    label: 'Asia',
    icon: '🌏',
    slug: 'asia',
    countries: ASIA_COUNTRIES,
  },
];
