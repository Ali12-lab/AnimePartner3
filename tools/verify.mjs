#!/usr/bin/env node
/* =====================================================================
   Anime Partner — repo safety checker
   Developed by Shin.

   Bina kisi dependency ke chalta hai:  node tools/verify.mjs

   Ye tool app ko CHANGE nahi karta. Ye sirf 7 cheezein check karta hai
   jo silently toot sakti hain aur phone par white-screen ya purana
   cache dikha sakti hain:

     1. index.html ka inline JavaScript syntax ke lihaz se valid hai
     2. version chaaron files me ek jaisa hai (index/sw/workflow)
     3. jo files app/SW reference karte hain wo repo me maujood hain
     4. har navigation target ka AP.Views handler defined hai
     5. manifest.webmanifest valid JSON hai aur icons exist karte hain
     6. HTML ke <script>/<style> blocks balanced hain
     7. koi dangling .md reference to nahi

   Exit code 0 = sab theek.  Exit code 1 = kuch toota hua hai.
   ===================================================================== */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

let failures = 0;
let warnings = 0;
let checks = 0;
const ok = (msg) => { checks++; console.log(`  \x1b[32m✔\x1b[0m ${msg}`); };
const bad = (msg, hint) => {
  checks++; failures++;
  console.log(`  \x1b[31m✘\x1b[0m ${msg}`);
  if (hint) console.log(`      \x1b[33m→ ${hint}\x1b[0m`);
};
/* warn = toota hua nahi, lekin dhyan dene layak. Build block nahi karta. */
const warn = (msg, hint) => {
  checks++; warnings++;
  console.log(`  \x1b[33m⚠\x1b[0m ${msg}`);
  if (hint) console.log(`      \x1b[2m→ ${hint}\x1b[0m`);
};
const section = (t) => console.log(`\n\x1b[1m${t}\x1b[0m`);

console.log("\n\x1b[1mAnime Partner — repo safety check\x1b[0m");

/* ---------- load the files we need ---------- */
let html, sw, workflow, manifestRaw;
try {
  html = read("index.html");
  sw = read("sw.js");
  workflow = read(".github/workflows/build-apk.yml");
  manifestRaw = read("manifest.webmanifest");
} catch (e) {
  console.error(`\n\x1b[31mFATAL: zaroori file nahi padhi ja saki — ${e.message}\x1b[0m`);
  process.exit(1);
}

/* =====================================================================
   1. inline JavaScript syntax
   ===================================================================== */
section("1. JavaScript syntax");
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
  .map((m) => m[1])
  .filter((s) => s.trim().length > 0);

if (scripts.length === 0) {
  bad("index.html me koi inline <script> nahi mila");
} else {
  scripts.forEach((code, i) => {
    try {
      new vm.Script(code, { filename: `index.html#script-${i + 1}` });
      ok(`script block ${i + 1} parse ho gaya (${code.split("\n").length} lines)`);
    } catch (err) {
      bad(`script block ${i + 1} me SyntaxError`, err.message);
    }
  });
}

/* =====================================================================
   2. version consistency — ye sabse common silent bug hai
   ===================================================================== */
section("2. Version consistency");
const vApp = html.match(/AP\.VERSION\s*=\s*"([^"]+)"/)?.[1];
const vSw = sw.match(/const VERSION\s*=\s*"ap-v([^"]+)"/)?.[1];
const vName = workflow.match(/versionName\s+"([^"]+)"/)?.[1];
const vCode = Number(workflow.match(/versionCode\s+(\d+)/)?.[1]);
const vDataVer = [...html.matchAll(/data-ver>([\d.]+)</g)].map((m) => m[1]);
const vApk = workflow.match(/AnimePartner-v([\d.]+)\.apk/)?.[1];

if (!vApp) bad("AP.VERSION index.html me nahi mila");
else ok(`AP.VERSION = ${vApp}`);

if (vSw && vSw !== vApp) bad(`sw.js version "${vSw}" ≠ app version "${vApp}"`, "Purana cache clear nahi hoga — users ko update nahi milega");
else if (vSw) ok(`sw.js version match karta hai (ap-v${vSw})`);

if (vName && vName !== vApp) bad(`build-apk.yml versionName "${vName}" ≠ app "${vApp}"`);
else if (vName) ok(`APK versionName match karta hai (${vName})`);

