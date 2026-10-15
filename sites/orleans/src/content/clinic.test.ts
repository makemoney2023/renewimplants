import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import sitemap from "@clinic/app/sitemap";
import { posts } from "@clinic/profile/blog";
import { getRedirects } from "@clinic/profile/redirects";
import { legacyRedirectTarget } from "@shell/legacy-redirects";
import { getRouteContent, getRouteSlugs } from "@/content/routes";
import { heroLines, leadSite, site } from "@/content/site";
import { buildSiteGraph } from "@/lib/site-schema";
import { contrastRatio, readThemeTokens } from "@shell/lib/contrast";
import { handleLeadPost, leadInsert, validateLead } from "@shell/lib/leads";
import { QUIZ_THANK_YOU_PATH, isQuizRoute, showsQuizCta } from "@shell/quiz/paths";
import { getResultPath } from "@shell/quiz/result";
import { handleQuizPost, quizConsentText } from "@shell/quiz/store";
import { quizQuestions } from "../../../../src/lib/quiz/questions";
import { scoreLead } from "../../../../src/lib/quiz/score";

const RENEW = { accent: "#8dc41d", aqua: "#009ce3" };
const orleans = site.url === "https://orleansdentureclinic.com";

describe(site.name, () => {
  it("uses a short homepage headline and Renew-shaped URLs", () => {
    expect(heroLines.join(" ").length).toBeLessThan(48);
    expect(heroLines.join(" ")).not.toMatch(/\bCLINIC\b/);
    expect(heroLines[1].endsWith(".")).toBe(true);
    const slugs = getRouteSlugs();
    expect(slugs).toContain("faq");
    expect(slugs).toContain("why-choose-us");
    expect(slugs).toContain("service-areas");
    expect(slugs).toContain("sitemap");
    expect(slugs).not.toContain("pricing");
    expect(slugs).not.toContain("before-after");
    expect(posts.length).toBeGreaterThan(0);
    for (const slug of slugs) expect(slug.endsWith("/")).toBe(false);
    if (orleans) {
      expect(heroLines).toEqual(["Dentures and implants,", "in Orléans."]);
      expect(slugs).toContain("patient-stories");
      expect(slugs).toContain("dental-anxiety");
    } else {
      expect(heroLines).toEqual(["Denture care,", "in Embrun."]);
      expect(slugs).not.toContain("patient-stories");
      expect(slugs).not.toContain("dental-anxiety");
      expect(slugs).not.toContain("privacy-policy");
      expect(slugs).not.toContain("terms");
    }
  });

  it("does not call Tom a doctor and drops agency emails", () => {
    const blob = ["routes.ts", "blog.ts", "site.ts"]
      .map((file) => readFileSync(new URL(`../profile/${file}`, import.meta.url), "utf8"))
      .join("\n");
    expect(blob).not.toMatch(/dr\.?\s+(tom|tomasz|szarski)/i);
    expect(blob).not.toMatch(/doctor\s+(tom|tomasz|szarski)/i);
    expect(blob).not.toMatch(/webmarketers|medianv/i);
    if (orleans) {
      const areas = getRouteContent("service-areas");
      const text = `${areas?.intro ?? ""} ${areas?.sections.map((section) => section.body).join(" ") ?? ""}`;
      expect(text).toContain("Worth The Drive");
      expect(text).not.toMatch(/Notre-Dame[\s\S]*K1C 1G7/);
    }
  });

  it("keeps recovered contact facts, the real D1 id, and a configurable site URL", () => {
    const wrangler = readFileSync(new URL("../../wrangler.jsonc", import.meta.url), "utf8");
    const pkg = readFileSync(new URL("../../package.json", import.meta.url), "utf8");
    expect(pkg).not.toContain("NEXT_PUBLIC_SITE_URL=");
    expect(leadSite.id).toBe(orleans ? "orleans" : "embrun");
    expect(leadSite.person?.honorificSuffix).toBe("DD");
    expect(leadSite.person?.jobTitle).toBe("Denturist");
    if (orleans) {
      expect(site.phone.label).toBe("613-590-9200");
      expect(site.email).toBe("info@orleansdentureclinic.ca");
      expect(leadSite.hours.find((hour) => hour.day === "Thursday")?.time).toBe("8:00am - 4:30pm");
      expect(leadSite.hours.find((hour) => hour.day === "Friday")?.time).toBe("8:00am - 3:00pm");
      expect(wrangler).toContain("e5de2fc6-6c84-4988-9230-1f5086073782");
    } else {
      expect(site.phone.label).toBe("(613) 219-2945");
      expect(site.email).toBe("info@embrundentures.ca");
      expect(wrangler).toContain("00bcea4c-8f6e-404b-ba99-d531a570fd85");
    }
    expect(wrangler).toContain('"./worker/index.ts"');
  });

  it("301s old scraped paths onto the new pages", () => {
    const redirects = new Map(getRedirects().map((item) => [item.source, item]));
    expect(redirects.get("/pricing")?.statusCode).toBe(301);
    expect(redirects.get("/pricing")?.destination).toBe("/canadian-dental-care-plan");
    expect(redirects.get("/services/denture-alternative")?.destination).toBe("/services/dentures");
    expect(redirects.get("/services/all-on-4-dental-implants")?.destination).toBe("/services/dental-implants");
    const rules = getRedirects();
    expect(legacyRedirectTarget("/pricing/", rules)).toBe("/canadian-dental-care-plan");
    expect(legacyRedirectTarget("/blog/", rules)).toBeNull();
    if (orleans) {
      expect(redirects.get("/contact/")?.destination).toBe("/contact-us");
      expect(legacyRedirectTarget("/contact", rules)).toBe("/contact-us");
      expect(legacyRedirectTarget("/contact/", rules)).toBe("/contact-us");
      expect(redirects.get("/implants/")?.destination).toBe("/services/dental-implants");
      expect(redirects.get("/before-after")?.destination).toBe("/patient-stories");
      expect(redirects.get("/faqs/")?.destination).toBe("/faq");
    } else {
      expect(redirects.get("/about/")?.destination).toBe("/why-choose-us");
      expect(redirects.get("/before-after")?.destination).toBe("/gallery");
      expect(redirects.get("/patient-stories")?.destination).toBe("/why-choose-us");
      expect(redirects.get("/dental-anxiety")?.destination).toBe("/faq");
      expect(redirects.get("/privacy-policy")?.destination).toBe("/contact-us");
      expect(redirects.get("/terms")?.destination).toBe("/contact-us");
      expect(redirects.get("/service/dental-implants-embrun-on/")?.destination).toBe("/services/dental-implants");
    }
  });

  it("publishes Renew-shaped URLs and omits the quiz thank-you page", () => {
    const urls = sitemap().map((entry) => new URL(entry.url).pathname.replace(/\/$/, "") || "/");
    expect(urls).toContain("/");
    expect(urls).toContain("/blog");
    expect(urls).toContain("/faq");
    expect(urls).toContain("/services/dentures");
    expect(urls).toContain("/implant-candidate-quiz");
    expect(urls).toContain(`/blog/${posts[0]?.slug}`);
    expect(urls.some((url) => url.includes("thank-you"))).toBe(false);
    expect(urls).not.toContain(QUIZ_THANK_YOU_PATH.replace(/\/$/, ""));
    expect(sitemap()[0]?.url.startsWith(site.url)).toBe(true);
  });

  it("builds dentist schema for this clinic", () => {
    const graph = buildSiteGraph();
    const practice = graph["@graph"][0] as { "@type": string[]; telephone: string };
    expect(practice["@type"]).toEqual(["Dentist", "MedicalClinic"]);
    expect(practice.telephone).toBe(orleans ? "+1-613-590-9200" : "+1-613-219-2945");
    const person = graph["@graph"].find((node) => node["@type"] === "Person") as { honorificSuffix: string; jobTitle: string };
    expect(person.honorificSuffix).toBe("DD");
    expect(person.jobTitle).toBe("Denturist");
  });

  it("uses an AA palette distinct from Renew and from the other clinic", () => {
    const own = readThemeTokens(readFileSync(new URL("../theme.css", import.meta.url), "utf8"));
    const otherId = orleans ? "embrun" : "orleans";
    const other = readThemeTokens(readFileSync(new URL(`../../../${otherId}/src/theme.css`, import.meta.url), "utf8"));
    expect(own["--accent"]).not.toBe(RENEW.accent);
    expect(own["--aqua"]).not.toBe(RENEW.aqua);
    expect(own["--accent"]).not.toBe(other["--accent"]);
    const pairs: Array<[string, string]> = [
      ["--ink", "--canvas"],
      ["--ink-soft", "--canvas"],
      ["--ink-soft", "--surface-alt"],
      ["--aqua-deep", "--canvas"],
      ["--aqua-deep", "--surface-alt"],
      ["--ink-deep", "--accent"],
      ["--accent", "--ink-deep"],
    ];
    for (const [foreground, background] of pairs) {
      expect(contrastRatio(own[foreground], own[background]), `${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio("#ffffff", own["--aqua"])).toBeGreaterThanOrEqual(4.5);
  });

  it("stores a validated lead and refuses bots", async () => {
    const form = leadSite.forms[0];
    const fields = Object.fromEntries(
      form.fields.map((field) => {
        if (field.type === "email") return [field.name, "ada@example.com"];
        if (field.type === "tel") return [field.name, "6135550199"];
        if (field.type === "select" || field.type === "radio") {
          return [field.name, (field.options ?? []).find((option) => option !== field.label) ?? ""];
        }
        return [field.name, field.name === "message" ? "I would like an appointment." : "Ada"];
      }),
    );
    const now = Date.now();
    const payload = { formId: form.id, pagePath: "/", startedAt: now - 5000, fields };
    const saved = validateLead(leadSite, payload, now);
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;
    const statement = leadInsert(saved.row);
    expect(statement.sql).toContain("INSERT INTO leads");
    expect(statement.params[7]).toBe(leadSite.id);

    expect(validateLead(leadSite, { ...payload, startedAt: now }, now).ok).toBe(false);
    expect(validateLead(leadSite, { ...payload, website: "https://spam.example" }, now).ok).toBe(false);

    let inserted = false;
    const response = await handleLeadPost(
      new Request("https://clinic.test/api/leads", { method: "POST", body: JSON.stringify(payload) }),
      leadSite,
      {
        now,
        insert: async () => {
          inserted = true;
        },
      },
    );
    expect(response.status).toBe(201);
    expect(inserted).toBe(true);
  });

  it("runs the same implant quiz and stores it on this clinic's leads table", async () => {
    expect(quizQuestions.map((question) => question.id)).toEqual([
      "situation",
      "arch",
      "frustrations",
      "duration",
      "health",
      "comfort",
      "payment",
      "timeline",
      "location",
    ]);
    const answers = {
      situation: ["dentures"],
      arch: ["lower"],
      frustrations: ["loose"],
      duration: ["over-5"],
      health: ["none"],
      comfort: ["nervous"],
      payment: ["cdcp"],
      timeline: ["asap"],
      location: [orleans ? "orleans" : "embrun"],
    };
    expect(scoreLead(answers, "call")).toEqual({ score: 90, tier: "hot" });
    expect(getResultPath(answers).path).toBe("denture-alternative");
    expect(quizConsentText(leadSite.name)).toContain(leadSite.name);
    expect(quizConsentText(leadSite.name)).not.toContain("Renew Implant Centre");
    expect(isQuizRoute("/implant-candidate-quiz")).toBe(true);
    expect(isQuizRoute(QUIZ_THANK_YOU_PATH)).toBe(true);
    expect(showsQuizCta("/")).toBe(true);
    expect(showsQuizCta("/services/dental-implants")).toBe(true);
    expect(showsQuizCta("/contact-us")).toBe(false);

    const now = Date.now();
    const payload = {
      firstName: "Ada",
      email: "ada@example.com",
      phone: "6135550199",
      preferredContact: "call",
      marketingConsent: true,
      answers,
      startedAt: now - 5000,
    };
    const stored: { sql: string; params: Array<string | null> }[] = [];
    const response = await handleQuizPost(
      new Request("https://clinic.test/api/quiz-leads", { method: "POST", body: JSON.stringify(payload) }),
      leadSite,
      {
        now,
        insert: async (sql, params) => {
          stored.push({ sql, params });
        },
      },
    );
    expect(response.status).toBe(201);
    expect(stored[0]?.params[1]).toBe("implant-candidate-quiz");
    expect(stored[0]?.params[7]).toBe(leadSite.id);
  });
});
