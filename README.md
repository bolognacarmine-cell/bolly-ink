Sito dark luxury per tatuatore, costruito con [Next.js](https://nextjs.org) + Tailwind.

## Esperienza immersiva

### Concept visivo e direzione artistica

L’homepage e la Hero offrono un ambiente 3D immersivo ispirato all’estetica luxury dark: luci calde e riflessi metallici risaltano un grande ago stilizzato che disegna nello spazio filamenti di inchiostro. L’effetto richiama il gesto contemporaneo e sacro della tattoo art, tra tecnologia, luce, materia e rito. L’atmosfera è evocativa, materica, elegante, integrata con la palette nero/viola/oro e dettagli soft glow.

### Obiettivo narrativo della pagina

Coinvolgere l’utente immergendolo nell’universo artistico dello studio, trasmettendo cura del dettaglio, professionalità ed esclusività. L’esperienza comunica subito il valore del brand attraverso elementi visuali e micro-animazioni che scandiscono il percorso dall’arrivo fino all’invito alla prenotazione.

### Percorso dell’utente dalla Hero alla CTA

1. L’utente atterra su una hero immersiva 3D con ago, filamenti e particelle, che reagisce a movimento e scroll.
2. Le animazioni guidano lo sguardo: da un’inquadratura iniziale suggestiva, il focus si sposta verso la presentazione dei valori e la call to action (“Prenota subito su WhatsApp” o "Contattami").
3. Continuando a scorrere, la scena 3D accompagna dolcemente la transizione verso i contenuti portfolio, video, e aree informative.
4. L’intera esperienza crea una narrazione fluida che culmina nella CTA primaria, sempre accessibile, invitando alla prenotazione esclusiva.

### Ruolo del 3D rispetto ai contenuti HTML

La scena 3D non sostituisce mai i contenuti informativi, ma li avvolge e li esalta come un layer immersivo visivo. I contenuti testuali e le CTA restano completamente accessibili in HTML per SEO e accessibilità. Il 3D fornisce profondità emozionale, transizioni fluide e ambientazioni di forte impatto, arricchendo la percezione senza bloccare la navigazione o la leggibilità.

### Palette colori, tipografia, luci, materiali e atmosfera

- **Colori**: Dominante nero profondo, tocchi di viola/fucsia glow, oro caldo per i riflessi metallici. Accenti bianco caldo per la light key e ombreggiature blu per il fill.
- **Tipografia**: Titoli in Cinzel (serif elegante, branding premium), testi e CTA in Inter (neo-grotesk pulito e leggibile).
- **Luci**: Light rig cinematografico con key chiaro, fill blu freddo, rim neutro e ambient scuro per profondità.
- **Materiali scene**: Mix di metalli spazzolati (needle, dettagli) e shader custom per filamenti di inchiostro, particelle soft glow e trasparenze delicate.
- **Atmosfera**: Evocativa, rarefatta, di grande eleganza ed espressività. Texture leggere/grain, effetto fog e transizioni morbide.

### Comportamento su desktop, tablet e mobile

- **Desktop (≥1024px)**: Scena 3D completa con ago, filamenti d'inchiostro (4), particelle (200), animazioni mouse e scroll. Camera FOV 45°, parallax limitato a ±0.5, rotazioni fluide con damping 0.05.
- **Tablet (768-1023px)**: Scena 3D ridotta con filamenti (2-3), particelle (100), animazioni semplificate. Camera FOV 50°, parallax ridotto.
- **Mobile (<768px)**: Fallback 2D automatico - nessuna scena 3D per garantire performance e batteria. Contenuto HTML completamente accessibile con immagine hero statica.

### Interazioni principali e loro significato

- **Mouse movement**: Rotazione delicata dell'ago (±15°) e parallax camera (±0.5) per creare profondità senza disorientare. Damping 0.05 per movimenti fluidi.
- **Scroll**: Progressione narrativa della scena - ago ruota e si sposta, filamenti guidano l'occhio verso le sezioni successive. GSAP ScrollTrigger con scrub 1 per transizioni morbide.
- **Hover/focus HTML**: Stati accessibili su tutti i link e pulsanti con anello di focus visibile e transizioni colore coerenti.
- **Touch**: Su tablet, touch events mappati a mouse movement per interazioni simili.

### Stati di caricamento, errore e fallback

- **Loading**: Spinner durante inizializzazione WebGL (max 500ms), fade-in canvas opacity 0.5s. LoadingSpinner componente riutilizzabile.
- **Error**: Fallback SceneFallback con messaggio "Esperienza 3D non disponibile" se WebGL non supportato. Catch try-catch in Hero3D e ImmersiveExperience.
- **Fallback 2D**: Immagine hero statica con gradient overlay quando 3D disabilitato (mobile, reduced-motion, no WebGL).
- **Reduced motion**: Disabilita completamente rotazioni, parallax, animazioni shader e scroll-linked movements. Canvas non renderizzato, fallback 2D attivo.

### Comportamento con prefers-reduced-motion

Rilevato via `window.matchMedia('(prefers-reduced-motion: reduce)')`. Quando attivo:
- Nessuna scena 3D renderizzata
- Nessuna animazione CSS (transform, opacity transitions disabilitate)
- Immagini statiche senza scale/transform
- Focus visibile su tutti gli elementi interattivi
- Contenuto completamente accessibile via tastiera

### Requisiti SEO e accessibilità

- **Metadata**: Title, description, Open Graph, Twitter cards in layout.tsx. metadataBase configurabile per dominio.
- **Semantica HTML**: Heading h1-h6 in ordine logico, nav, main, section, footer semanticamente corretti.
- **Contrasto**: Testo bianco su sfondo nero/gradient, ratio ≥4.5:1. Accenti viola/oro per CTA con contrasto sufficiente.
- **Focus**: anello focus visibile su tutti gli elementi interattivi, skip-link "Vai alla prenotazione" per navigazione rapida.
- **Keyboard**: Navigazione completa via tab, aria-label su canvas 3D descrittivo ma non essenziale.
- **Alt text**: Tutte le immagini hanno alt descrittivo. Canvas 3D ha role="img" ma contenuto essenziale in HTML.
- **CTA accessibili**: Pulsanti WhatsApp e contatti raggiungibili senza interagire con canvas, sempre in HTML.

### Ottimizzazioni performance applicate

- **Geometrie low-poly**: Ago creato con primitive semplici (Cylinder, Cone) con segmenti minimi (32) per mantenere poligoni bassi.
- **Texture compresse**: Nessuna texture pesante - shader procedurali per effetti inchiostro e glow.
- **Pixel ratio adattivo**: DPR limitato a 2 su desktop, 1 su mobile/low-end via PerformanceManager.
- **Luci ottimizzate**: 4 luci totali (key, fill, rim, ambient), ombre disabilitate su low-end.
- **Batching**: Geometrie riutilizzate dove possibile, draw call ridotte.
- **Lazy loading**: Hero3D caricato dinamicamente con next/dynamic, SSR disabilitato.
- **Dispose completo**: Geometrie, materiali e texture dispose in cleanup per evitare memory leak.
- **Adaptive quality**: Particelle e filamenti ridotti su mobile (50 vs 200, 2 vs 4).
- **Framerate stabile**: Animation loop ottimizzato, useFrame solo quando necessario.
- **Mobile fallback**: Scena 3D disabilitata completamente su <768px per batteria e performance.
- **Device detection**: PerformanceManager rileva hardware e adatta qualità automaticamente.
- **No post-processing pesante**: Shader custom leggeri invece di effetti postprocessing costosi.
- **Scroll throttling**: GSAP ScrollTrigger con scrub 1 per performance scroll.

1. Installa dipendenze

```bash
npm install
```

2. Avvia in locale

```bash
npm run dev
```

Apri `http://localhost:3000`.

## Contenuti (immagini/video)

- Media (portfolio + video) stanno in `content/media.json`.
- Immagini in `public/portfolio/`
- Poster video in `public/video-posters/`
- (Opzionale) Video in `public/videos/` se vuoi servire MP4 localmente.

Nota: per demo i video puntano a MP4 esterni, sostituiscili con i tuoi file in produzione.

## Pannello admin (upload)

Visita `http://localhost:3000/admin` per caricare:
- Immagini portfolio (jpg/png/webp)
- Video (mp4) + poster (jpg/png)

L’admin salva i file dentro `public/` e aggiorna automaticamente `content/media.json`.

Importante:
- Proteggi `/admin` in produzione (auth).
- Se deploy su serverless (es. Vercel) lo storage locale non è persistente: usa S3/R2 o un headless CMS.

## Branding e SEO

- Logo: sostituisci `public/logo.svg` con il tuo.
- Hero: `public/hero/hero.jpg`
- About: `public/about/about.jpg`
- Metadati: `app/layout.tsx` (imposta `metadataBase` con il tuo dominio).

## Build produzione

```bash
npm run build
npm run start
```
