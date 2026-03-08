

## Plan: Heatmap Lichaam Volledig Opnieuw Ontwerpen

Het probleem is duidelijk: de huidige SVG paths zijn slecht geproportioneerd en zien er niet uit als de referentieafbeeldingen. De referentie toont een **clean, atletisch mannequin** met:

- Brede schouders, smalle taille (V-taper)
- Duidelijk gescheiden spiergroepen als aparte gekleurde vlakken
- Lichtgrijze basis body met witte scheidingslijnen tussen spiergroepen
- Anatomisch correcte verhoudingen (hoofd ~1/8 van lichaamslengte)
- Spiergroepen die het lichaam volledig bedekken (geen gaten)

### Wat er fout is nu

1. **Proporties zijn verkeerd** - te smalle schouders, verkeerde lengteverhoudingen
2. **Gaten tussen spiergroepen** - de vlakken sluiten niet goed aan
3. **Te kleine/dunne armen en benen** - ziet er niet atletisch uit
4. **Abs zijn losse blokjes** in plaats van een aaneengesloten buikspiergebied

### Aanpak

**File: `src/components/progress/BodyHeatmapSVG.tsx`** — Volledig herschrijven

De SVG wordt opnieuw opgebouwd met een groter viewBox (bijv. `0 0 600 1000`) voor meer detail:

1. **Body base silhouette** — Eén groot grijs silhouet als achtergrond (hoofd, nek, torso, armen, benen, voeten), zodat er geen gaten ontstaan
2. **Spiergroep overlays** — Bovenop de base silhouette komen de gekleurde spiergroep-paden die naadloos aansluiten:
   - **Front**: shoulders (brede deltoid caps), chest (twee grote pectoralis-vlakken), biceps (voorkant bovenarmen), abs (één groot vlak met interne lijnen voor 6-pack effect), quads (grote bovenbeen-vlakken)
   - **Back**: shoulders (zelfde), back (groot traps+lats vlak), triceps (achterkant bovenarmen), glutes (twee ronde bilspier-vlakken), hamstrings (achterkant bovenbenen), calves (kuitspieren)
3. **Anatomische details** — Witte lijnen voor spiergroep-scheiding, subtiele interne lijnen (abs-grid, spine, schouderbladen)
4. **Proportie-referentie** uit de afbeeldingen:
   - Schouders ~60% van totale breedte
   - Taille ~40% van schouderbreedte  
   - Bovenbenen breed en atletisch
   - Armen met duidelijke spiermassa

**File: `src/components/progress/MuscleAnalysis.tsx`** — Geen grote wijzigingen nodig, de dashboard-layout en logica werken. Alleen kleine fixes als de heatmap component interface wijzigt.

### Technische details

- ViewBox: `0 0 600 1000` voor meer precisie in de paths
- Elke spiergroep: één of twee `<path>` elementen (links + rechts) met `fill={c('muscle')}` en `onClick`
- Base body: meerdere `<path>` elementen in neutraal grijs die NIET klikbaar zijn
- Spiergroep-paths moeten de body-base volledig overlappen zodat er geen grijze gaten zichtbaar zijn tussen gekleurde gebieden
- Stroke: witte lijnen (`rgba(255,255,255,0.6)`) tussen spiergroepen voor definitie

