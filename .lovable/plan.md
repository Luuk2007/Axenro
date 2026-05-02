# Community Pagina Plan

## Wat we bouwen
Een nieuwe `/community` pagina waar gebruikers vrienden kunnen toevoegen via username of QR code, vriendverzoeken accepteren/weigeren, leaderboards bekijken (PRs per oefening + activiteit), en workouts delen (direct of via feed).

## Database (nieuwe tabellen)

**`user_profiles` uitbreiden** met `username` (unique, lowercase, 3-20 chars) en `friend_code` (auto-gegenereerde UUID gebruikt voor QR).

**`friendships`** — bevriendingen
- `id`, `requester_id`, `addressee_id`, `status` ('pending'|'accepted'|'declined'), `created_at`, `updated_at`
- Unique constraint op (requester_id, addressee_id)
- RLS: beide partijen kunnen zien; alleen requester insert; addressee update status

**`shared_workouts`** — gedeelde workouts
- `id`, `sender_id`, `recipient_id` (nullable = feed post), `workout_data` (jsonb), `message`, `created_at`, `is_public_to_friends` (bool)
- RLS: sender ziet eigen, recipient ziet directe shares, vrienden zien feed posts

**`workout_feed_likes`** — likes op feed posts
- `id`, `shared_workout_id`, `user_id`, `created_at`

**Helper functies (SECURITY DEFINER)**:
- `are_friends(user_a, user_b)` — checkt of twee users bevriend zijn
- `get_friend_ids(user_id)` — geeft array van friend IDs terug
- Trigger op signup: genereer unieke username (fallback: `user_<6chars>`) en `friend_code`

## UI Componenten

**`src/pages/Community.tsx`** — hoofdpagina met 4 tabs:
1. **Friends** — lijst van vrienden met avatar, username, laatste activiteit; remove knop
2. **Add friend** — eigen QR code groot getoond, eigen username met copy-knop, "Scan QR" knop, input "Voer username in"
3. **Leaderboards** — sub-tabs: "Per oefening" (dropdown om oefening te kiezen, top gewicht ranking) en "Activiteit" (workouts deze week, streaks, totaal volume)
4. **Feed** — gedeelde workouts van vrienden chronologisch met like-knop

**`src/components/community/QRScannerDialog.tsx`** — gebruikt bestaande html5-qrcode (zoals BarcodeScanner), scant friend QR en triggert vriendverzoek.

**`src/components/community/FriendRequestsBadge.tsx`** — bell-icoon bovenin met aantal pending requests, dropdown met accept/decline knoppen.

**`src/components/community/ShareWorkoutDialog.tsx`** — vanuit Workouts pagina: kies vrienden uit lijst (multi-select) + checkbox "ook in feed plaatsen" + optioneel bericht.

**Navigatie**: Community link toevoegen aan `BottomNav` en `Sidebar` (Users icon).

## Technische details

- **QR code generatie**: lib `qrcode.react` (`bun add qrcode.react`); QR bevat URL `https://axenro.com/community?add=<friend_code>`
- **QR scan handling**: bij scan parse de friend_code, zoek user_id, stuur friendverzoek met status 'pending'
- **Leaderboards**:
  - PRs: query `personal_records` waar `user_id IN (friend_ids + self)`, group by exercise_name, max(weight)
  - Activiteit: query `workouts` (completed=true, last 7 days) per friend, count + sum exercises volume
- **Feed**: query `shared_workouts` waar `recipient_id = self OR (is_public_to_friends AND sender_id IN friend_ids)`, sort by created_at desc
- **Vertalingen**: nieuwe keys in `src/translations/dutch/` (nieuw bestand `community.ts`) en `english.ts` voor alle UI strings
- **Realtime** (optioneel maar aanbevolen): Supabase realtime channel op `friendships` tabel zodat nieuwe verzoeken direct verschijnen

## Files

**Nieuwe files**:
- `src/pages/Community.tsx`
- `src/components/community/FriendsList.tsx`
- `src/components/community/AddFriend.tsx`
- `src/components/community/Leaderboards.tsx`
- `src/components/community/CommunityFeed.tsx`
- `src/components/community/QRScannerDialog.tsx`
- `src/components/community/FriendRequestsBadge.tsx`
- `src/components/community/ShareWorkoutDialog.tsx`
- `src/hooks/useFriends.ts`
- `src/hooks/useFriendRequests.ts`
- `src/hooks/useLeaderboards.ts`
- `src/hooks/useSharedWorkouts.ts`
- `src/translations/dutch/community.ts`

**Aan te passen**:
- `src/App.tsx` — route `/community`
- `src/components/layout/BottomNav.tsx` & `Sidebar.tsx` — nav link
- `src/translations/dutch/index.ts` & `english.ts` — community keys
- `src/components/workouts/WorkoutList.tsx` — "Share with friends" knop op workouts
- DB migratie voor 3 nieuwe tabellen + username/friend_code op user_profiles + helper functies + trigger

## Limitaties / aandachtspunten
- QR scannen vereist HTTPS + camera permissie (preview & axenro.com hebben dit al)
- Username uniqueness wordt op DB-niveau afgedwongen
- Leaderboards tonen alleen vrienden + jezelf (geen globale ranking) voor privacy