if (vApk && vApk !== vApp) bad(`APK filename v${vApk} ≠ app v${vApp}`);
else if (vApk) ok(`APK filename match karta hai`);

const drifted = vDataVer.filter((v) => v !== vApp);
if (drifted.length) bad(`${drifted.length} jagah hard-coded data-ver "${drifted[0]}" ≠ ${vApp}`, "Sidebar/footer me galat version dikhega");
else if (vDataVer.length) ok(`${vDataVer.length} data-ver spots consistent hain`);

/* Is project ka scheme: versionName ke dots hatao → versionCode.
   "1.7.0" → 170.  Note: ye scheme 2-digit components par ambiguous ho jata
   hai (1.10.0 aur 1.1.0 dono → 1100 / 110), isliye v2.0.0 se pehle
   scheme badalna parega. Filhal consistency check kaafi hai. */
if (vApp && vCode) {
  const expected = Number(vApp.replace(/\./g, ""));
  if (vCode !== expected) {
    bad(`versionCode ${vCode} — "${vApp}" ke liye expected ${expected}`,
      "Android isse update nahi samjhega; install par 'app not installed' aa sakta hai");
  } else ok(`versionCode ${vCode} = "${vApp}" ke dots hatane se (scheme consistent)`);
}
if (vCode && vCode < 100) warn(`versionCode ${vCode} bahut chhota hai`);
const twoDigit = (vApp || "").split(".").some((n) => n.length > 1 && vApp.split(".").indexOf(n) > 0 && Number(n) >= 10);
if (twoDigit) warn(`versionName "${vApp}" me 2-digit component hai — dots-remove scheme ambiguous ho gaya hai`, "versionCode manually soch kar set karo");

/* =====================================================================
   3. referenced files actually exist
   ===================================================================== */
section("3. Referenced files");
const swFiles = [...sw.matchAll(/^\s*"(\.\/[^"]+)"/gm)].map((m) => m[1]);
swFiles.forEach((f) => {
  const p = f.replace("./", "");
  if (f === "./") return ok("SW shell: './' (root)");
  if (existsSync(join(ROOT, p))) ok(`SW shell file maujood hai: ${p}`);
  else bad(`sw.js "${p}" cache karta hai lekin file repo me nahi hai`, "Offline par 404 → install fail");
});

/* =====================================================================
   4. every navigation target has a view handler
   ===================================================================== */
section("4. Navigation → view handlers");
const definedViews = new Set(
  [...html.matchAll(/AP\.Views\.([a-zA-Z0-9_]+)\s*=\s*function/g)].map((m) => m[1])
);

/* Sirf woh ids lo jo ASAL me routing karte hain. Pehle version me maine
   {id:"..",label:"..",icon:".."} ka loose pattern use kiya tha — usne
   AP.Tracker.STATUSES ("completed") ko route samajh kar jhootha alarm
   diya. Isliye ab NAV array ko explicitly parse karte hain. */
const navBlock = html.match(/const NAV=\[([\s\S]*?)\];/)?.[1] || "";
const navIds = [...navBlock.matchAll(/\{id:"([a-z0-9_]+)"/g)].map((m) => m[1]);

const bottomBlock = html.match(/const BOTTOM_NAV=\[([^\]]*)\]/)?.[1] || "";
const bottomIds = [...bottomBlock.matchAll(/"([a-z0-9_]+)"/g)].map((m) => m[1]);

