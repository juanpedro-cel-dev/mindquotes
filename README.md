## MindQuotes - modo zen

Single-page React app built with Vite to deliver calm reading sessions, ambient music, and a premium focus mode.

### Core features

- Mood-based quotes (`Inspiradoras`, `Motivacion`, `Despecho suave`) with a persistent selector and optional ambience prompt.
- Zen music engine: Web Audio generative pads plus curated ambient tracks (Pixabay), deferred loading, in-memory cache, smooth fades, and a "return to generative sound" button.
- Persistent favourites tied to each profile (Supabase table `favorites`).
- Focus mode (Premium): hides navigation and ads, enlarges the quote card, honours `prefers-reduced-motion`.
- ES/EN localisation with all state saved per profile.

### Local setup

```
npm install
npm run dev  # http://localhost:5173
```

Production build:

```
npm run build
npm run preview
```

### Supabase configuration

Create the tables (recommended: enable RLS and policies below; otherwise keep RLS disabled while you iterate):

```sql
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  premium boolean not null default false,
  focus_mode boolean not null default false,
  created_at timestamptz not null default now()
);

create table favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  text text not null,
  author text,
  category text not null,
  lang text not null,
  created_at timestamptz default now(),
  unique (profile_id, text, lang)
);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  email text,
  message text not null,
  created_at timestamptz not null default now()
);

-- Optional but recommended if you enable RLS:
alter table profiles enable row level security;
alter table favorites enable row level security;
alter table feedback enable row level security;

drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_upsert_own" on profiles;
drop policy if exists "favorites_full_access_owner" on favorites;
drop policy if exists "feedback_insert_any" on feedback;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_upsert_own" on profiles
  for insert with check (auth.uid() = id)
  using (auth.uid() = id);

create policy "favorites_full_access_owner" on favorites
  for all using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "feedback_insert_any" on feedback
  for insert with check (true);
```

Environment variables (`.env`):

```
VITE_SUPABASE_URL=https://YOUR-project.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Auth settings:

- In Supabase → Authentication → Providers, enable the Email provider. If you want instant access without confirmation emails, disable “Confirm email” under Authentication → Providers → Email.

### Buzón de mejoras

- La página `/#/feedback` (accesible desde el menú “Buzón de ideas”) permite enviar sugerencias con un límite de 600 caracteres. Si la persona ha iniciado sesión, guardamos su `profile_id`; si no, el registro queda anónimo.
- Los envíos se guardan en la tabla `feedback`. Puedes revisarlos desde Table editor → `feedback` o exportarlos desde el panel de Supabase.
- Si prefieres que solo usuarios autenticados puedan escribir, ajusta la política `feedback_insert_any` para exigir `auth.uid() is not null`.

### Biblioteca de favoritos

- El menú “Favoritos” abre `/#/favorites`, donde se pueden filtrar las citas guardadas por mood e idioma y eliminarlas sin volver a la tarjeta principal.
- Se apoya en los datos que ya existen en la tabla `favorites`; no requiere configuración adicional.

### Diario zen

- `/#/journal` permite escribir entradas rápidas (título opcional + texto de hasta 800 caracteres). El contenido vive en `localStorage`, separado por usuario (`mq_journal_<profile_id>` o el nombre de perfil si no hay id).
- Si en el futuro necesitas sincronizarlo con Supabase, crea una tabla `journal_entries` y migra los datos desde ese almacenamiento local.

### Audio assets

Place the CC0/Pixabay tracks in `public/audio/`:

```
public/audio/inspiration-morning-light.mp3
public/audio/motivation-zen-garden.mp3
public/audio/heartbreak-deep-relaxation.mp3
```

### Launch checklist

1. Flows: switch ES <-> EN, cycle moods, save/unsave favourites, open the full modal, reload the page, login/logout, toggle premium.
2. Music: mood prompt appears once per mood, accepted track auto-plays, "return to generative sound" restores the synth ambience, console free of 404/decoding errors.
3. Accessibility: animations respect `prefers-reduced-motion`; buttons (`Guardar`, focus toggle, prompt) expose `aria-pressed`/`aria-live`.
4. Visual: check contrast in focus mode and responsive layouts (mobile/tablet/desktop).
5. Build: `npm run build` passes and bundles under `dist/` look correct.
6. Feedback: abre `/#/feedback`, envía una sugerencia y confirma que aparece en la tabla `feedback` de Supabase.
7. Favoritos: revisa `/#/favorites`, aplica filtros por mood/idioma y elimina alguna cita para comprobar que se refleja en Supabase/localStorage.
8. Diario: entra en `/#/journal`, crea y borra una entrada y confirma que persiste tras recargar (usa el mismo usuario).

Enjoy the calm launch.

### Mobile app (Android · Play Store)

The mobile experience lives under `mobile/` and is built with Expo (React Native). It mirrors the quote flows, favourites, premium focus mode and ambient music engine, now adapted for native playback.

#### Run locally

```
cd mobile
npm install
cp .env.example .env  # fill EXPO_PUBLIC_SUPABASE_* with your project keys
npm run android       # requires Android emulator or a device with Expo Go
```

#### Features

- Home screen with mood selector, bilingual UI (ES/EN), ambient auto-play per mood and Supabase-backed favourites.
- Dedicated favourites tab with offline cache and remote sync.
- Profile tab for passwordless login (username), premium toggle, focus mode toggle, and logout.
- Ambient Player uses Expo AV with CC0 mood-based tracks (Pixabay URLs by default; replace with your own in `mobile/src/lib/audioTracks.ts`).

#### Supabase setup

Reuse the same tables/keys as the web app. Copy your Supabase URL and anon key into `mobile/.env` (prefix with `EXPO_PUBLIC_` as shown in `.env.example`). The mobile client shares the same schema and will sync favourites/premium flags automatically when connectivity is available.

#### Preparing a Play Store build

1. Install the Expo Application Services CLI if you have not already: `npm install -g eas-cli`.
2. Inside `mobile/`, sign in to Expo (`npx expo login`) and configure your app id in `app.config.ts` (`android.package` / `ios.bundleIdentifier` already default to `com.mindquotes.app`; adjust if needed).
3. Generate/upload keystores with `eas credentials` (one-time).
4. Create an optimized Android build: `eas build --platform android --profile production`. The default profile outputs an Android App Bundle (`.aab`) ready for Play Console.
5. Submit directly from the CLI (optional): `eas submit --platform android --path <path-to-aab>`.

Extras:

- Update icons/splash screens under `mobile/assets/`.
- If you need offline audio, download the tracks and point the URIs in `mobile/src/lib/audioTracks.ts` to local assets.
- For staging environments you can create `.env.staging` and invoke `EXPO_PUBLIC_SUPABASE_URL=... EXPO_PUBLIC_SUPABASE_ANON_KEY=... npm run android`.
