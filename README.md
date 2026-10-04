# 🌸 Anime Partner

**Your personal anime companion** — discover anime and movies, track every episode,
learn Japanese and play games. Fully offline-first. No account, no server, no tracking.

Developed by **Shin** · Current version **v1.7.0**

[![Safety check](https://github.com/Ali12-lab/AnimePartner3/actions/workflows/check.yml/badge.svg)](https://github.com/Ali12-lab/AnimePartner3/actions/workflows/check.yml)

---

## 📱 Get the app

**Android (APK):** Releases page se `AnimePartner-vX.Y.Z.apk` download karo →
"Unknown sources" allow karo → Install. Poori app APK ke andar bundled hai,
internet ke baghair chalti hai.

APK banane ke liye: GitHub → **Actions** → **Build APK** → *Run workflow*.
Build khatam hone par APK direct **Releases** me publish ho jati hai.

**Browser / PWA:** `index.html` ko kisi bhi static host par daalo, ya locally
`python3 -m http.server` chala kar `http://localhost:8080` kholo. Chrome/Edge me
"Install app" se home-screen shortcut ban jata hai.

> ⚠️ `file://` se directly mat kholo — service worker aur kuch APIs ko `http(s)` origin chahiye.

---

## ✨ What's inside

| Section | Kya karta hai |
|---|---|
| 🏠 **Home** | Personalised feed, stats, daily quests, progress |
| 🧭 **Discover** | Recommendations — har card batata hai ke wo *kyun* dikha |
| 🎬 **Movies** | Anime films, decade-wise browsing |
| 📺 **Tracker** | Episode-by-episode tracking, 5 status types, ratings, favourites |
| 🎮 **Games** | ~20 built-in mini-games + optional third-party HTML5 shelf |
| 🇯🇵 **Japanese** | Kana trainer, 6 phrase decks, quizzes, flashcards |
| ❓ **FAQ** | Help, feedback form |
| 🧑‍🎤 **Profile** | Taste profile, favourite characters, Anime IQ, waifu/husbando match |

Plus: achievements, quests, focus/study timer, quotes, data backup & restore,
multiplayer room codes (host/join), theme switcher, haptics and sound.

**49 screens total.** Architecture, data model aur poora feature map ke liye
→ **[`docs/PROJECT-STATUS.md`](docs/PROJECT-STATUS.md)**

---

## 🗂 Repository layout

```
AnimePartner3/
├── index.html              ← poori app (HTML + CSS + JS, ~12,400 lines)
├── sw.js                   ← offline service worker (shell + image caching)
├── manifest.webmanifest    ← PWA manifest (icons, shortcuts, theme)
├── icon-*.png              ← 5 app icons (96/192/512, any + maskable)
├── tools/
│   └── verify.mjs          ← ⭐ repo safety checker (koi dependency nahi)
├── docs/
│   └── PROJECT-STATUS.md   ← verified architecture + feature map + risks
├── .github/workflows/
│   ├── check.yml           ← har push par safety check (auto)
│   └── build-apk.yml       ← APK build + release (manual trigger)
├── GAMES-ACCOUNT-GUIDE.md  ← third-party game shelf setup
├── HANDOFF-PROMPT.md       ← agent-to-agent context transfer prompt
└── README.md
```

**Ye repo intentionally dependency-free hai** — koi `package.json`, `node_modules`,
build step ya framework nahi. `index.html` hi app hai.

---

## 🛡️ Safety checker — sabse zaroori tool

Har edit ke baad, aur har APK build se pehle:

```bash
node tools/verify.mjs
```

Ye app ko **change nahi karta** — sirf 7 categories check karta hai jo *silently*
toot sakti hain:

1. **JavaScript syntax** — inline script parse hota hai ya nahi
2. **Version consistency** — `AP.VERSION`, `sw.js`, `versionName`, `versionCode`,
   APK filename aur hard-coded `data-ver` spots sab ek jaise hain
3. **Referenced files** — jo files `sw.js` cache karta hai wo repo me maujood hain
4. **Navigation integrity** — har nav target ka `AP.Views` handler defined hai
5. **Manifest validity** — valid JSON, icons exist, `any` + `maskable` dono hain
6. **HTML structure** — `<script>`/`<style>` balanced, zaroori mount points maujood
7. **Documentation refs** — koi dangling `.md` reference to nahi

**Exit code 0 = build safe. 1 = kuch toota hua hai.**

Check #2 sabse important hai: version drift ka matlab hai ke users ko update nahi
milega aur purana cache chipka rahega — ye bug phone par *dikhta nahi*, sirf
"update nahi aaya" ki shakal me samne aata hai.

Ye check GitHub Actions me har push par automatically chalta hai
(`.github/workflows/check.yml`), aur APK build se pehle bhi gate lagata hai.

---

## 🔄 Version bumping — 5 jagah badalna zaroori hai

Nayi release ke liye ye sab **ek saath** update karo:

| # | File | Field |
|---|---|---|
| 1 | `index.html` | `AP.VERSION = "X.Y.Z";` |
| 2 | `index.html` | `<span data-ver>X.Y.Z</span>` (2 jagah — sidebar + footer) |
| 3 | `sw.js` | `const VERSION = "ap-vX.Y.Z";` |
| 4 | `build-apk.yml` | `versionName "X.Y.Z"` |
| 5 | `build-apk.yml` | `versionCode` + APK filename |

**versionCode scheme:** versionName ke dots hata do → `1.7.0` = `170`.

> ⚠️ Ye scheme tab ambiguous ho jayega jab koi component 2-digit ho jaye
> (`1.10.0` → `1100` aur `1.1.0` → `110` theek hai, lekin `1.10.0` aur `11.0.0`
> dono `1100` banenge). **v2.0.0 ya v1.10.0 se pehle scheme badal lena** —
> `verify.mjs` is par warning dega.

Bhool jao to koi baat nahi — `node tools/verify.mjs` pakad lega.

---

## 🧱 Architecture (short version)

- **Single-file monolith.** `index.html` me HTML + CSS + JS sab kuch hai.
  Ye ek deliberate choice hai (offline APK, zero build step) — lekin iska matlab
  hai ke har edit me care chahiye.
- **Namespace pattern.** Sab kuch `AP.*` ke neeche: `AP.UI` (router), `AP.Views`
  (49 screens), `AP.Storage`, `AP.API`, `AP.Data`, `AP.Tracker`, `AP.Games`,
  `AP.Japanese`, `AP.Sound`, `AP.Notify`, `AP.Offline`, `AP.Settings`, waghera.
- **Hash router.** `AP.UI.go(view, params)` → `AP.Views[view]` → render into `#view`.
  Unknown view par sirf `console.warn`, aur render error par built-in error state —
  isliye app kabhi white-screen nahi hoti.
- **State.** Ek hi localStorage key: `animePartner.v1`. Artwork cache alag:
  `animePartner.media.v1`. `AP.Storage.sanitise()` hand-edited/corrupt save ko
  bhi recover kar leta hai.
- **Data.** AniList GraphQL primary, Jikan (MyAnimeList) fallback. Bundled sample
  catalogue offline fallback ke liye hai.
- **Offline.** `sw.js`: shell cache-first, artwork cache-first→network→SVG
  placeholder, API network-only with soft JSON fallback.

Poori tafseel → **[`docs/PROJECT-STATUS.md`](docs/PROJECT-STATUS.md)**

---

## 🚨 Contributing / editing rules

1. **Har edit ke baad `node tools/verify.mjs` chalao.** Ye non-negotiable hai.
2. **Har logical change ka apna commit.** Ek commit me 12,000 lines mat daalo —
   rollback ka raasta band ho jata hai.
3. **App ko browser me khol kar test karo**, sirf syntax check kaafi nahi.
4. **`index.html` 894 KB ka hai** — poora file dobara likhne ke bajaye targeted
   edits karo.
5. Naya screen add karna ho to teen jagah: `AP.Views.<id>`, `NAV` array, aur
   (mobile ke liye) `BOTTOM_NAV` — lekin BOTTOM_NAV **5 se zyada nahi**.

---

## 🔒 Privacy & legal

- **Koi data device se bahar nahi jata.** No account, no server, no analytics,
  no cookies, no fingerprinting, no ad networks.
- Sirf teen third-party requests: AniList (metadata), AniList CDN (images),
  Jikan (fallback). Inhe sirf search title ya numeric ID jata hai.
- **No piracy.** App koi episode host, stream, mirror ya embed nahi karti.
  "Where to Watch" sirf official licensed platforms par le jata hai.
- Saara artwork ya to official CDN se load hota hai, ya locally generated
  abstract placeholder art hai — kabhi bhi official artwork re-host nahi hota.
- Taste Profile, Anime IQ aur Partner matching **entertainment only** hain —
  transparent scoring games, koi psychological assessment nahi.

Details: in-app **Settings → Privacy Policy / Terms / Disclaimer**.

---

## 📄 License

Abhi koi license file nahi hai. Agar ye repo public rahega to ek license add karna
behtar hai (MIT sabse aasan). Filhal: **all rights reserved** — anime titles,
characters, studios, artwork aur trademarks apne respective owners ke hain.
Ye project kisi studio, publisher ya streaming platform se affiliated nahi hai.

---

<div align="center">

**Anime Partner** · v1.7.0 · Developed by **Shin** 🌸

</div>
