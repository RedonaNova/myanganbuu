import Image from "next/image";
import Link from "next/link";
import type { ProjectCard as Card } from "@/lib/queries";
import { area, days } from "@/lib/format";
import { rooms } from "@/messages/mn";

/**
 * Oversized photo card: the photograph fills the card edge to edge, the title
 * sits on a soft scrim at the bottom, and key facts ride along as chips.
 */
export function ProjectCard({
  project,
  sizes = "(min-width: 1024px) 40rem, (min-width: 640px) 50vw, 100vw",
  priority = false,
  tall = false,
}: {
  project: Card;
  sizes?: string;
  priority?: boolean;
  tall?: boolean;
}) {
  const facts = [
    project.district,
    project.areaM2 ? area(project.areaM2) : "",
    project.durationDays ? days(project.durationDays) : "",
  ].filter(Boolean);

  return (
    <Link
      href={`/tusul/${project.slug}`}
      className={
        "group relative isolate block overflow-hidden rounded-card bg-surface-2 " +
        (tall ? "aspect-[4/5] md:aspect-auto md:h-full md:min-h-[36rem]" : "aspect-[4/5] sm:aspect-[5/4]")
      }
    >
      {project.cover && (
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes={sizes}
          placeholder="blur"
          blurDataURL={project.cover.lqip}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white md:p-7">
        <p className="text-sm font-semibold tracking-[0.12em] text-white/80 uppercase">{rooms[project.room]}</p>
        <h3 className="mt-2 font-display text-2xl leading-tight font-bold text-balance md:text-[1.75rem]">{project.title}</h3>
        {facts.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {facts.map((f) => (
              <li key={f} className="rounded-full bg-white/16 px-3 py-1 text-sm font-semibold backdrop-blur-sm tabular">
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
