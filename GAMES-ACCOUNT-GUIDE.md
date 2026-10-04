# 🎮 Game Hub — apni game shelf kaise on karein

> **Note:** ye guide repo se gayab thi jabke app iska reference karti thi
> (`Games → "Full steps: GAMES-ACCOUNT-GUIDE.md"`). Ye version **`index.html` ke
> `AP.GameHub` module ke code se dobara likha gaya hai** — yani jo yahan likha hai
> wo code se verify kiya hua hai. Agar purani guide me kuch extra tha jo yahan
> nahi, to bata dena — add kar dunga.

---

## Pehle samajh lo: do modes hain

App ka Game Hub jaan-boojh kar do imandaar modes me bana hai:

### 1. LINK MODE — default, kisi account ki zaroorat nahi

Curated, well-known, legal browser-game destinations. Kisi par tap karo to wo
**phone ke browser me khulta hai**, clearly labelled as a third-party site.
App kuch host nahi karti, embed nahi karti, aur kuch claim nahi karti.

Built-in links: Poki, CrazyGames, GamePix, Y8, itch.io (web games).

**Ye mode abhi bhi kaam karta hai.** Iske liye kuch karna nahi.

### 2. EMBED MODE — aapke apne publisher account se unlock hota hai

Game networks apne publishers ko har game ka ek **iframe URL** dete hain.
Aap wo URLs app me paste karte ho, app unhe locally store karti hai, aur games
**in-app player** ke andar chalte hain — app chhode baghair.

Ye mode tab on hota hai jab aap kam se kam ek game URL add karo. Tab tak
`Games` screen par "Coming soon" card dikhta hai.

---

## Step-by-step: EMBED MODE on karna

### Step 1 — Free publisher signup

Koi ek network chuno. App in sab ko pehchanti hai:

| Network | Publisher signup | Game host |
|---|---|---|
| **GameMonetize** | `gamemonetize.com` | `html5.gamemonetize.com` |
| **GamePix** | `partners.gamepix.com` | `play.gamepix.com` |
| **GameDistribution** | `gamedistribution.com/publishers/partnership` | `html5.gamedistribution.com` |
| **Gamezop** | `business.gamezop.com` | `play.gamezop.com` |
| Other | — | — |

Sab free hain. Signup par aapko ek **publisher ID** milta hai.

> 💡 **Shuruwaat GameMonetize se karo** — sabse aasan approval aur sabse zyada
> HTML5 catalogue. App ke UI me bhi yahi suggest kiya gaya hai.

### Step 2 — Embed links copy karo

Publisher dashboard me har game ke saath ek embed/iframe URL hota hai,
kuch is shakal ka:

```
https://html5.gamemonetize.com/xxxxxxxx/
```

Wo URL copy karo.

### Step 3 — App me paste karo

App me **Games → "I already have a link"** button, ya **Settings → Game Hub**.

Wahan aap ye bharte ho:
- **Provider** — kaunsa network
- **Publisher ID** — aapka apna ID
- **Game URL** — jo copy kiya tha

Save karte hi shelf bhar jati hai aur games in-app khelne layak ho jate hain.

---

## 🔒 Privacy — ye zaroor padho

- **Aapka publisher ID sirf aapke device par rehta hai.** Wo app ke code me
  hard-coded nahi hai. Wo aapki own save file (`animePartner.v1`) me jata hai
  aur kabhi bhi hata sakte ho.
- **Third-party game frames ko service worker kabhi cache nahi karta.** Ye
  `AP.GameHub` ka hard rule hai.
- **Embed mode ke liye internet zaroori hai** — aur app tap karne se *pehle*
  ye bata deti hai.
- **Offline Game Center hamesha ek tap door hai.** Internet na ho to built-in
  games chalte rehte hain.

---

## ❓ Troubleshooting

**"Coming soon" card abhi bhi dikh raha hai?**
Embed mode tab on hota hai jab `games` array me kam se kam ek entry ho.
Settings → Game Hub me URL save kiya ya nahi, check karo.

**Game in-app khulta hi nahi / blank frame?**
Kuch networks apne iframes par `X-Frame-Options` ya CSP lagate hain jo
WebView me embed rok deta hai. Us network ka direct embed URL use karo
(normal page URL nahi), ya doosra network try karo.

**Game browser me chalta hai lekin app me nahi?**
Confirm karo ke aapne *embed* URL paste kiya hai, *share* URL nahi. Dono alag hote hain.

**Offline par kuch nahi chal raha?**
Ye expected hai — third-party games ko internet chahiye. Built-in offline
Game Center use karo.

---

## ⚖️ Legal

Sirf official publisher networks. Koi pirated game portal, ad-bait mirror ya
unlicensed re-host nahi. App ke Terms ke mutabiq: agar aap modified copy deploy
karo to legal aur non-infringing rakho.

---

<div align="center">

**Anime Partner** · Game Hub guide · Developed by **Shin**

</div>
