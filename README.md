# NEXORA

Premium Indonesian anime encyclopedia built with Astro and Supabase.

## Setup
1. Install Node.js (18.20.8+ or 20.3.0+).
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Fill `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` with the Supabase Project URL and Publishable key.
5. Run `npm run dev`.

## Deploy to GitHub Pages
- Create a GitHub repository named `nexora`.
- Update `site` in `astro.config.mjs` to `https://YOUR_GITHUB_USERNAME.github.io`.
- Keep `base: '/nexora'` for a project repository named `nexora`.
- Add GitHub Actions deployment workflow in the next setup stage.

## Security
Only use the Supabase Publishable key in the browser. Never place the `service_role` or secret key in frontend code or GitHub.
