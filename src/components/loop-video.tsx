export type LoopVideoSources = {
  video: string;
  webm?: string;
  mobileVideo?: string;
  mobileWebm?: string;
  poster?: string;
};

// Silent, autoplaying loop with WebM-first sources and a portrait pair for
// small screens. Hidden entirely under prefers-reduced-motion via .scene-video.
export function LoopVideo({
  sources,
  className,
}: {
  sources: LoopVideoSources;
  className?: string;
}) {
  return (
    <video
      className={className ? `scene-video ${className}` : "scene-video"}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={sources.poster}
      aria-hidden="true"
    >
      {sources.mobileWebm ? (
        <source src={sources.mobileWebm} type="video/webm" media="(max-width: 800px)" />
      ) : null}
      {sources.mobileVideo ? (
        <source src={sources.mobileVideo} type="video/mp4" media="(max-width: 800px)" />
      ) : null}
      {sources.webm ? <source src={sources.webm} type="video/webm" /> : null}
      <source src={sources.video} type="video/mp4" />
    </video>
  );
}
