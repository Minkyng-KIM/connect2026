# CONNECT 2026 · Startup Hub (GitHub Pages)

A static site for CONNECT 2026 participating startups at SHBC 2026 (Singapore Expo, 8–9 Oct 2026). No build step: plain HTML/CSS/JS.

## Structure

```
index.html        page shell (nav, tab bar)
css/style.css     styles
js/config.js      links, operator contacts, login mode, demo data   ← edit most things here
js/data.js        schedule (brochure p.11–13) + company brochures (p.14–30)
js/auth.js        login module (demo mode ↔ Apps Script)
js/app.js         router + views
```

## Pages

| Route | Public? | Content |
|---|---|---|
| `#/` | ✅ | Hero + live "now / next" status (SGT) + quick links |
| `#/schedule/08`, `#/schedule/09` | ✅ | Full CONNECT schedule, parallel tracks, Pitchstop order |
| `#/companies`, `#/company/<id>` | ✅ | Per-company brochure pages (8 companies) |
| `#/guide` | ✅ | Link to the Notion guide + key times |
| `#/shbc` | ✅ | SHBC official site / programme |
| `#/contact` | ✅ | Operator contacts: WhatsApp · KakaoTalk · Call |
| `#/login`, `#/my` | 🔒 | Promo page, meetings (Google Calendar), LinkedIn/WhatsApp, photos (Google Drive) |

Test the live status before the event: `index.html?now=2026-10-08T14:35#/`

## Deploy to GitHub Pages

1. Create a new repo on GitHub (e.g. `connect2026`) → upload all files in this folder to the root.
2. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`** → Save.
3. After 1–2 minutes: `https://<username>.github.io/connect2026/`
4. Generate the booth QR code from that URL.

## Filling in content

- **Company brochures**: `js/data.js` → `COMPANIES`. Any `null` field shows as "업데이트 예정".
- **Operator contacts**: `js/config.js` → `contacts`. `whatsapp` = digits only with country code (`6591234567`). `kakao` = open chat or channel URL. Empty values hide the button.
- **Logo / photos**: currently an initials block and a placeholder. Add images to `img/` and swap the markup in `viewCompany` in `app.js`.

## Login — current status: demo mode

`CONFIG.auth.appsScriptUrl` is empty, so the site runs in **demo mode**:
ID = company id (e.g. `beyondmedicine`), password = `CONFIG.auth.demoPassword`.

> ⚠️ Demo mode is not security. GitHub Pages is public, so anything in `config.js` can be read by anyone. Before going live, switch to Apps Script and remove private values from `demoPrivate`.

### Apps Script contract (to implement later)

Deploy the web app with **Execute as: Me / Who has access: Anyone** and put the `/exec` URL in `appsScriptUrl`.
The site sends a `POST` with `Content-Type: text/plain` (to avoid CORS preflight) and a JSON string body.

**Login**
```json
→ { "action": "login", "id": "beyondmedicine", "password": "..." }
← { "ok": true, "token": "random-string", "company": { "id": "beyondmedicine", "name": "Beyondmedicine" } }
← { "ok": false, "error": "ID 또는 비밀번호가 맞지 않습니다." }
```

**Company private data**
```json
→ { "action": "private", "token": "random-string" }
← { "ok": true, "data": {
      "promoUrl": "https://...",
      "calendarId": "xxx@group.calendar.google.com",
      "driveFolderId": "1AbC...",
      "linkedin": "https://www.linkedin.com/company/...",
      "whatsapp": "8210...",
      "contactPerson": "Name / Title"
   } }
← { "ok": false, "error": "expired" }   // triggers re-login
```

Suggested backing store: a Google Sheet with columns `id | passwordHash | name | promoUrl | calendarId | driveFolderId | linkedin | whatsapp | contactPerson`, and tokens stored in `CacheService` for ~12 hours.

### Google integration notes

- **Meetings (Calendar)**: create one calendar per company. The embed only shows events to viewers who can see the calendar, so either make it public (busy/details) or share it with the company's Google account.
- **Photos (Drive)**: create one folder per company and set sharing to "Anyone with the link can view". Photos synced into that folder (Drive for desktop, Google Photos → Drive, etc.) appear automatically.
- **Promo page**: a claude.ai artifact link can't be embedded in an iframe, so it opens in a new window.
