# Handoff Prompt — dusre agent se project ka "dimagh" nikalne ke liye

Neeche wala **poora box** copy karo aur apne secondary phone wale agent ko paste kar do.
Uske baad jo file wo banaye, uska naam `PROJECT-HANDOFF.md` rakh kar is repo me daal do
(direct paste kar sakte ho chat me, ya GitHub par upload).

> **Zaroori:** ye prompt jaan-boojh kar agent se **code describe karne ko NAHI kehta**.
> Code to repo me already hai aur naya agent khud padh lega. Jo cheez repo me
> **nahi** hai wo hai: *faislay, roadmap, aapki pasand, aur known bugs*. Sirf wahi
> cheez transfer karni hai. Isse handoff doc chhota, sachcha aur kaam ka banta hai.

---

## ✂️ COPY FROM HERE

```
IMPORTANT — Read fully before answering.

I am moving the "Anime Partner" project to a new coding agent that has FULL access to
the GitHub repo (index.html, sw.js, manifest.webmanifest, icons, .github/workflows/build-apk.yml).
That agent can already read every line of code, run the app, and inspect the files itself.

So DO NOT describe the code back to me. Do NOT list functions, files, line numbers,
CSS classes, or explain how any feature is implemented. The new agent will verify all of
that directly from the source — and if your summary disagrees with the actual code,
your summary will cause bugs. Code facts are the new agent's job.

Your job is ONLY the things that are NOT recoverable from the code: the reasoning,
history, decisions and plans that live in our conversation.

Write a single Markdown file called PROJECT-HANDOFF.md with EXACTLY these sections.
Be concise, factual and blunt. If you do not know something, write "unknown" —
NEVER guess or invent. Accuracy matters far more than length.

## 1. Product intent (5-10 bullet points)
What is this app ultimately meant to become? Who is it for? What is the "soul" of it
that must never be lost? What is the long-term vision beyond v1.7.0?

## 2. Hard rules & constraints
Non-negotiable rules I gave you during our work. Examples of the KIND of things to
recall (only list the ones that are actually true for this project):
- single-file architecture: was this a deliberate decision, and WHY?
- offline-first / no-backend / no-account rules
- privacy rules (no tracking, no analytics, local storage only)
- legal rules (no pirated streams, official platforms only, placeholder artwork policy)
- "Developed by Shin" credit requirement
- APK must work fully offline inside the Android WebView
- design language: colours, fonts, glassmorphism, dark theme, tone of microcopy
- anything I said I would NEVER want changed

## 3. Decisions already made — and WHY
For each significant decision: what we chose, what we rejected, and the reason.
Include UI/UX decisions, data-model decisions, API choices (AniList primary, Jikan
fallback), scoring/recommendation formula choices, game design choices.

## 4. Things we TRIED and ABANDONED
Features, approaches or designs we built or discussed and then removed or rejected,
with the reason. This stops the new agent from re-doing failed work.

## 5. Known bugs & unfinished work (MOST IMPORTANT SECTION)
- Anything currently broken, half-finished, or fragile.
- Any place where you know the code is weak or a hack.
- Any TODO you were aware of but did not finish.
- Any edge case that white-screens or misbehaves.
- Specifically: the "Your own game shelf" card says "Coming soon" and references a file
  called GAMES-ACCOUNT-GUIDE.md. That file is NOT in the repo. Explain what it was,
  what it contained, and whether the game-shelf feature is actually complete.

## 6. Roadmap — what we agreed to do NEXT
In priority order. What was the immediate next task when we stopped? What was planned
for v1.8.0 and beyond? What did I ask for that is still pending?

## 7. My working preferences
How I like to work, so the new agent can match it:
- language I chat in (Roman Urdu / Hindi / English)
- how much explanation I want before vs after a change
- whether I want to be asked before big refactors
- testing/verification expectations
- how I build and install (GitHub Actions APK release, versionCode/versionName bumping)
- anything that annoys me or that I explicitly told you to stop doing

## 8. Version & release state
Current version, versionCode, what changed recently, and what is NOT yet released.

## 9. Open questions for me
Anything you were unsure about, or that I never answered.

RULES FOR WRITING THIS FILE:
- Base every statement on our ACTUAL conversation, not on assumptions.
- If a section has nothing real in it, write "Nothing recorded." Do not pad it.
- Do not include code blocks, file dumps, or re-implementations.
- Do not flatter the project or add marketing language. Plain facts only.
- Target length: 150-400 lines total. Dense and useful beats long and vague.
- At the very top of the file, add this line:
  "Source: conversation with previous agent. Code facts must be verified against the repo."

Output ONLY the file content, ready to save as PROJECT-HANDOFF.md.
```

## ✂️ COPY UNTIL HERE

---

## File milne ke baad kya karna hai

1. Wo `PROJECT-HANDOFF.md` isi repo me daal do (chat me paste kar do, main save kar dunga).
2. Main usse padh kar **repo ke asli code se cross-check** karunga — kyunki AI ka likha hua
   summary kabhi-kabhi purana ya galat hota hai. Jahan doc aur code me farq hua,
   **code jeetega**, aur main aapko wo farq dikha dunga.
3. Phir main ek verified `PROJECT-STATUS.md` banaunga: kya bana hua hai, kya toota hua hai,
   kya missing hai, aage kya karna hai. Aap ek dafa usse check kar lena — uske baad hum
   permanently aligned ho jayenge aur aapko secondary phone ki zaroorat nahi rahegi.
