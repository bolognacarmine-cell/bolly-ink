Sito dark luxury immersivo 3D per studio tattoo, costruito con [Next.js 16](https://nextjs.org) + React 19 + TypeScript + Tailwind v4 + Three.js + [React Three Fiber](https://r3f.docs.pmnd.rs/) + Drei + GSAP.

---

## Esperienza immersiva

### Concept visivo e direzione artistica

Homepage con hero immersiva 3D ispirata all'estetica **luxury dark**: luci cinematografiche (key calda, fill blu, rim neutro), materiali metallici spazzolati, profondità data da fog esponenziale e un ago stilizzato di tattoo che fluttua nello spazio. Attorno si dipanano **filamenti di inchiostro** con shader GLSL custom per distorsione organica e texture noise, più **particelle luminose additive** (viola glow). Palette nero profondo / viola / oro caldo; tipografia **Cinzel** (serif luxury, headings) e **Inter** (corpo), con film grain sovrapposto e micro-animazioni GSAP per reveal e scroll.

Tutto il contenuto informativo (titoli, paragrafi, CTA, contatti, portfolio) resta **HTML semanticamente valido**: la scena 3D è un layer di atmosfera, mai sostitutivo di informazioni essenziali.

### Obiettivo narrativo della pagina

Trasmettere **precisione, lusso, esclusività, igiene e attenzione al dettaglio** di uno studio tattoo premium, portando l'utente da una hero evocativa fino a una CTA chiara ("Prenota consulenza su WhatsApp"), passando per artista, servizi, portfolio immagini, video, recensioni, CTA finale e contatti.

### Percorso dell'utente dalla Hero alla CTA

1. **Atterraggio**: Hero 100vh con scena 3D visibile dietro il blocco di contenuto. Ago fluttuante, filamenti, particelle, overlay gradiente e immagine hero. Skip link per accessibilità ("Vai alla prenotazione").
2. **Mouse move desktop**: parallax leggero camera (±0.5) e rotazione ago ±15° con damping 0.05.
3. **Scroll**: progressione 0 → 1 che muove dolcemente camera, ago, filamenti e particelle, collegando visivamente le sezioni.
4. **Sezioni**: Artista → Servizi (card 3D tilt) → Portfolio (masonry + lightbox + filtri) → Video gallery → Testimonianze → Final CTA luminosa → Contatti + form.
5. **Conversioni**: CTA WhatsApp sempre sticky in basso a destra + CTA primaria nella hero + CTA finale luminosa + card contatti diretti.

### Ruolo del 3D rispetto ai contenuti HTML

La scena 3D **non contiene mai informazioni essenziali**. È racchiusa in `<ImmersiveScene>` dentro `Hero.tsx` con z-index inferiore ai contenuti, ha `role="presentation"` e viene completamente disattivata (fallback puro 2D gradient) su:
- mobile < 768px
- dispositivo low-end (PerformanceManager)
- `prefers-reduced-motion: reduce`
- WebGL non disponibile

In tutti questi casi l'esperienza HTML rimane **100% funzionale, accessibile e leggibile**.

### Palette colori, tipografia, luci, materiali e atmosfera

| Variabile CSS | Valore | Uso |
|---|---|---|
| `--background` | `#070707` | base |
| `--accent-primary` | `#8b5cf6` (viola) | CTA, link, glow |
| `--accent-primary-darker` | `#6d28d9` | hover |
| `PALETTE.gold` | `#e7c376` | oro, riflessi |
| `PALETTE.fog` | `#070707` | fogExp2 density 0.02 |

- **Luci scena**: 1 SpotLight key, 1 PointLight fill, 1 SpotLight rim, 1 AmbientLight. Ombre dinamiche solo high-end.
- **Materiali**: `MeshStandardMaterial` (metalness 0.6–0.9, roughness 0.2–0.5) per ago; `ShaderMaterial` custom per inchiostro e particelle additive.
- **Atmosfera**: grain 30% `mix-blend-overlay`, `bg-noise` SVG noise ripetuto, contrasto 110, brightness 0.77 sull'immagine hero.

### Comportamento su desktop, tablet e mobile

| Breakpoint | Scena 3D | Filamenti | Particelle | Ombre | Parallax |
|---|---|---|---|---|---|
| Desktop ≥ 1024px | ✅ completa | 4 | 200 | ✅ | ±0.5 |
| Tablet 768–1023 | ✅ ridotta | 2 | 100 | ❌ | ±0.3 |
| Mobile < 768px | ❌ fallback 2D | 0 | 0 | ❌ | ❌ |
| Low-end / reduced-motion | ❌ fallback 2D | 0 | 0 | ❌ | ❌ |

- **DPR adattivo**: 2 max desktop, 1.5 tablet, 1 mobile/low-end (via `useScenePerformance`).
- **Canvas R3F**: `frameloop="demand"` se reduced-motion, altrimenti "always".
- **Lazy load**: `ImmersiveScene` caricato con `next/dynamic`, `ssr: false`.

### Interazioni principali e loro significato

- **Mouse move** (desktop): parallax camera + rotazione ago → "profondità, controllo, precisione".
- **Scroll**: camera zoom/translate + ago rotazione 0→π + filamenti fade out → narrazione "dall'idea al progetto finito".
- **Hover card 3D** (use3DTilt): 4°/8°/12° in base a depth → "premium, tangibile".
- **Reveal on scroll** (IntersectionObserver, 700ms ease-out): ogni sezione entra da y+30 opaco → visibile.
- **Counter**: count up easeOutExpo quando entra in viewport.
- **Portfolio**: filtri per stile + sort data + lightbox keyboard (Esc / ← / →).
- **CTA hover/focus**: anello visibile, transizioni 140–180ms.

### Stati di caricamento, errore e fallback

- **Loading WebGL**: `<SceneLoader>` con `<LoadingSpinner size="lg">` centrato + suspense R3F. Timeout sicurezza 500ms.
- **WebGL non supportato / errore catch**: `<SceneFallback>` con testo "Esperienza 3D non disponibile" + "Il contenuto rimane accessibile".
- **Fallback 2D**: gradienti radiali viola/oro generati in CSS (nessun canvas).
- **Immagini**: `next/image` con `loading="lazy"` e `sizes` responsive. Poster video come fallback.
- **Video**: poster + `preload="metadata"`. Auto-play solo on hover (muted).

### Comportamento con prefers-reduced-motion

Rilevato via hook `usePrefersReducedMotion()` e applicato **in tutti i componenti**:

- HeroImmersive forza fallback 2D gradient.
- ImmersiveScene forza `frameloop="demand"`, 0 particelle, 0 filamenti, reducedMotion ovunque.
- `<Reveal>` disabilita transform, solo fade minimo.
- `<Card3D>` disabilita tilt, `disabled: true`.
- `useParallax` / GSAP scroll ritorna early.
- Immagini hero senza `scale(1.02)`.
- Tutte le transizioni CSS restano ma con durate minori.

### Requisiti SEO e accessibilità

- **Metadata**: `app/layout.tsx` → title template, description, keywords, canonical, **Open Graph** (1200×630 hero.jpg), **Twitter summary_large_image**, robots + googleBot, icons, category "Tattoo Studio", `viewport` con `themeColor: #070707`.
- **Semantica**: `<header>`, `<main>`, `<section id>` (scroll-mt-24), `<footer>`, heading in ordine logico h1→h2→h3. `<figure>`/`<blockquote>` per testimonianze, `<article>` per video.
- **Skip link**: `Vai alla prenotazione` sr-only visibile on focus.
- **Contrasto**: bianco #f3f4f6 su nero #070707 (WCAG AA oltre 4.5:1). Accento viola #8b5cf6 testato per testo secondario.
- **Focus**: `:focus-visible { outline 2.5px solid accent }` globale. Tutta la UI navigabile via tastiera.
- **Alt**: tutte le immagini Next hanno alt descrittivo. Portfolio ha stile + data in lightbox.
- **Canvas 3D**: nessun testo essenziale dentro. `aria-hidden="true"` quando è fallback. `role="presentation"` sugli elementi decorativi.
- **Lingua**: `<html lang="it">`.
- **Lighthouse-friendly**: no testo dentro canvas, contenuti tutti fuori.

---

## Ottimizzazioni performance applicate

- **R3F idiomatico**: sostituito il vecchio approccio Three.js vanilla (multipli useEffect con cleanup manuale e mappe di oggetti) con un singolo `<Canvas>` + componenti dichiarativi. Meno memory leak, meno draw call manuali, lifecycle gestito da R3F.
- **Geometrie low-poly**: ago con Cylinder/Cone a 32 segmenti, TubeGeometry 64×8. Nessun GLB esterno per evitare overhead.
- **Shader custom**: Ink e Glow scritti a mano con GLSL minimale, 3–5 uniforms, loop di vertici minimali.
- **Particelle limitate**: 0/50/100/200 in base a device, `AdditiveBlending`, `depthWrite=false`.
- **DPR adattivo**: `dpr={[1, perf.pixelRatio]}` in Canvas, max 2 su desktop, 1 su low-end/mobile.
- **Ombre dinamiche**: solo high-end, ContactShadows 256px resolution per soft-shadows veloci.
- **Lazy load 3D**: `next/dynamic(..., { ssr: false })`, caricamento solo client-side.
- **Environment preset=night**: solo high-end, evita hdr grandi.
- **GSAP**: usato solo dove serve davvero (parallax, scroll). ScrollTrigger con cleanup `kill()` negli useEffect return.
- **Immagini**: `next/image` AVIF/WebP auto, `sizes` per ogni breakpoint, `loading="lazy"` fuori hero.
- **Font**: `next/font/google` con `display=swap`, zero layout shift.
- **Cleanup completo**: geometrie/materiali dispose automatico R3F. Nessun listener manuale persistente.
- **Responsive DPR + PerformanceManager**: rilevamento low-end (mobile + cores<4) → livello low.
- **`frameloop="demand"`**: se reduced-motion, la scena renderizza solo al mount.

---

## Stack tecnico

- **Next.js 16.2.9** (Turbopack, App Router)
- **React 19.2.4** + **TypeScript 5** (strict: true)
- **Tailwind CSS v4** con `@tailwindcss/postcss`, tema inline e variabili CSS
- **three 0.185**, **@react-three/fiber 9.6**, **@react-three/drei 10.7**
- **gsap 3.15** (ScrollTrigger, timeline, ease)
- **Decap-style admin** in `/app/admin` (upload media)

---

## Quick start

```bash
npm install
npm run dev
# http://localhost:3000
```

## Build produzione

```bash
npm run build
npm run start
```

Lint: `npm run lint`.

## Contenuti (immagini e video)

- `content/media.json` → unica sorgente di verità per portfolio + video, caricato server-side via `getMedia()`.
- `public/portfolio/p01…p08.jpg` → immagini demo.
- `public/video-posters/v01…v03.jpg` → poster. MP4 opzionali in `public/videos/` (sostituisci `src` nel media.json).
- `public/hero/hero.jpg` → hero background.
- `public/about/chritatto.webp` → artista.
- `admin panel` → `/admin` (proteggi in produzione con auth; in deploy serverless usa S3/R2 o un CMS per persistenza file).

## Branding e SEO finale

- Sostituisci `siteUrl` in `app/layout.tsx` col dominio reale (aggiorna metadataBase, OG url, canonical).
- Logo: `public/logo.svg` / `public/logo.jpg`.
- Favicon: `public/favicon.ico`.
- Dati studio: `data/site.ts` (brand, nome artista, tagline, contatti, servizi, portfolio, testimonianze).

---

## File nuovi / modificati in questa sessione

**Nuovi:**
- `components/immersive/ImmersiveScene.tsx` — scena R3F completa (ago, filamenti, particelle, lighting, camera, contact shadows, suspense, fallback).
- `components/sections/FinalCTA.tsx` — CTA finale luminosa prima dei contatti.

**Modificati sostanzialmente:**
- `components/HeroImmersive.tsx` — ora wrapper dynamic con fallback 2D + performance check.
- `app/layout.tsx` — metadata completo SEO, OG, Twitter, viewport, themeColor, title template.
- `app/page.tsx` — aggiunta `<FinalCTA>`.
- `lib/three/performance.ts` — corretto `def → export function`, rimosso export duplicato.
- `components/sections/Hero.tsx` — sostituito `<ImmersiveExperience>` → `<HeroImmersive>` (già in diff locale).
- `components/Hero3D.tsx` — rimosso banner debug e console.log (non più usato, sostituito da ImmersiveScene).
- `README.md` — documentazione completa esperienza, architettura, SEO, performance, quick-start.

**Non più usati ma mantenuti per retro-compatibilità:**
- `components/Hero3D.tsx`, `components/immersive/ImmersiveExperience.tsx`, `components/immersive/CameraRig.tsx`, `NeedleObject`, `PortfolioScene`, `InkTrail`, `SceneLighting.tsx` (approccio vanilla Three.js).
