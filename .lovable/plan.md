

# Translation Overhaul Plan

## Problem
Multiple pages have untranslated or incorrectly translated strings:
1. **"Back" ambiguity**: `t("Back")` returns "Rug" (muscle group) everywhere, including navigation contexts where it should be "Terug"
2. **AI Meal Analyzer**: ~10 new strings (photo tips, mode selection) have no Dutch translations
3. **Challenges page**: Challenge titles/descriptions are hardcoded in Dutch in `DEFAULT_CHALLENGES` - need English versions. Also hardcoded "Start" (line 256) and "streak" (line 335) not using `t()`
4. **Missing `goBack` in English**: exists in Dutch settings but not in `english.ts`

## Plan

### 1. Fix "Back" vs "Terug" disambiguation
- In `AIMealAnalyzer.tsx` line 342: change `t("Back")` to `t("goBack")`
- Add `"goBack": "Go back"` to `english.ts`
- `goBack: "Terug"` already exists in Dutch settings - confirm it's in the flattened output

### 2. Add missing Dutch translations for AI Meal Analyzer
Add to `src/translations/dutch/nutrition.ts`:
- `"Choose how you want to analyze your meal"` → `"Kies hoe je je maaltijd wilt analyseren"`
- `"Describe with text"` → `"Beschrijf met tekst"`
- `"Type what you ate for AI analysis"` → `"Typ wat je hebt gegeten voor AI-analyse"`
- `"Analyze with photo"` → `"Analyseer met foto"`
- `"Take a photo or upload an image of your meal"` → `"Maak een foto of upload een afbeelding van je maaltijd"`
- `"Photo Meal Analyzer"` → `"Foto Maaltijdanalyse"`
- `"Take a photo of your meal for AI-powered nutritional analysis"` → `"Maak een foto van je maaltijd voor AI-gestuurde voedingsanalyse"`
- `"Tips for best results"` → `"Tips voor het beste resultaat"`
- `"Separate foods on your plate so each is clearly visible"` → `"Scheid voedsel op je bord zodat alles duidelijk zichtbaar is"`
- `"Take the photo from above for the best overview"` → `"Maak de foto van bovenaf voor het beste overzicht"`
- `"Make sure there's good lighting"` → `"Zorg voor goede verlichting"`
- `"Include a fork or knife for size reference"` → `"Leg een vork of mes erbij als maatverwijzing"`
- `"Take photo"` → `"Foto maken"`
- `"Upload photo"` → `"Foto uploaden"`
- `"Optional: add details about what's on the photo"` → `"Optioneel: voeg details toe over wat er op de foto staat"`

Also add all these as English keys in `english.ts`.

### 3. Make Challenge titles/descriptions translatable
- Add translation keys for each challenge title and description (e.g., `chTitle_pushup30`, `chDesc_pushup30`)
- Update `DEFAULT_CHALLENGES` in `useChallenges.ts` to use translation key references
- Add English translations for all challenge titles/descriptions
- Add Dutch translations in `challenges.ts`
- Fix hardcoded "Start" (line 256) → `t('chStartChallenge')` (already exists)
- Fix hardcoded "streak" (line 335) → add `chStreak` translation key

### 4. Scan remaining pages for hardcoded strings
- Check all pages for any remaining untranslated UI text
- Ensure consistency across the app

### Files to edit
- `src/translations/english.ts` — add ~30 new keys
- `src/translations/dutch/nutrition.ts` — add ~15 AI photo mode translations
- `src/translations/dutch/challenges.ts` — add challenge titles, descriptions, streak
- `src/hooks/useChallenges.ts` — use translation keys for challenge content
- `src/pages/Challenges.tsx` — fix hardcoded "Start" and "streak"
- `src/components/nutrition/AIMealAnalyzer.tsx` — change `t("Back")` to `t("goBack")`

