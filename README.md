# JPCS T.I.P. QC Chapter — Website

A free static website for the Junior Philippine Computer Society, T.I.P. Quezon City Chapter. Plain HTML/CSS/JS — no build step, no server costs.

## Pages
- `index.html` — Home
- `events.html` — Our Events (SY 2025–2026 recap + SY 2026–2027 upcoming)
- `partnerships.html` — Partnerships with other orgs
- `about.html` — About Us, vision/mission, officer corner
- `contact.html` — Contact form (Web3Forms) + embedded Google Map

## How to deploy on GitHub Pages (free)

1. Create a new repository on GitHub (e.g. `jpcs-tip-qc`).
2. Upload everything in this folder to the repo root — keep the `css/`, `js/`, and `assets/` folders as-is.
3. On GitHub, go to **Settings → Pages**.
4. Under "Build and deployment," set **Source** to "Deploy from a branch," pick the `main` branch and `/ (root)` folder, then **Save**.
5. GitHub will give you a live URL shortly, usually `https://<your-username>.github.io/<repo-name>/`.

## Editing content later
- All officer names/roles are plain HTML in `about.html` — search for `officer-card` to find each entry.
- To add officer photos later: replace the `<div class="avatar avatar-1">XX</div>` with `<img src="assets/officers/name.jpg" alt="...">` and add photos to a new `assets/officers/` folder.
- Event photos live in `assets/events/`. Swap files or add new `<img>` tags following the existing pattern.
- The contact form is wired to Web3Forms with your access key already in `contact.html`. No backend needed — submissions arrive by email.

## Notes
- Colors, fonts, and the "cartridge card" style are defined once in `css/style.css` — change values there to restyle the whole site.
- Google Fonts are loaded from `fonts.googleapis.com` via CDN, so an internet connection is needed for the custom fonts to show (they'll fall back to system fonts otherwise).
