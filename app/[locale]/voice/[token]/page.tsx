"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Pause, Play, TriangleAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { cardShadow } from "@/components/onboarding/styles";
import { getPublicVoiceNote, type PublicVoiceNote } from "@/services/voice-note.services";

const WAVEFORM_BARS = Array.from({ length: 28 }, (_, i) => 25 + ((i * 37) % 65));

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VoicePlaybackPage() {
  const t = useTranslations("VoicePlayback");
  const params = useParams<{ token: string }>();
  const token = decodeURIComponent(params.token ?? "");

  const [checked, setChecked] = useState(false);
  const [voiceNote, setVoiceNote] = useState<PublicVoiceNote | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    getPublicVoiceNote(token).then((data) => {
      setVoiceNote(data);
      setChecked(true);
    });
  }, [token]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [voiceNote]);

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo className="h-6 w-auto" />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        {!checked ? null : !voiceNote ? (
          <div className="flex max-w-sm flex-col items-center gap-3 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <TriangleAlert className="size-6" strokeWidth={1.5} />
            </span>
            <h1 className="text-lg font-bold text-foreground">{t("notFoundTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("notFoundDescription")}</p>
          </div>
        ) : (
          <div className={cn("w-full max-w-md rounded-2xl border border-border bg-card p-8", cardShadow)}>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
              {t("eyebrow")}
            </p>
            <h1 className="mt-1.5 text-xl font-bold text-foreground">{t("title")}</h1>

            <audio ref={audioRef} src={voiceNote.audioUrl} preload="metadata" />

            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  const audio = audioRef.current;
                  if (!audio) return;
                  if (isPlaying) audio.pause();
                  else audio.play();
                }}
                className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="size-6" fill="currentColor" strokeWidth={0} />
                ) : (
                  <Play className="ml-0.5 size-6" fill="currentColor" strokeWidth={0} />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex h-8 items-center gap-[3px]">
                  {WAVEFORM_BARS.map((height, i) => (
                    <span
                      key={i}
                      style={{ height: `${height}%` }}
                      className={cn(
                        "w-[3px] shrink-0 rounded-full transition-colors",
                        i / WAVEFORM_BARS.length <= progress ? "bg-primary" : "bg-muted",
                      )}
                    />
                  ))}
                </div>
                <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
