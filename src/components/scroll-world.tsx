"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Phone } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { media, processSteps, scrollActs, site, treatments } from "@/content/site";
import { getTestimonials } from "@/content/testimonials";
import { getRailDistance } from "@/lib/scroll-motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const hero = scrollActs[0];
const trust = scrollActs[1];
const choice = scrollActs[2];
const connection = scrollActs[3];
const proof = scrollActs[4];
const commitment = scrollActs[5];
const [featuredReview] = getTestimonials(["Ken Miller"]);

const panoramaTiles = [
  { src: media.heroConsult, alt: "A consultation at Renew Implant Centre" },
  { src: media.clinic, alt: "The renovated treatment room" },
  { src: media.team, alt: "Tom Szarski with a patient" },
  { src: media.heroClinic, alt: "The operatory and its blue accent wall" },
];

export function ScrollWorld() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = gsap.matchMedia();

      reduce.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".hero-photo",
          { scale: 1.04, yPercent: 0 },
          {
            scale: 1.12,
            yPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: 0.7,
            },
          },
        );

        gsap.from(".hero-word", {
          yPercent: 110,
          rotate: 3,
          stagger: 0.08,
          duration: 1.1,
          ease: "power4.out",
        });

        gsap.fromTo(
          ".arch-path",
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.4,
            },
          },
        );

        gsap.utils.toArray<HTMLElement>(".reveal-copy").forEach((element) => {
          gsap.from(element.children, {
            y: 48,
            opacity: 0,
            stagger: 0.09,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 74%",
              once: true,
            },
          });
        });

        const rail = document.querySelector<HTMLElement>(".treatment-rail");
        const railSection =
          document.querySelector<HTMLElement>(".treatments-section");
        if (rail && railSection) {
          const distance = () =>
            getRailDistance(rail.scrollWidth, window.innerWidth);

          gsap.to(rail, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: railSection,
              start: "top top",
              end: () => `+=${Math.max(distance(), window.innerHeight * 1.5)}`,
              pin: true,
              scrub: 0.65,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        }

        gsap.fromTo(
          ".doctor-photo",
          { clipPath: "inset(14% 18% 14% 18%)", scale: 1.1 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".doctors-section",
              start: "top 85%",
              end: "bottom 40%",
              scrub: 0.7,
            },
          },
        );

        gsap.utils.toArray<HTMLElement>(".panorama-tile").forEach(
          (tile, index) => {
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
                  trigger: ".panorama-section",
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.8,
                },
              },
            );
          },
        );

        gsap.fromTo(
          ".close-photo",
          { clipPath: "circle(20% at 50% 50%)", scale: 1.12 },
          {
            clipPath: "circle(75% at 50% 50%)",
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".close-section",
              start: "top 85%",
              end: "top 10%",
              scrub: 0.8,
            },
          },
        );
      });

      reduce.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          ".hero-photo, .hero-word, .reveal-copy > *, .doctor-photo, .panorama-tile, .close-photo",
          { clearProps: "all" },
        );
      });

      return () => reduce.revert();
    },
    { scope: root },
  );

  return (
    <main ref={root} className="scroll-world">
      <svg
        className="arch-line"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="arch-path"
          pathLength="1"
          d="M 6 9 C 80 14, 15 31, 88 39 S 18 61, 92 70 S 30 89, 68 94"
        />
      </svg>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-sticky">
          <div className="hero-media">
            <Image
              className="hero-photo hero-poster"
              src={hero.image}
              alt={hero.imageAlt}
              fill
              priority
              sizes="100vw"
            />
            {hero.video ? (
              <video
                className="hero-photo hero-video scene-video"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={hero.image}
                aria-hidden="true"
              >
                {hero.mobileVideo ? (
                  <source
                    src={hero.mobileVideo}
                    type="video/mp4"
                    media="(max-width: 800px)"
                  />
                ) : null}
                <source src={hero.video} type="video/mp4" />
              </video>
            ) : null}
          </div>
          <div className="hero-scrim" />
          <div className="hero-copy">
            <p className="section-label">{hero.label}</p>
            <h1 id="hero-title" aria-label={hero.title}>
              <span className="word-mask">
                <span className="hero-word">Stop living around your teeth.</span>
              </span>
              <span className="word-mask">
                <span className="hero-word hero-word-accent">Start living again.</span>
              </span>
            </h1>
            <p className="hero-intro">{hero.body}</p>
            <div className="hero-actions">
              <Button asChild size="lg">
                <Link href={site.primaryCta.href}>
                  {site.primaryCta.label}
                  <ArrowDownRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href={site.secondaryCta.href}>{site.secondaryCta.label}</Link>
              </Button>
            </div>
          </div>
          <p className="hero-address">{site.address}</p>
        </div>
      </section>

      <section className="trust-section" aria-labelledby="trust-title">
        <div className="trust-photo">
          <Image
            src={trust.image}
            alt={trust.imageAlt}
            fill
            sizes="(max-width: 800px) 100vw, 52vw"
          />
        </div>
        <div className="trust-copy reveal-copy">
          <p className="section-label">{trust.label}</p>
          <h2 id="trust-title">{trust.title}</h2>
          <p>{trust.body}</p>
          <div className="trust-note">
            <strong>CDCP accepted · Direct billing · Financing</strong>
            <span>Onsite lab · Sedation available · English and French</span>
          </div>
        </div>
      </section>

      <section className="treatments-section" aria-labelledby="treatments-title">
        <div className="rail-heading">
          <p className="section-label">{choice.label}</p>
          <h2 id="treatments-title">{choice.title}</h2>
        </div>
        <div className="treatment-rail">
          {treatments.map((treatment, index) => (
            <article className="treatment-card" key={treatment.title}>
              <Image
                src={treatment.image}
                alt=""
                fill
                sizes="(max-width: 700px) 84vw, 42vw"
              />
              <div className="card-scrim" />
              <span className="card-index">0{index + 1}</span>
              <div className="card-copy">
                <h3>{treatment.title}</h3>
                <p>{treatment.body}</p>
                <Link href={treatment.href}>
                  Explore treatment <ArrowUpRight aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="doctors-section" aria-labelledby="doctors-title">
        <div className="doctor-photo">
          <Image
            src={connection.image}
            alt={connection.imageAlt}
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
          />
        </div>
        <div className="doctor-copy reveal-copy">
          <p className="section-label">{connection.label}</p>
          <h2 id="doctors-title">{connection.title}</h2>
          <p>{connection.body}</p>
          <blockquote>
            “{featuredReview.quote}”
            <cite>
              {featuredReview.name}, {featuredReview.location}
            </cite>
          </blockquote>
          <Link className="text-link" href="/meet-your-dentist">
            Meet Tom Szarski
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="panorama-section" aria-labelledby="panorama-title">
        <div className="panorama-copy reveal-copy">
          <p className="section-label">{proof.label}</p>
          <h2 id="panorama-title">{proof.title}</h2>
          <p>{proof.body}</p>
          <ol className="process-steps">
            {processSteps.map((step, index) => (
              <li key={step.title}>
                <span>0{index + 1}</span>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="panorama-grid" aria-label="Inside Renew Implant Centre">
          {panoramaTiles.map((tile) => (
            <figure className="panorama-tile" key={tile.src}>
              <Image
                src={tile.src}
                alt={tile.alt}
                fill
                sizes="(max-width: 700px) 82vw, 35vw"
              />
            </figure>
          ))}
        </div>
        <p className="panorama-caption">
          Consultation, surgery, lab, and follow-up — all at 2530 St Joseph Blvd.
        </p>
      </section>

      <section className="close-section" aria-labelledby="close-title">
        <div className="close-photo">
          <Image
            src={commitment.image}
            alt={commitment.imageAlt}
            fill
            sizes="100vw"
          />
          <div className="close-scrim" />
        </div>
        <div className="close-copy reveal-copy">
          <p className="section-label">{commitment.label}</p>
          <h2 id="close-title">{commitment.title}</h2>
          <p>{commitment.body}</p>
          <div className="close-actions">
            <Button asChild size="lg">
              <Link href={site.primaryCta.href}>
                {site.primaryCta.label}
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={site.phone.href}>
                <Phone aria-hidden="true" />
                {site.phone.label}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
