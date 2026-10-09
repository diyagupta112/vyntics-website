"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { CaseStudyMedia } from "@/lib/case-studies";
import { CaseStudyCover } from "./case-study-cover";
import styles from "./case-study-video.module.css";

type Player = { mute(): void; playVideo(): void; pauseVideo(): void; destroy(): void };
type YouTube = { Player: new (element: HTMLElement, options: Record<string, unknown>) => Player };
type VideoWindow = Window & { YT?: YouTube; onYouTubeIframeAPIReady?: () => void };
let playerApi: Promise<YouTube> | undefined;

function loadPlayerApi(): Promise<YouTube> {
  const videoWindow = window as VideoWindow;
  if (videoWindow.YT?.Player) return Promise.resolve(videoWindow.YT);
  if (!playerApi) {
    playerApi = new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Video player unavailable")), 15000);
      const previous = videoWindow.onYouTubeIframeAPIReady;
      videoWindow.onYouTubeIframeAPIReady = () => {
        previous?.();
        window.clearTimeout(timeout);
        if (videoWindow.YT?.Player) resolve(videoWindow.YT);
        else reject(new Error("Video player unavailable"));
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => { window.clearTimeout(timeout); reject(new Error("Video player unavailable")); };
      document.head.appendChild(script);
    });
  }
  return playerApi;
}

export function CaseStudyVideo({ media, title, fallbackSrc, className, controls = true, interactivePreview = false, optimizedCover = false }: {
  media: CaseStudyMedia; title: string; fallbackSrc: string; className?: string; controls?: boolean; interactivePreview?: boolean; optimizedCover?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const nativeVideo = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const wantsPlayback = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenMessage, setFullscreenMessage] = useState("");
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (!interactivePreview) return;
    const update = () => setFullscreen(document.fullscreenElement === preview.current && preview.current !== null);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, [interactivePreview]);
  useEffect(() => {
    if (media.provider !== "youtube" || failed) return;
    const playerContainer = container.current;
    let cancelled = false;
    let player: Player | undefined;
    void loadPlayerApi().then(api => {
      if (cancelled || !playerContainer) return;
      const target = document.createElement("div");
      playerContainer.appendChild(target);
      player = new api.Player(target, {
        host: "https://www.youtube-nocookie.com",
        videoId: media.videoId,
        width: "100%", height: "100%",
        playerVars: { controls: controls ? 1 : 0, ...(!controls ? { rel: 0 } : {}), autoplay: interactivePreview || reducedMotion ? 0 : 1, mute: 1, loop: 1, playlist: media.videoId, playsinline: 1, origin: window.location.origin },
        events: {
          onReady: ({ target }: { target: Player }) => {
            if (cancelled) return;
            playerRef.current = target;
            target.mute();
            if (!document.hidden && (interactivePreview ? wantsPlayback.current : !reducedMotion)) target.playVideo();
          },
          onStateChange: ({ data }: { data: number }) => { if (!cancelled) setPlaying(data === 1); },
          onError: () => { if (!cancelled) setFailed(true); },
        },
      });
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      // Playback API calls require onReady and an iframe still attached to the DOM.
      if (playerRef.current && playerContainer?.isConnected) playerRef.current.pauseVideo();
      playerRef.current = null;
      player?.destroy();
    };
  }, [media.provider, media.videoId, reducedMotion, failed, controls, interactivePreview]);
  useEffect(() => {
    const video = nativeVideo.current;
    if (reducedMotion) video?.pause();
    return () => { video?.pause(); };
  }, [reducedMotion]);

  useEffect(() => {
    if (!interactivePreview) return;
    const pauseWhenHidden = () => {
      if (!document.hidden) return;
      wantsPlayback.current = false;
      playerRef.current?.pauseVideo();
      nativeVideo.current?.pause();
      setPlaying(false);
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, [interactivePreview]);

  function playback(play: boolean) {
    wantsPlayback.current = play;
    const player = playerRef.current;
    if (player) {
      player.mute();
      if (play) player.playVideo(); else player.pauseVideo();
    }
    const video = nativeVideo.current;
    if (video) {
      video.muted = true;
      if (play) void video.play().catch(() => { wantsPlayback.current = false; setPlaying(false); });
      else video.pause();
    }
  }

  async function toggleFullscreen() {
    setFullscreenMessage("");
    try {
      if (document.fullscreenElement === preview.current) {
        await document.exitFullscreen();
      } else if (preview.current?.requestFullscreen && document.fullscreenEnabled) {
        await preview.current.requestFullscreen();
      } else {
        setFullscreenMessage("Fullscreen is unavailable in this browser.");
      }
    } catch {
      setFullscreenMessage("Fullscreen could not be opened. Please try again.");
    }
  }

  if (failed || media.type !== "video") return <CaseStudyCover optimized={optimizedCover} className={className} src={fallbackSrc} title={title} />;
  const video = media.provider === "youtube"
    ? <div className={className} ref={container} aria-label={`${title} product demonstration`} style={{ width: "100%", height: "100%", aspectRatio: "16 / 9" }} />
    : <video className={className} ref={nativeVideo} src={media.src} autoPlay={!interactivePreview && !reducedMotion} muted loop playsInline controls={controls} preload="metadata" poster={media.poster ?? fallbackSrc} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} aria-label={`${title} product demonstration`} />;
  if (!interactivePreview) return video;
  return (
    <div className={styles.preview} ref={preview}
      onPointerEnter={event => { if (event.pointerType === "mouse") playback(true); }}
      onPointerLeave={event => { if (event.pointerType === "mouse") playback(false); }}>
      {video}
      <div className={styles.hoverTarget} aria-hidden="true" />
      <button className={`${styles.playback} ${styles.playToggle}`} type="button" aria-label={playing ? "Pause product preview" : "Play product preview"}
        onClick={() => playback(!playing)}>
        <svg viewBox="0 0 20 20" aria-hidden="true">{playing ? <path d="M6 4h3v12H6zm5 0h3v12h-3z" /> : <path d="m6 3 11 7-11 7z" />}</svg>
      </button>
      <button className={styles.playback} type="button" aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} onClick={() => void toggleFullscreen()}>
        <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.fullscreenIcon}>
          <path d={fullscreen ? "M3 7h4V3m6 0v4h4M3 13h4v4m6 0v-4h4" : "M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4"} />
        </svg>
      </button>
      {fullscreenMessage && <p className={styles.fullscreenMessage} role="status">{fullscreenMessage}</p>}
    </div>
  );
}
