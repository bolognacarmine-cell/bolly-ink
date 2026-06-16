"use client";

import { useEffect, useMemo, useState } from "react";
import type { PortfolioImage, VideoItem } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Media = {
  portfolioImages: PortfolioImage[];
  videos: VideoItem[];
};

async function fetchMedia(): Promise<Media> {
  const res = await fetch("/api/admin/media", { cache: "no-store" });
  if (!res.ok) throw new Error("Impossibile leggere media.json");
  return (await res.json()) as Media;
}

export default function AdminPage() {
  const [media, setMedia] = useState<Media | null>(null);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  // Image form
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgStyle, setImgStyle] = useState("blackwork");
  const [imgAlt, setImgAlt] = useState("Tatuaggio");
  const [imgDate, setImgDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  // Video form
  const [vidFile, setVidFile] = useState<File | null>(null);
  const [vidPoster, setVidPoster] = useState<File | null>(null);
  const [vidTitle, setVidTitle] = useState("Video lavorazione");
  const [vidDuration, setVidDuration] = useState("00:20");
  const [vidOrientation, setVidOrientation] = useState<"horizontal" | "vertical">(
    "horizontal",
  );
  const [vidDate, setVidDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  const styles = useMemo(() => {
    const current = media?.portfolioImages?.map((i) => i.style) ?? [];
    return Array.from(new Set(["blackwork", "realistic", "ornamental", "lettering", "coverup", ...current]));
  }, [media]);

  async function refresh() {
    const m = await fetchMedia();
    setMedia(m);
  }

  useEffect(() => {
    let active = true;
    fetchMedia()
      .then((m) => {
        if (!active) return;
        setMedia(m);
      })
      .catch((e) => {
        if (!active) return;
        setStatus(String(e));
      });
    return () => {
      active = false;
    };
  }, []);

  async function uploadImage() {
    if (!imgFile) {
      setStatus("Seleziona un file immagine.");
      return;
    }
    setBusy(true);
    setStatus("Caricamento immagine...");
    try {
      const fd = new FormData();
      fd.set("type", "image");
      fd.set("file", imgFile);
      fd.set("style", imgStyle);
      fd.set("alt", imgAlt);
      fd.set("date", imgDate);

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "Upload fallito");

      setImgFile(null);
      await refresh();
      setStatus("Immagine caricata e registrata in `content/media.json`.");
    } catch (e) {
      setStatus(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function uploadVideo() {
    if (!vidFile || !vidPoster) {
      setStatus("Seleziona video (mp4) e poster (jpg/png).");
      return;
    }
    setBusy(true);
    setStatus("Caricamento video...");
    try {
      const fd = new FormData();
      fd.set("type", "video");
      fd.set("file", vidFile);
      fd.set("poster", vidPoster);
      fd.set("title", vidTitle);
      fd.set("duration", vidDuration);
      fd.set("orientation", vidOrientation);
      fd.set("date", vidDate);

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "Upload fallito");

      setVidFile(null);
      setVidPoster(null);
      await refresh();
      setStatus("Video caricato e registrato in `content/media.json`.");
    } catch (e) {
      setStatus(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase text-white/60">
              Admin
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              Caricamento contenuti
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/60">
              Qui puoi caricare immagini portfolio e video (con poster). I file
              finiscono in `public/` e i riferimenti vengono salvati in
              `content/media.json`.
              <br />
              In produzione proteggi questa pagina (auth) e usa storage esterno
              (S3/R2) se deploy su serverless.
            </p>
          </div>
          <Button href="/" variant="secondary">
            Torna al sito
          </Button>
        </div>

        {status ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/70">
            {status}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Aggiungi immagine</h2>
            <div className="mt-5 grid gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImgFile(e.target.files?.[0] ?? null)}
              />
              <div className="grid gap-2">
                <label className="text-xs text-white/60">Stile</label>
                <select
                  value={imgStyle}
                  onChange={(e) => setImgStyle(e.target.value)}
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm"
                >
                  {styles.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-white/60">Alt (accessibilità)</label>
                <input
                  value={imgAlt}
                  onChange={(e) => setImgAlt(e.target.value)}
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-white/60">Data</label>
                <input
                  type="date"
                  value={imgDate}
                  onChange={(e) => setImgDate(e.target.value)}
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm"
                />
              </div>
              <Button onClick={uploadImage} ariaLabel="Carica immagine">
                {busy ? "Attendi..." : "Carica immagine"}
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Aggiungi video</h2>
            <div className="mt-5 grid gap-4">
              <input
                type="file"
                accept="video/mp4"
                onChange={(e) => setVidFile(e.target.files?.[0] ?? null)}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setVidPoster(e.target.files?.[0] ?? null)}
              />
              <div className="grid gap-2">
                <label className="text-xs text-white/60">Titolo</label>
                <input
                  value={vidTitle}
                  onChange={(e) => setVidTitle(e.target.value)}
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs text-white/60">Durata (mm:ss)</span>
                  <input
                    value={vidDuration}
                    onChange={(e) => setVidDuration(e.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs text-white/60">Orientamento</span>
                  <select
                    value={vidOrientation}
                    onChange={(e) =>
                      setVidOrientation(e.target.value as "horizontal" | "vertical")
                    }
                    className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm"
                  >
                    <option value="horizontal">horizontal</option>
                    <option value="vertical">vertical</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-white/60">Data</label>
                <input
                  type="date"
                  value={vidDate}
                  onChange={(e) => setVidDate(e.target.value)}
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm"
                />
              </div>
              <Button onClick={uploadVideo} ariaLabel="Carica video">
                {busy ? "Attendi..." : "Carica video"}
              </Button>
            </div>
          </section>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-white">
              Immagini ({media?.portfolioImages.length ?? 0})
            </h3>
            <div className="mt-4 grid gap-2 text-xs text-white/65">
              {(media?.portfolioImages ?? []).slice(0, 10).map((i) => (
                <div
                  key={i.id}
                  className={cn(
                    "rounded-2xl border border-white/10 bg-black/25 px-4 py-3",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white">{i.style}</p>
                      <p className="text-white/55">{i.date}</p>
                    </div>
                    <code className="text-white/55">{i.src}</code>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-sm font-semibold text-white">
              Video ({media?.videos.length ?? 0})
            </h3>
            <div className="mt-4 grid gap-2 text-xs text-white/65">
              {(media?.videos ?? []).slice(0, 10).map((v) => (
                <div
                  key={v.id}
                  className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white">{v.title}</p>
                      <p className="text-white/55">
                        {v.orientation} • {v.duration} • {v.date}
                      </p>
                    </div>
                    <code className="text-white/55">{v.src}</code>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
