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

Create the tables (RLS disabled, or add policies that allow the anon key to read/write rows by `id`):

```sql
create table profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  premium boolean default false,
  focus_mode boolean default false,
  created_at timestamptz default now()
);

create table favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  text text not null,
  author text,
  category text not null,
  lang text not null,
  created_at timestamptz default now(),
  unique (profile_id, text, lang)
);
```

Environment variables (`.env`):

```
VITE_SUPABASE_URL=https://YOUR-project.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

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

Enjoy the calm launch.
