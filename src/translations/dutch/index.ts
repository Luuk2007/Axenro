
import { commonTranslations } from './common';
import { authTranslations } from './auth';
import { dashboardTranslations } from './dashboard';
import { nutritionTranslations } from './nutrition';
import { workoutTranslations } from './workout';
import { progressTranslations } from './progress';
import { profileTranslations } from './profile';
import { settingsTranslations } from './settings';
import { DomainTranslations, Translations } from '../types';

// Combine all domain-specific translations into a single object
const domainTranslations: DomainTranslations = {
  common: commonTranslations,
  auth: authTranslations,
  dashboard: dashboardTranslations,
  nutrition: nutritionTranslations,
  workout: workoutTranslations,
  progress: progressTranslations,
  profile: profileTranslations,
  settings: settingsTranslations
};

// Flatten the translations for backward compatibility
export const dutch: Translations = Object.entries(domainTranslations).reduce(
  (acc, [_domain, translations]) => {
    return { ...acc, ...translations };
  },
  {}
);
