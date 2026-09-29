"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";

export type LoopVideoSources = {
  video: string;
  webm?: string;
  mobileVideo?: string;
  mobileWebm?: string;
  poster?: string;
  mobilePoster?: string;
};

const mobileQuery = "(max-width: 800px)";

export function ResponsivePoster({
  poster,
  mobilePoster,
  alt,
  sizes,
  priority = false,
  className,
}: {
  poster: string;
  mobilePoster?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <picture className={className ? `responsive-poster ${className}` : "responsive-poster"}>
      {mobilePoster ? <source media={mobileQuery} srcSet={mobilePoster} /> : null}
      <Image src={poster} alt={alt} fill priority={priority} sizes={sizes} />
    </picture>
  );
}

function subscribeToMobile(change: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", change);
  return () => query.removeEventListener("change", change);
}

function isMobile() {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(mobileQuery).matches;
}

// Silent, visibility-aware loop with WebM-first sources and a portrait pair
// for small screens. CSS hides it entirely under prefers-reduced-motion.
export function LoopVideo({
  sources,
  className,
}: {
  sources: LoopVideoSources;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobile = useSyncExternalStore(subscribeToMobile, isMobile, () => false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;

    const syncPlayback = () => {
      if (visible && !reduceMotion.matches) {
        void video.play().catch(() => {
          // The poster remains visible when autoplay is unavailable.
        });
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        syncPlayback();
      },
      { threshold: 0.25, rootMargin: "100px" },
    );

    observer.observe(video);
    reduceMotion.addEventListener("change", syncPlayback);

    return () => {
      observer.disconnect();
      reduceMotion.removeEventListener("change", syncPlayback);
      video.pause();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={className ? `scene-video ${className}` : "scene-video"}
      muted
      loop
      playsInline
      preload="none"
      poster={mobile && sources.mobilePoster ? sources.mobilePoster : sources.poster}
      aria-hidden="true"
    >
      {sources.mobileWebm ? (
        <source src={sources.mobileWebm} type="video/webm" media={mobileQuery} />
      ) : null}
      {sources.mobileVideo ? (
        <source src={sources.mobileVideo} type="video/mp4" media={mobileQuery} />
      ) : null}
      {sources.webm ? <source src={sources.webm} type="video/webm" /> : null}
      <source src={sources.video} type="video/mp4" />
    </video>
  );
}
