
export interface Translations {
  [key: string]: string | NestedTranslations;
}

export interface NestedTranslations {
  [key: string]: string | NestedTranslations;
}

export interface DomainTranslations {
  common: Translations;
  auth: Translations;
  dashboard: Translations;
  nutrition: Translations;
  workout: Translations;
  progress: Translations;
  profile: Translations;
  settings: Translations;
}
