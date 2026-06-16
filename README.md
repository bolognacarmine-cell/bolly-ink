Sito dark luxury per tatuatore, costruito con [Next.js](https://nextjs.org) + Tailwind.

## Avvio rapido

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
