
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
import { communityTranslations } from './community';
import { DomainTranslations, Translations } from '../types';

// Combine all domain-specific translations into a single object
const domainTranslations: DomainTranslations & { ai: Translations; challenges: Translations; community: Translations } = {
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
  community: communityTranslations,
};

// Flatten the translations for backward compatibility
export const dutch: Translations = Object.entries(domainTranslations).reduce(
  (acc, [_domain, translations]) => {
    return { ...acc, ...translations };
  },
  {}
);
