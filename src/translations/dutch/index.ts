
import { commonTranslations } from './common';
import { authTranslations } from './auth';
import { dashboardTranslations } from './dashboard';
import { nutritionTranslations } from './nutrition';
import { workoutTranslations } from './workout';
import { progressTranslations } from './progress';
import { profileTranslations } from './profile';
import { settingsTranslations } from './settings';
import { aiTranslations } from './ai';
import { challengeTranslations } from './challenges';
import { DomainTranslations, Translations } from '../types';

// Combine all domain-specific translations into a single object
const domainTranslations: DomainTranslations & { ai: Translations; challenges: Translations } = {
  common: commonTranslations,
  auth: authTranslations,
  dashboard: dashboardTranslations,
  nutrition: nutritionTranslations,
  workout: workoutTranslations,
  progress: progressTranslations,
  profile: profileTranslations,
  settings: settingsTranslations,
  ai: aiTranslations,
  challenges: challengeTranslations,
};

// Flatten the translations for backward compatibility
export const dutch: Translations = Object.entries(domainTranslations).reduce(
  (acc, [_domain, translations]) => {
    return { ...acc, ...translations };
  },
  {}
);
