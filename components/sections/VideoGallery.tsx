import { Section } from "@/components/Section";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import type { VideoItem } from "@/data/site";

type Props = {
  videos: VideoItem[];
};

export function VideoGallery({ videos }: Props) {
  return (
    <Section id="video" className="bg-black">
      <Reveal>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.22em] uppercase text-white/60">
              Video
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Lavorazione, close-up, timelapse.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/60 leading-relaxed">
              Questa sezione contiene solo video. Per gestire contenuti: modifica
              `data/site.ts` e carica file in `public/videos/` + poster in
              `public/video-posters/`.
            </p>
          </div>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((v) => (
            <Reveal key={v.id} className="h-full">
              <article className="h-full rounded-2xl border border-white/10 bg-white/5 overflow-hidden shadow-[0_22px_70px_-55px_rgba(255,255,255,.35)]">
                <div
                  className={cn(
                    "relative w-full bg-black",
                    v.orientation === "vertical"
                      ? "aspect-[9/16]"
                      : "aspect-video",
                  )}
                >
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    controls={Boolean(v.src)}
                    playsInline
                    preload="metadata"
                    poster={v.poster}
                  >
                    {v.src ? <source src={v.src} type="video/mp4" /> : null}
                    Il tuo browser non supporta il tag video.
                  </video>

                  {!v.src ? (
                    <div className="pointer-events-none absolute inset-0 grid place-items-center">
                      <div className="rounded-full border border-white/20 bg-black/50 px-5 py-3 text-xs text-white/80 backdrop-blur-md">
                        Carica un MP4 per riprodurre
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-sm font-semibold text-white leading-snug">
                      {v.title}
                    </h3>
                    <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
                      {v.duration}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/55">
                    {v.orientation} • {v.date}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
      </div>
    </Section>
  );
}
