export const UPDATE_ID = '2026-05-06-pr-fix-splash-updates';
export const STORAGE_KEY = 'axenro-last-seen-update';

export const getUpdateContent = (language: string) => {
  const isDutch = language === 'dutch';
  return {
    title: isDutch ? "Wat is er nieuw" : "What's new",
    subtitle: isDutch
      ? 'Axenro is bijgewerkt met deze verbeteringen:'
      : 'Axenro has been updated with these improvements:',
    cta: isDutch ? 'Aan de slag' : 'Continue',
    items: isDutch
      ? [
          'Persoonlijk record markeert nu alleen het écht beste setje (hoogste gewicht × reps).',
          'Statistieken tonen nu de eerste prestatie i.p.v. het gemiddelde.',
          'Nieuwe sets bij workouts zijn niet meer per ongeluk gekoppeld aan de vorige set.',
          'Updates verschijnen voortaan op het opstartscherm zelf.',
        ]
      : [
          'Personal record now marks only the true best set (highest weight × reps).',
          'Statistics now show your first performance instead of the average.',
          'New sets in workouts are no longer accidentally linked to the previous set.',
          'Update notes now appear on the splash screen itself.',
        ],
  };
};
