# SmartPack PWA

SmartPack is a progressive web app that blends the marketing landing experience with an authenticated traveller workspace. The Vite + React shell ships with Supabase-backed authentication, profile onboarding, Tailwind design tokens, runtime localisation, and a dashboard foundation ready for product features.

## Feature Highlights

- Supabase authentication with email/password or Google/Facebook OAuth, profile bootstrapping, and persistent sessions managed in `AuthContext`.
- Guided onboarding that enforces profile completion, supports avatar upload to Supabase Storage, and captures residence + language data before unlocking the app.
- Protected dashboard routes (`/app/*`) with a responsive navigation shell, theme toggle, language picker, and stub pages for trips, settings, and profile management.
- Rich profile editor pulling from the Supabase `profiles` table with editable core, travel, transport, accommodation, activity, sustainability, and budget sections.
- Runtime localisation via `react-i18next` with German, English, French, and Italian resources for landing, auth, and dashboard namespaces.
- Tailwind-driven design system with light/dark themes, glassmorphism primitives, and reusable layout utilities.
- PWA-first build powered by `vite-plugin-pwa`, auto-registration of the service worker, and installable manifest + icon set.

## Requirements

- Node.js ≥ 22 (enforced by `package.json`)
- A Supabase project with:
  - `profiles` table containing the fields read/updated in `src/types/profile.ts`
  - Public storage bucket named `profile-avatars`
  - Row Level Security policies that ensure users can read/write only their own profile and avatar objects
- Outbound HTTPS access to `restcountries.com` (used at runtime to populate onboarding country lists)

## Environment Setup

1. Create a `.env.local` (or `.env`) file in the project root and add your Supabase anon key:
   ```bash
   VITE_SUPABASE_ANON_KEY=pk_your_public_anon_key_here
   ```
   The Supabase project URL defaults to the SmartPack sandbox URL inside `src/utils/supabaseClient.ts`. Update it if you use a different project.
2. Install dependencies:
   ```bash
   npm install
   ```

## Available Scripts

```bash
npm run dev      # Start the Vite dev server on http://localhost:5173
npm run build    # Type-check and create an optimized production bundle
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint across the TypeScript source
```

Running `npm run build` emits the PWA service worker and manifest so the app can be installed on desktop or mobile. Use HTTPS in production to allow service worker registration.

## Supabase Configuration

- **Authentication:** Enable email/password and the OAuth providers you surface in the UI (Google, Facebook). The redirect URL should include `/auth/callback`.
- **Profiles table:** Create a table named `profiles` with `user_id uuid` (primary key referencing `auth.users`), `user_firstname`, `user_lastname`, `core_country_of_residence`, `core_languages` (string array), and any additional fields referenced in `src/types/profile.ts`. Ensure default triggers populate `created_at`/`updated_at`.
- **Policies:** Add RLS policies that permit `select`/`insert`/`update` for `auth.uid() = user_id`. The onboarding and profile pages rely on upserts (`ensureProfileForUser`) and partial updates (`updateRecord`).
- **Storage:** Create a bucket named `profile-avatars` and allow authenticated users to upload to their own prefix (`user_id/*`). The profile avatar services handle upload, retrieval, and removal.

## Application Flow

- Public routes (`/`, `/team`, `/jobs`, `/contact`) remain accessible without signing in.
- `/auth` renders the combined sign-in/sign-up form, localisation-aware copy, and OAuth shortcuts.
- `/auth/callback` finalises the Supabase sign-in flow for OAuth/email links and redirects home.
- Protected routes under `/app/*` are wrapped by `ProtectedRoute`. It guards unauthenticated users, ensures a `profiles` row exists, and redirects users without a country set to `/app/onboard`.
- `/app/onboard` collects the traveller’s country, languages, and avatar before allowing navigation to the dashboard.
- `/app/dashboard`, `/app/trips`, `/app/profile`, and `/app/settings` live inside the `DashboardLayout` shell with responsive navigation, language switching, and theme toggling.

## Internationalisation & Theming

- `src/i18n.ts` bootstraps `react-i18next`, auto-detects language preferences, and synchronises the document `lang` attribute.
- `LanguageSwitcher` presents DE/EN/FR/IT toggles and persists the choice in `localStorage`.
- `ThemeContext` manages light/dark themes, persists the selection, and honours OS preferences when unset.
- Design tokens in `src/index.css` provide shared colour variables, gradients, shadows, and responsive container helpers consumed across landing and dashboard views.

## Project Structure

```
.
├─ public/                 # Static assets, PWA manifest, icons
├─ src/
│  ├─ assets/              # Fonts, imagery, and static imports
│  ├─ components/
│  │  ├─ auth/             # Auth form, navbar, protected route guard
│  │  ├─ common/           # Theme toggle, language switcher, scroll helpers
│  │  ├─ dashboard/        # Dashboard layout & navigation shell
│  │  └─ landing/          # Marketing site sections
│  ├─ context/             # Theme and auth providers
│  ├─ hooks/               # Supabase query + profile hooks
│  ├─ locales/             # i18n JSON resources
│  ├─ pages/               # Route-level screens (landing, auth, dashboard)
│  ├─ services/            # Supabase CRUD helpers, profile logic, avatar storage
│  ├─ types/               # Shared TypeScript models
│  ├─ utils/               # Supabase client, avatar helpers
│  ├─ views/               # Dashboard view composition
│  ├─ App.tsx              # Route registration and protected shells
│  ├─ i18n.ts              # i18next initialisation
│  ├─ index.css            # Tailwind directives & design tokens
│  └─ main.tsx             # Entry point, providers, and PWA registration
├─ package.json
└─ vite.config.ts
```

## Deployment Notes

- Configure production environment variables (`VITE_SUPABASE_ANON_KEY`, optional Supabase URL) through your hosting provider’s secrets.
- Serve the `dist/` directory over HTTPS with headers that allow service workers (`service-worker.js` requires `Cache-Control: no-cache` or `max-age=0` on some hosts).
- When shipping new dashboards, extend `src/views/dashboard` and `src/pages/*` while reusing Supabase helpers for data access.

---

*SmartPack – Pack smart. Travel relaxed.*
