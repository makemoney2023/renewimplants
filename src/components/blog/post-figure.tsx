import Image from "next/image";

export function PostFigure({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="post-figure">
      <Image
        src={src}
        alt={alt}
        fill
        loading="lazy"
        sizes="(max-width: 800px) 100vw, 42rem"
      />
    </figure>
  );
}
