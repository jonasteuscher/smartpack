# SmartPack PWA

A progressive web app experience for planning smarter trips. This React + Vite rewrite of the original SmartPack landing page sets up a modern, extensible foundation with first-class PWA support, Tailwind-powered design tokens, dark mode, and modular components ready for future product features.

## Tech Stack

- [React 18](https://react.dev/) with [Vite](https://vitejs.dev/) for fast DX
- TypeScript with path aliases for scalable architecture
- Tailwind CSS and handcrafted design tokens (fonts, gradients, CSS variables)
- `vite-plugin-pwa` for offline caching, manifest generation, and service worker auto-updates
- `react-i18next` with JSON resources for German, English, French, and Italian runtime localisation
- `react-router-dom` powers the landing, team, jobs, and contact subpages without leaving the PWA shell
- Headless UI & Heroicons for accessible, composable UI primitives

## Getting Started

> Node.js ≥ 18 is recommended.

```bash
# install dependencies
npm install

# start Vite dev server
npm run dev

# type-check and build for production
npm run build

# preview built output locally
npm run preview
```

The app is configured as a Progressive Web App. When you run `npm run build`, Vite generates the service worker and injects the manifest so the app can be installed on desktop and mobile.

## Project Structure

```
.
├─ public/               # Static assets served as-is (manifest, PWA icons, robots)
├─ src/
│  ├─ components/
│  │  ├─ common/         # Reusable UI pieces (theme + language controls)
│  │  └─ landing/        # Landing page sections & layout
│  ├─ context/           # Global contexts (theme handling)
│  ├─ hooks/             # Future custom hooks
│  ├─ utils/             # Utility modules (placeholder for future logic)
│  ├─ pages/             # Additional routes (team + jobs + contact microsites)
│  ├─ App.tsx            # Application shell
│  └─ main.tsx           # Entry point & service worker registration
└─ tailwind.config.cjs   # Tailwind theme extensions & scanning config
```

## Deployment Notes

- Manifest and icon set are ready for install prompts on modern browsers.
- Service worker is registered with `autoUpdate`; use HTTPS in production to enable it.
- Add environment-specific configuration or API clients under `src/utils/` as the product evolves.

## Next Steps

1. Connect the CTA form to your marketing automation or waitlist backend.
2. Localise the team/jobs/contact copy further or plug it into your CMS if you prefer managing it centrally.
3. Expand beyond the landing page by adding authenticated app routes and data providers.

---

*SmartPack – Pack smart. Travel relaxed.*
