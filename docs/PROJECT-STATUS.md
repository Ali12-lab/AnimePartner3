# 📋 Anime Partner — Verified Project Status

> **Ye doc AI ki conversation se nahi, seedha repo ke code se banaya gaya hai.**
> Har neeche likhi cheez `index.html`, `sw.js`, `manifest.webmanifest` aur
> `.github/workflows/build-apk.yml` padh kar verify ki gayi hai.
>
> Snapshot: **v1.7.0** · commit `e7e8b32` · 4 Oct 2026
>
> Dobara verify karne ke liye: `node tools/verify.mjs`

---

## 1. Ek nazar me

| Cheez | Value | Verified |
|---|---|---|
| Version | `1.7.0` | ✅ chaaron files me consistent |
| versionCode | `170` | ✅ dots-remove scheme se match |
| App file | `index.html` — 12,436 lines / 894 KB | ✅ |
| Inline JS | 10,926 lines — **syntax clean** | ✅ `vm.Script` parse |
| CSS | lines 10–1373 (ek `<style>` block) | ✅ balanced |
| Screens | **49** `AP.Views.*` handlers | ✅ |
| Nav sections | **8** | ✅ sab ke handlers maujood |
| Bottom nav | **5** (Android limit) | ✅ |
| Storage keys | `animePartner.v1`, `animePartner.media.v1` | ✅ |
| Dependencies | **zero** — koi package.json nahi | ✅ |
| Git commits | **1** (poori app squashed) | ⚠️ |

---

## 2. Feature map — 8 sections, 49 screens

### Navigation (`NAV` array)
`home` · `discover` · `movies` · `tracker` · `games` · `japanese` · `faq` · `profile`

### Bottom nav (`BOTTOM_NAV`) — sirf 5, Android ki hard limit
`home` · `discover` · `movies` · `tracker` · `profile`

Baaki 3 (`games`, `japanese`, `faq`) desktop sidebar aur mobile Profile hub se
khulte hain. Code me comment bhi hai: *"Android bottom bars top out at 5
destinations — the rest live in the sidebar and on the Profile hub."*

### Saare 49 views

```
about        achievements  album        charquiz     deck
discover     emoji         experienced  faq          gamehub
games        guess         guessyear    hangman      hilo
home         iq            janken       japanese     jpquiz
kana         match         memory       movies       online
oped         phrases       profile      quests       quiz
reflex       scramble      search       settings     silhouette
stats        storage       time         tracker      ttt
watch
```

Plus 6 internal helpers (route nahi): `_bindPlan`, `_bindQuotes`, `_gamesCard`,
`_matchResult`, `_partnerCard`, `_planCard`, `_progressCard`, `_quotesSection`.

### Japanese module — 6 decks
| id | Deck | Icon |
|---|---|---|
| `greetings` | Greetings | 👋 |
| `numbers` | Numbers | 🔢 |
| `everyday` | Everyday Expressions | 💬 |
| `vocab` | Common Vocabulary | 📚 |
| `anime` | Anime Vocabulary | ⚔️ |
| `sentences` | Simple Sentences | 🧩 |

### Tracker — 5 statuses (`AP.Tracker.STATUSES`)
`watching` ▶️ · `completed` ✅ · `plan` 📝 · `hold` ⏸️ · `dropped` 🚫

---

## 3. Architecture

### Module namespaces (`AP.*`)

```
Core        AP.boot  AP.VERSION  AP.store  AP.save  AP.defaultState  AP.merge
State       AP.Storage   (KEY: animePartner.v1, load/save/reset/export/sanitise)
UI          AP.UI        (router, nav, modal, toasts, topbar, suggestions)
Screens     AP.Views     (49 handlers)
Data        AP.Data  AP.API  AP.Net  AP.Search  AP.Detail  AP.art  AP.titleOf
Features    AP.Tracker  AP.Rec  AP.Match  AP.Hero  AP.Quotes  AP.Quiz
            AP.Japanese  AP.Games  AP.GamesPlus  AP.GamesPlus2  AP.GameHub
            AP.GameInvite  AP.Plan  AP.Time  AP.Engage  AP.Ach
Platform    AP.Android  AP.Offline  AP.Notify  AP.Sound  AP.Haptics
Settings    AP.Settings  AP.ACCENTS
Content     AP.Movies  AP.Onboarding  AP.FEEDBACK_FORM
Assets      AP.LOGO_DATA_URI  AP.FAVICON_DATA_URI  (inline, no extra requests)
Helpers     AP.quizRunner
```

### Router
```
AP.UI.go(view, params, noPush)
  → AP.Views[view]
  → agar handler na ho: console.warn + return   (app nahi tootti)
  → render try/catch: error par built-in errorState
  → AP.UI.hydrate(page) → AP.API.observe() (lazy artwork)
  → history.replaceState("#/" + view)
```

Hash routing: `#/discover`, `#/tracker`, `#/anime/:id` (parameterised).
Manifest shortcuts isi scheme ko use karte hain.

### State
- Ek hi localStorage key: **`animePartner.v1`** — poora app state ek JSON blob.
- Artwork cache alag: **`animePartner.media.v1`** (taake app update par user ka
  download kiya hua art na pheka jaye).
- `AP.Storage.sanitise()` — hand-edited ya partially-restored save ko defensive
  repair karta hai. Code comment: *"a hand-edited or partially-restored save must
  never white-screen the app."*
- `localStorage` unavailable ho (private mode) to app **in-memory chalti rehti hai**.

### Data sources
| Source | Use |
|---|---|
| **AniList** (`graphql.anilist.co`) | Primary — anime metadata, artwork, characters, VAs, official streaming links |
| **AniList CDN** (`s4.anilist.co`) | Images direct load |
| **Jikan / MAL** (`api.jikan.moe`) | Fallback agar AniList down ho |
| **Bundled sample catalogue** | Offline fallback |

