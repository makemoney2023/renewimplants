"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { FaqList } from "@/components/faq-list";
import { RouteActions } from "@/components/route-actions";
import { TestimonialList } from "@/components/testimonial-list";
import type { RouteAct, RouteContent } from "@/content/routes";
import { site } from "@/content/site";
import { getRailDistance } from "@/lib/scroll-motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ExperiencePage({ page }: { page: RouteContent }) {
  const root = useRef<HTMLElement>(null);
  const acts = page.acts?.length
    ? page.acts
    : [
        {
          device: page.device ?? "kinetic",
          heading: page.title,
          body: page.intro,
          image: page.image,
        } satisfies RouteAct,
      ];

  useGSAP(
    () => {
      const reduce = gsap.matchMedia();

      reduce.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".chapter-photo").forEach((element) => {
          gsap.fromTo(
            element,
            { scale: 1.04 },
            {
              scale: 1.1,
              ease: "none",
              scrollTrigger: {
                trigger: element.closest("section"),
                start: "top bottom",
                end: "bottom top",
                scrub: 0.7,
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>(".reveal-copy").forEach((element) => {
          gsap.from(element.children, {
            y: 36,
            opacity: 0,
            stagger: 0.08,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 78%",
              once: true,
            },
          });
        });

        gsap.utils.toArray<HTMLElement>(".chapter-rail-section").forEach((railSection) => {
          const rail = railSection.querySelector<HTMLElement>(".treatment-rail");
          if (!rail) return;
          const distance = () =>
            getRailDistance(rail.scrollWidth, window.innerWidth);

          gsap.to(rail, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: railSection,
              start: "top top",
              end: () => `+=${Math.max(distance(), window.innerHeight * 2)}`,
              pin: true,
              scrub: 0.65,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        });

        gsap.utils.toArray<HTMLElement>(".chapter-split-photo").forEach((element) => {
          gsap.fromTo(
            element,
            { clipPath: "inset(14% 18% 14% 18%)", scale: 1.1 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: element.closest("section"),
                start: "top 85%",
                end: "bottom 40%",
                scrub: 0.7,
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>(".panorama-tile").forEach((tile, index) => {
          gsap.fromTo(
            tile,
            {
              yPercent: index % 2 === 0 ? 14 : -12,
              rotate: index % 2 === 0 ? -1.5 : 1.5,
            },
            {
              yPercent: index % 2 === 0 ? -10 : 8,
              rotate: 0,
              ease: "none",
              scrollTrigger: {
                trigger: tile.closest("section"),
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>(".chapter-close-photo").forEach((element) => {
          gsap.fromTo(
            element,
            { clipPath: "circle(18% at 50% 50%)", scale: 1.12 },
            {
              clipPath: "circle(78% at 50% 50%)",
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: element.closest("section"),
                start: "top 85%",
                end: "top 12%",
                scrub: 0.8,
              },
            },
          );
        });
      });

      reduce.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          ".chapter-photo, .reveal-copy > *, .chapter-split-photo, .panorama-tile, .chapter-close-photo",
          { clearProps: "all" },
        );
      });

      return () => reduce.revert();
    },
    { scope: root },
  );

  const hasBody =
    page.sections.length > 0 ||
    (page.quotes?.length ?? 0) > 0 ||
    (page.faqs?.length ?? 0) > 0;

  return (
    <main className="chapter-page" ref={root}>
      {acts.map((act, index) => (
        <ChapterAct
          key={`${act.heading}-${act.device}`}
          act={act}
          eyebrow={index === 0 ? page.eyebrow : "Continue"}
          title={index === 0 ? page.title : act.heading}
          intro={index === 0 ? page.intro : act.body}
          photos={page.photos}
          first={index === 0}
          last={index === acts.length - 1}
        />
      ))}

      <section className="content-body chapter-body">
        {hasBody ? (
          <div className="content-sections">
            {page.sections.map((section) => (
              <article key={section.heading} className="reveal-copy">
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </article>
            ))}
            {page.quotes?.length ? <TestimonialList quotes={page.quotes} /> : null}
            {page.faqs?.length ? <FaqList faqs={page.faqs} /> : null}
          </div>
        ) : null}
        <RouteActions links={page.links} />
      </section>

      <footer className="content-footer">
        <Link href="/">
          <ArrowLeft aria-hidden="true" />
          Back to home
        </Link>
        <p>{site.address}</p>
      </footer>
    </main>
  );
}

function ChapterAct({
  act,
  eyebrow,
  title,
  intro,
  photos,
  first,
  last,
}: {
  act: RouteAct;
  eyebrow: string;
  title: string;
  intro: string;
  photos?: RouteContent["photos"];
  first: boolean;
  last: boolean;
}) {
  const id = `${slugify(title)}-title`;
  const Heading = first ? "h1" : "h2";

  if (act.device === "rail") {
    const cards = photos?.length
      ? photos
      : [{ src: act.image, alt: act.heading }];

    return (
      <section
        className="treatments-section chapter-rail-section chapter-act"
        aria-labelledby={id}
      >
        <div className="rail-heading reveal-copy">
          <p className="section-label">{eyebrow}</p>
          <Heading id={id}>{title}</Heading>
          <p>{intro}</p>
        </div>
        <div className="treatment-rail chapter-rail">
          {cards.map((photo, index) => (
            <article className="treatment-card" key={`${photo.src}-${index}`}>
              <Image
                src={photo.src}
                alt={photos?.length ? photo.alt : ""}
                fill
                sizes="(max-width: 700px) 84vw, 42vw"
              />
              <div className="card-scrim" />
              <span className="card-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              {!photos?.length ? (
                <div className="card-copy">
                  <h3>{act.heading}</h3>
                  <p>{act.body}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (act.device === "panorama") {
    const tiles = photos?.length ? photos : [{ src: act.image, alt: title }];

    return (
      <section className="panorama-section chapter-act" aria-labelledby={id}>
        <div className="panorama-copy reveal-copy">
          <p className="section-label">{eyebrow}</p>
          <Heading id={id}>{title}</Heading>
          <p>{intro}</p>
        </div>
        <div className="panorama-grid" aria-label={title}>
          {tiles.slice(0, 4).map((photo, index) => (
            <figure className="panorama-tile" key={`${photo.src}-${index}`}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 700px) 82vw, 35vw"
              />
            </figure>
          ))}
        </div>
      </section>
    );
  }

  if (act.device === "iris" || (last && act.device !== "split" && act.device !== "kinetic")) {
    return (
      <section className="close-section chapter-act" aria-labelledby={id}>
        <div className="close-photo chapter-close-photo">
          <Image src={act.image} alt="" fill sizes="100vw" />
          <div className="close-scrim" />
        </div>
        <div className="close-copy reveal-copy">
          <p className="section-label">{eyebrow}</p>
          <Heading id={id}>{title}</Heading>
          <p>{intro}</p>
        </div>
      </section>
    );
  }

  if (act.device === "split") {
    return (
      <section className="doctors-section chapter-act" aria-labelledby={id}>
        <div className="doctor-photo chapter-split-photo">
          <Image src={act.image} alt="" fill sizes="(max-width: 800px) 100vw, 50vw" />
        </div>
        <div className="doctor-copy reveal-copy">
          <p className="section-label">{eyebrow}</p>
          <Heading id={id}>{title}</Heading>
          <p>{intro}</p>
        </div>
      </section>
    );
  }

  const parallax = act.device === "parallax";

  return (
    <section
      className={`trust-section chapter-act${parallax ? " chapter-act-parallax" : ""}`}
      aria-labelledby={id}
    >
      <div className="trust-photo">
        <Image
          className="chapter-photo"
          src={act.image}
          alt=""
          fill
          priority={first}
          sizes="(max-width: 800px) 100vw, 52vw"
        />
      </div>
      <div className="trust-copy reveal-copy">
        <p className="section-label">{eyebrow}</p>
        <Heading id={id}>{title}</Heading>
        <p>{intro}</p>
      </div>
    </section>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
