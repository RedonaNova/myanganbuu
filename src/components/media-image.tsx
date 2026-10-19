import { MEDIA_WIDTHS } from "@/lib/photos";

type Media = { src: string; width: number; height: number; lqip?: string; alt?: string };

/**
 * Responsive <img> for pre-generated variants (/media/<key>/<width>). A plain
 * element, not next/image: renders on the server with zero client JS, and
 * the blurred placeholder sits in the background until the photo paints.
 */
export function MediaImage({
  photo,
  alt = photo.alt ?? "",
  sizes = "100vw",
  priority = false,
  fill = false,
  className = "",
  style,
}: {
  photo: Media;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- variants are pre-generated
    <img
      src={`${photo.src}/1200`}
      srcSet={MEDIA_WIDTHS.map((w) => `${photo.src}/${w} ${w}w`).join(", ")}
      sizes={sizes}
      width={photo.width}
      height={photo.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      draggable={false}
      className={`${fill ? "absolute inset-0 h-full w-full " : ""}${className}`}
      style={{
        ...(photo.lqip ? { backgroundImage: `url(${photo.lqip})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
        ...style,
      }}
    />
  );
}