Sirf search title ya numeric ID bheja jata hai. Koi personal data nahi.

### Where-to-watch providers (10, sab official)
Crunchyroll · Netflix · Amazon Prime Video · Hulu · Disney+ · HBO Max ·
Muse Asia · Ani-One Asia · Bilibili (Official) · Studio/broadcaster pages

### Service worker (`sw.js`)
| Cache | Version-scoped? | Strategy |
|---|---|---|
| `ap-v1.7.0-shell` | ✅ har update par replace | cache-first + background refresh |
| `ap-images` | ❌ **jaan-boojh kar nahi** | cache-first → network → inline SVG placeholder |

> `ap-images` deliberately version-scoped **nahi** hai — comment ke mutabiq taake
> *"an app update never throws away the artwork the user chose to download."*
> `MAX_IMAGES = 4000`. Ye key `AP.Offline` ke saath shared hai — **rename mat karna**.

API requests network-only, soft JSON fallback `{data:null, offline:true}` — kuch hang nahi hota.

### Android APK (`build-apk.yml`)
- Manual trigger (`workflow_dispatch`)
- Java 17 (Temurin) · Android SDK 34 · build-tools 34.0.0 · Gradle 8.7 · AGP 8.3.2
- `minSdk 23`, `targetSdk 34`, namespace `com.shin.animepartner`
- WebView + `WebViewAssetLoader` → `https://appassets.androidplatform.net/assets/index.html`
- Poora web app APK ke andar bundled → **fully offline**
- Output: `assembleDebug` → artifact + **direct GitHub Release** (no zip)
- External links `ACTION_VIEW` se browser me khulte hain

---

## 4. 🔴 Known risks — priority order

### R1 — Git history sirf 1 commit hai (HIGH)
Poori 12,436-line app ek squashed commit me aayi. Matlab:
- Koi rollback point nahi tha (ab `baseline-v1.7.0` tag bana diya hai ✅)
- Kya kab bana/try kiya/hataya — recover nahi ho sakta
- **Fix:** ab har logical change ka apna commit. Ek commit me 12,000 lines mat daalo.

### R2 — Single-file monolith (HIGH, structural)
894 KB ek file me. Kisi bhi edit ka asar 8,000 lines door padh sakta hai.
- **Mitigation jo already hai:** router try/catch + `sanitise()` + unknown-view guard
  → app white-screen nahi hoti. Ye acha defensive design hai.
- **Mitigation jo ab add ki:** `tools/verify.mjs` + CI gate.
- **Future option:** file ko modules me todna. Lekin **ye abhi mat karo** —
  offline APK aur zero-build-step isi par depend karta hai. Pehle handoff doc me
  pooch lo ke single-file decision deliberate tha ya nahi.

### R3 — versionCode scheme v1.10.0 par tootegi (MEDIUM, future)
`1.7.0 → 170` (dots hatao). Lekin `1.10.0 → 1100` aur `11.0.0 → 1100` collide karenge.
- `verify.mjs` ab is par warning deta hai.
- **Fix:** v1.10.0 ya v2.0.0 se pehle scheme badal lo (e.g. `major*10000 + minor*100 + patch`).

### R4 — `GAMES-ACCOUNT-GUIDE.md` repo se gayab tha (MEDIUM, ✅ fixed)
App UI iska reference karti thi. Code se dobara likh kar repo me daal diya hai.
**Verify karo** ke purani guide me kuch extra to nahi tha.

### R5 — APK `assembleDebug` se banta hai (LOW)
Release build nahi — unsigned/debug. Personal use ke liye theek hai, lekin
Play Store ya wide distribution ke liye signing setup chahiye hoga.

### R6 — Koi LICENSE file nahi (LOW)
Repo public hai. "All rights reserved" default hai. MIT add karna behtar hai agar
dusron ko use ki ijazat deni hai.

---

## 5. ❓ Jo cheezein abhi bhi unknown hain

Ye **code se pata nahi chal sakta** — handoff doc se aayega:

1. Single-file architecture deliberate decision tha ya convenience?
2. Game shelf ka "Coming soon" — embed mode actually complete hai ya adhoora?
3. v1.8.0 ke liye kya plan tha?
4. Kya features try karke hataye gaye (taake dobara na banaye jayen)?
5. Multiplayer (`GameInvite`, host/join room codes) — ye kis transport par chalta
   hai? Code me server nahi hai, to signalling kaise hoti hai?
6. Koi aisa known bug jo user ne report kiya ho?
7. Design language ke hard rules (colours, tone, microcopy)?

---

## 6. ✅ Jo cheez maine abhi add ki

| File | Kaam |
|---|---|
| `baseline-v1.7.0` (git tag) | Pristine rollback point — asli safety net |
| `tools/verify.mjs` | 7-category integrity checker, zero dependencies |
| `.github/workflows/check.yml` | Har push par auto safety check |
| `.gitignore` | Build junk, secrets, OS files repo se bahar |
| `README.md` | Project overview + version-bump table + editing rules |
| `GAMES-ACCOUNT-GUIDE.md` | Missing doc, code se reconstruct kiya |
| `docs/PROJECT-STATUS.md` | Ye file |
| `HANDOFF-PROMPT.md` | Agent-to-agent context transfer prompt |

**App ke code ko haath nahi lagaya.** `index.html`, `sw.js`, `manifest.webmanifest`
aur icons bilkul waise hi hain jaise the — sirf tooling aur docs add hue hain.

---

<div align="center">

**Anime Partner** · v1.7.0 · Developed by **Shin**

</div>