const targets = new Set([
  ...navIds,
  ...bottomIds,
  ...[...html.matchAll(/\.go\("([a-z0-9_]+)"/g)].map((m) => m[1]),
  ...[...html.matchAll(/data-goto="([a-z0-9_]+)"/g)].map((m) => m[1]),
  ...[...html.matchAll(/data-nav="([a-z0-9_]+)"/g)].map((m) => m[1]),
]);

/* "anime/:id" jaise parameterised routes plain view names nahi hote. */
const missing = [...targets].filter((t) => !definedViews.has(t));
if (missing.length) {
  bad(`${missing.length} navigation target(s) ka koi AP.Views handler nahi: ${missing.join(", ")}`,
    "Router sirf console.warn karega — button dabane par kuch nahi hoga");
} else {
  ok(`saare ${targets.size} navigation targets ke handlers defined hain`);
}
if (navIds.length) ok(`NAV array: ${navIds.length} sections (${navIds.join(", ")})`);
if (bottomIds.length) {
  const badBottom = bottomIds.filter((b) => !navIds.includes(b));
  if (badBottom.length) bad(`BOTTOM_NAV me aise id hain jo NAV me nahi: ${badBottom.join(", ")}`, "Mobile bottom bar par button gayab rahega");
  else if (bottomIds.length > 5) warn(`BOTTOM_NAV me ${bottomIds.length} items hain`, "Android bottom bar 5 destinations par top out hota hai");
  else ok(`BOTTOM_NAV: ${bottomIds.length} items, sab NAV me maujood (Android limit ≤5 theek)`);
}
ok(`${definedViews.size} total views defined`);

/* =====================================================================
   5. manifest validity + icons
   ===================================================================== */
section("5. Web manifest");
let manifest;
try {
  manifest = JSON.parse(manifestRaw);
  ok("manifest.webmanifest valid JSON hai");
} catch (err) {
  bad("manifest.webmanifest parse nahi hua", err.message);
}
if (manifest) {
  ["name", "short_name", "start_url", "display", "theme_color", "background_color"]
    .forEach((k) => manifest[k] ? ok(`manifest.${k} set hai`) : bad(`manifest.${k} missing`));
  (manifest.icons || []).forEach((ic) => {
    const p = ic.src.replace("./", "");
    if (existsSync(join(ROOT, p))) ok(`icon maujood: ${p} (${ic.sizes} ${ic.purpose})`);
    else bad(`icon "${p}" manifest me declared hai lekin file nahi hai`, "PWA install fail hoga");
  });
  const hasMaskable = (manifest.icons || []).some((i) => i.purpose?.includes("maskable"));
  const hasAny = (manifest.icons || []).some((i) => i.purpose?.includes("any"));
  if (hasMaskable && hasAny) ok("dono icon purposes ('any' + 'maskable') maujood hain");
  else bad("icon purposes adhoore hain — Android adaptive icon theek nahi banega");
}

/* =====================================================================
   6. HTML structural sanity
   ===================================================================== */
section("6. HTML structure");
const openS = (html.match(/<script\b/gi) || []).length;
const closeS = (html.match(/<\/script>/gi) || []).length;
if (openS === closeS) ok(`<script> tags balanced (${openS})`);
else bad(`<script> tags unbalanced: ${openS} open vs ${closeS} close`, "Poora JS tutega");

const openSt = (html.match(/<style\b/gi) || []).length;
const closeSt = (html.match(/<\/style>/gi) || []).length;
if (openSt === closeSt) ok(`<style> tags balanced (${openSt})`);
else bad(`<style> tags unbalanced: ${openSt} open vs ${closeSt} close`);

['id="app"', 'id="view"', 'id="bottomNav"', 'id="sideNav"', 'id="modalRoot"', 'id="toasts"']
  .forEach((needle) => html.includes(needle) ? ok(`required element ${needle} maujood hai`) : bad(`required element ${needle} GAYAB`, "App mount nahi hogi"));

/* =====================================================================
   7. dangling documentation references
   ===================================================================== */
section("7. Documentation references");
const mdRefs = [...new Set([...html.matchAll(/([A-Z][A-Z0-9_-]*\.md)/g)].map((m) => m[1]))];
if (mdRefs.length === 0) ok("app kisi .md file ka zikr nahi karti");
mdRefs.forEach((f) => {
  if (existsSync(join(ROOT, f)) || existsSync(join(ROOT, "docs", f))) ok(`referenced doc maujood: ${f}`);
  /* warning, failure nahi: ek gayab doc se build unsafe nahi hota.
     CI ko sirf tab laal hona chahiye jab app sach me tooti ho — warna
     user laal ✘ dekh kar ignore karna shuru kar dega. */
  else warn(`app "${f}" reference karti hai lekin file repo me nahi`, "User ko wo instructions nahi milengi — UI me dead reference hai");
});

/* ===================================================================== */
console.log("");
if (failures === 0) {
  const tail = warnings ? ` (${warnings} warning${warnings > 1 ? "s" : ""} — build block nahi hoga)` : "";
  console.log(`\x1b[42m\x1b[30m SAB THEEK \x1b[0m  ${checks - warnings}/${checks} checks pass${tail} — build ke liye safe hai.\n`);
  process.exit(0);
} else {
  console.log(`\x1b[41m\x1b[37m ${failures} MASLA \x1b[0m  ${checks - failures - warnings}/${checks} pass, ${warnings} warning(s).\n`);
  process.exit(1);
}
