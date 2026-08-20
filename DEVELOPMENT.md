# Family Vault — development notes

Last updated: 20 August 2026

This file is a memory of what was built in Cursor conversations so later sessions (or you) can see the product as it stands. It is not a substitute for the code. For how to run and encrypt the vault, see `README.md`.

Live app: **https://rbg4ai.github.io/family-vault/**  
Source: **https://github.com/RBG4AI/family-vault** (`main` + `gh-pages`)  
Workspace: local repo `credential-manager`, published as **Family Vault**.

After every live publish, testers must **hard-refresh** (Cmd+Shift+R / iPhone: close tab and reopen) so the service worker picks up the new build.

---

## Product rules (do not undo)

- Local-only. Encrypted vault in IndexedDB on this device. No backend, Drive, WhatsApp, or “email me the vault”.
- AES-256-GCM, PBKDF2-SHA-256 (400k). Master password is never stored. Recovery key can unwrap the data key; rotating recovery cannot re-show the old key.
- Emergency print sheet: useful IDs, policies, accounts, vehicles; cards last-4; **no passwords / PIN / CVV**.
- Access print page (“If I cannot open this vault”): fill-in blanks, **never prints the recovery key**.
- Do not wipe `html.lang` with a wholesale `className` on `<html>` (theme uses `classList.toggle` for `light` / `dark` / `vault-obscured`).
- GitHub Pages hosts the **program** only. Each phone keeps its own vault.

---

## Vault sections

| Section | What it holds |
| --- | --- |
| Home | Counts, renewals, family chips, print/calendar, investments overview |
| People | Family members, blood group, allergies, tap-to-call, linked records |
| Health | Vitals per person: BP, sugar, weight, pulse, charts |
| Vehicles | Registration, insurer, insurance / PUC / RC due tiles |
| Properties | Address, survey, tax due, **Google Maps location** |
| Logins | App/site, username, password, 2FA + backup codes |
| Email | Address, password, recovery, 2FA |
| Banking | Account, IFSC, nominee, net-banking secrets |
| Cards | Credit/debit, last-4, expiry, CVV/PIN |
| IDs | PAN, Aadhaar, passport, DL, etc. |
| Insurance | Policy, provider, sum assured, nominee, end date |
| Investments | Type, folio, invested vs current, maturity, nominee |
| Notes | Secret notes |
| Settings | Rename, password, recovery, backup/restore, language, theme, tester sample data |

English and Hindi UI. Theme: dark/light + accent.

---

## What was developed (by theme)

### Core vault
- Create family or personal vault, unlock, lock, auto-lock, recovery unlock, recovery key shown once.
- Rename vault, change master password, rotate recovery.
- Encrypted backup download; restore-from-file **adds another vault** (does not overwrite the open one).
- Backup nag on Home if never exported or last backup is older than 30 days.
- Global search; Home button; Back on section screens (nav history).
- Duplicate PAN/Aadhaar warning.
- Sample household behind Settings → Tester tools (tagged `sample`).
- PWA / Add to Home Screen; service worker cache (bump version on each publish).

### People
- Person hub overlay: close X, Escape, undo delete.
- Blood group dropdown including Unknown; allergies; doctor; locker hint.
- Tap-to-call phone and emergency phone.
- Linked rows open the actual record.
- Deep-link from person card and from global search.

### Health
- Person chips, snapshot tiles, BP/sugar/weight/pulse charts, complete reading cards.
- Colours are a household guide, not medical advice.

### Home / investments
- Investment donuts by person and by type (desktop). On phones, donuts hide; totals and people remain.
- Renewals list (next 60 days); `.ics` calendar download.
- Print emergency sheet; print access page.

### Colourful tiles (August 2026)
- Vehicles and properties: type-coloured cards, due-date tiles (green / amber / red).
- Then the same treatment for logins, email, banking, cards, IDs, insurance, investments, notes.
- People: relation tiles, blood group, linked-record counts.
- Settings, vault list, unlock, create, recovery: status tiles.
- Home: colourful section grid (compact 3-column on phones).

### Properties + Maps
- Field: Google Maps location (paste Maps link, plus code, or coordinates).
- If empty, the **address** is used.
- Map pin on the card and “Open in Google Maps” tile → new tab.
- Only Google Maps URLs are accepted as links; other text becomes a Maps search.
- Location stays in the encrypted vault; Maps loads only when the user taps.

### Phone UX
- Home tightened: smaller tiles, print actions in one row, family chips swipe sideways, less blur (blur was making scroll sticky).
- Native-feeling scroll (no transform on the scrolling page wrapper).
- Birthday and other **full dates**: Day / Month / Year dropdowns (phone native picker often hid the day). Card expiry stays month+year.
- Master password: field was `readOnly` until focus (to block password managers). On iPhone that meant the keyboard never opened until the eye icon. Now the field is armed on tap; unlock no longer auto-focuses the password box.

---

## Architecture (short)

- React 18 + Vite + Tailwind + Framer Motion + Recharts. No server.
- IndexedDB `family-vault` / store `vaults`. Theme and language in `localStorage`.
- Vault JSON version 3 (`hydrateVaultData`). Backup cap 5 MB.
- Deploy: `npm run pages` → `docs/` on `main` → copy `docs/` to a temp git repo and force-push `origin gh-pages`.

### Handy files

- `src/utils/maps.js` — Maps links for properties
- `src/components/DateSelect.jsx` — Day / Month / Year for every full date
- `src/components/SecretInput.jsx` — password fields; arm on tap so the phone keyboard opens
- `public/serviceWorker.js` — cache name (`family-vault-v26` as of this note); bump on each UI publish

---

## Conversation log (this Cursor thread)

Dates: 19–20 August 2026.

1. Make **vehicles and properties** colourful with more tiles → shipped, live.
2. Make **all remaining sections and screens** colourful with tiles → shipped, live.
3. Add **Google Maps locations** on each property; map icon opens Maps → shipped, live.
4. Home looks **clumsy on phone**; scroll not smooth → compact Home, smoother scroll → shipped, live.
5. Birthday picker shows **only month and year** → Day/Month/Year selects → shipped, live.
6. Master password: **keyboard missing on mobile** until eye icon → tap-to-arm field → shipped, live.
7. **This notes file** so future chats know what exists.

Earlier work already on `main` before this thread (do not redo): local-only encryption, Pages deploy, backup nag, search, Home/Back, person hub, 2FA backup codes, nominees, health charts, investment overview, emergency/access print, sample data, Hindi, PWA.

---

## How to publish (when asked)

```bash
npm run pages
# commit source + docs on main, push origin main
# copy docs/ to a temp repo, commit, force-push origin gh-pages
```

Bump the service worker cache name in `public/serviceWorker.js` whenever the UI should not stay stuck on an old cached app.

---

## Intentionally not in the product

- Cloud sync, WhatsApp backup, email-me-the-vault.
- Unencrypted HTML export, share codes, fake LAN sync, biometric login (removed earlier).
- Embedded Google Maps iframe (the app’s security policy is local-only; opening Maps in a new tab is enough).
