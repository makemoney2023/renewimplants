import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { catalog, pages, site } from "@/content/load";
import { contrastRatio, readThemeTokens } from "@shell/lib/contrast";
import { handleLeadPost, leadInsert, validateLead } from "@shell/lib/leads";
import { buildLlmsTxt } from "@shell/lib/llms";
import { isQuizRoute, QUIZ_PATH, QUIZ_THANK_YOU_PATH, showsQuizCta } from "@shell/quiz/paths";
import { getResultPath } from "@shell/quiz/result";
import { handleQuizPost, quizConsentText } from "@shell/quiz/store";
import { quizQuestions } from "../../../../src/lib/quiz/questions";
import { scoreLead } from "../../../../src/lib/quiz/score";
import { buildPageGraph, buildSiteGraph } from "@shell/lib/schema";
import sitemap from "@/app/sitemap";

const RENEW = { accent: "#8dc41d", aqua: "#009ce3" };

describe(site.name, () => {
  it("keeps the scraped page inventory and one heading per page", () => {
    expect(pages.length).toBe(site.id === "orleans" ? 49 : 33);
    expect(new Set(pages.map((page) => page.path)).size).toBe(pages.length);
    for (const page of pages) {
      expect(page.h1.trim().length).toBeGreaterThan(0);
      expect(page.path.endsWith("/") || page.path === "/").toBe(true);
      expect(page.blocks.some((block) => block.type === "heading" && block.level < 2)).toBe(false);
    }
  });

  it("does not call Tom a doctor and drops agency emails", () => {
    const blob = JSON.stringify({ site, pages });
    expect(blob).not.toMatch(/dr\.?\s+(tom|tomasz|szarski)/i);
    expect(blob).not.toMatch(/doctor\s+(tom|tomasz|szarski)/i);
    expect(blob).not.toMatch(/webmarketers|medianv/i);
  });

  it("keeps this clinic's logo and recovered facts", () => {
    expect(site.logo.startsWith(`/${site.id}/`)).toBe(true);
    expect(site.person?.honorificSuffix).toBe("DD");
    expect(site.person?.jobTitle).toBe("Denturist");
    if (site.id === "orleans") {
      expect(site.hours.find((hour) => hour.day === "Thursday")?.time).toBe("8:00am - 4:30pm");
      expect(site.hours.find((hour) => hour.day === "Friday")?.time).toBe("8:00am - 3:00pm");
      expect(site.redirects).toEqual([{ source: "/contact", destination: "/contact/" }]);
      expect(site.phone.label).toBe("613-590-9200");
      expect(catalog.teamPages().every((page) => page.hero.startsWith("/orleans/"))).toBe(true);
    } else {
      expect(site.phone.label).toBe("(613) 219-2945");
      expect(site.email).toBe("info@embrundentures.ca");
      expect(pages.filter((page) => page.kind === "legal")).toHaveLength(0);
      const nav = catalog.navigation();
      expect(nav.find((item) => item.label === "Service")?.children.some((child) => child.href.includes("full-dentures"))).toBe(true);
      expect(nav.some((item) => item.label === "Nearby")).toBe(true);
      expect(site.forms.map((form) => form.fields.find((field) => field.name === "patientType")?.options)).toEqual([
        ["New Patient", "Existing Patient"],
        ["New Patient", "Existing Patient"],
        ["New Patient", "Existing Patient"],
      ]);
    }
  });

  it("points media at this clinic's R2 prefix", () => {
    const media = [site.logo, site.logoInverse];
    for (const page of pages) {
      if (page.hero) media.push(page.hero);
      if (page.video) media.push(page.video);
      for (const block of page.blocks) {
        if (block.type === "image" || block.type === "video") media.push(block.src);
        if (block.type === "gallery") media.push(...block.images.map((image) => image.src));
      }
    }
    expect(media.length).toBeGreaterThan(10);
    for (const path of media) {
      expect(path.startsWith(`/${site.id}/`), path).toBe(true);
    }
  });

  it("publishes every page in the sitemap and llms.txt", () => {
    const urls = sitemap().map((entry) => new URL(entry.url).pathname);
    expect(urls.sort()).toEqual([...pages.map((page) => page.path), QUIZ_PATH].sort());
    expect(urls).not.toContain(QUIZ_THANK_YOU_PATH);
    const llms = buildLlmsTxt(site, pages);
    for (const page of pages) expect(llms).toContain(`${site.url}${page.path}`);
    expect(llms).toContain(`${site.url}${QUIZ_PATH}`);
    expect(llms).not.toContain(QUIZ_THANK_YOU_PATH);
  });

  it("builds dentist schema without copying broken blog JSON-LD", () => {
    const graph = buildSiteGraph(site);
    const practice = graph["@graph"][0] as { "@type": string[]; telephone: string };
    expect(practice["@type"]).toEqual(["Dentist", "LocalBusiness"]);
    expect(practice.telephone).toBe(site.id === "orleans" ? "+1-613-590-9200" : "+1-613-219-2945");
    const person = graph["@graph"].find((node) => node["@type"] === "Person") as { honorificSuffix: string };
    expect(person.honorificSuffix).toBe("DD");
    const faqPage = pages.find((page) => page.blocks.some((block) => block.type === "faq"));
    const plain = pages.find((page) => page.blocks.every((block) => block.type !== "faq"));
    expect(faqPage && JSON.stringify(buildPageGraph(site, catalog, faqPage))).toContain("FAQPage");
    expect(plain && JSON.stringify(buildPageGraph(site, catalog, plain))).not.toContain("FAQPage");
    expect(JSON.stringify(buildPageGraph(site, catalog, pages[0]))).not.toContain("preview=true");
  });

  it("uses an AA palette distinct from Renew and from the other clinic", () => {
    const own = readThemeTokens(readFileSync(new URL("../theme.css", import.meta.url), "utf8"));
    const otherId = site.id === "orleans" ? "embrun" : "orleans";
    const other = readThemeTokens(readFileSync(new URL(`../../../${otherId}/src/theme.css`, import.meta.url), "utf8"));
    expect(own["--accent"]).not.toBe(RENEW.accent);
    expect(own["--aqua"]).not.toBe(RENEW.aqua);
    expect(own["--accent"]).not.toBe(other["--accent"]);
    expect(own["--ink-deep"]).not.toBe(other["--accent"]);
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
    const form = site.forms[0];
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
    const saved = validateLead(site, payload, now);
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;
    const statement = leadInsert(saved.row);
    expect(statement.sql).toContain("INSERT INTO leads");
    expect(statement.params[1]).toBe(form.id);
    expect(statement.params[4]).toBe("ada@example.com");
    expect(statement.params[5]).toBe("+16135550199");
    expect(statement.params[7]).toBe(site.id);

    expect(validateLead(site, { ...payload, startedAt: now }, now).ok).toBe(false);
    expect(validateLead(site, { ...payload, website: "https://spam.example" }, now).ok).toBe(false);

    let inserted = false;
    const response = await handleLeadPost(new Request("https://clinic.test/api/leads", { method: "POST", body: JSON.stringify(payload) }), site, {
      now,
      insert: async () => {
        inserted = true;
      },
    });
    expect(response.status).toBe(201);
    expect(inserted).toBe(true);

    const failed = await handleLeadPost(
      new Request("https://clinic.test/api/leads", { method: "POST", body: JSON.stringify(payload) }),
      site,
      {
        now,
        insert: async () => {
          throw new Error("d1 unavailable");
        },
      },
    );
    expect(failed.status).toBe(500);
    expect(await failed.json()).toMatchObject({ error: expect.stringContaining(site.phone.label) });
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
      location: [site.id === "embrun" ? "embrun" : "orleans"],
    };
    expect(scoreLead(answers, "call")).toEqual({ score: 90, tier: "hot" });
    expect(getResultPath(answers).path).toBe("denture-alternative");
    expect(getResultPath(answers).modifiers).toEqual(expect.arrayContaining(["sedation", "lower", "coverage"]));
    expect(quizConsentText(site.name)).toContain(site.name);
    expect(quizConsentText(site.name)).not.toContain("Renew Implant Centre");
    expect(isQuizRoute("/implant-candidate-quiz")).toBe(true);
    expect(isQuizRoute(QUIZ_THANK_YOU_PATH)).toBe(true);
    expect(isQuizRoute("/contact/")).toBe(false);
    expect(showsQuizCta("/")).toBe(true);
    expect(showsQuizCta(site.id === "embrun" ? "/service/dental-implants-embrun-on/" : "/implants/")).toBe(true);
    expect(showsQuizCta("/contact/")).toBe(false);

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
      site,
      {
        now,
        insert: async (sql, params) => {
          stored.push({ sql, params });
        },
      },
    );
    expect(response.status).toBe(201);
    const body = (await response.json()) as { resultPath: string; leadTier: string };
    expect(body).toMatchObject({ resultPath: "denture-alternative", leadTier: "hot" });
    expect(stored[0]?.sql).toContain("site_id");
    expect(stored[0]?.params[1]).toBe("implant-candidate-quiz");
    expect(stored[0]?.params[7]).toBe(site.id);
    expect(String(stored[0]?.params[6])).toContain(`"leadScore":"90"`);
    const rejected = await handleQuizPost(
      new Request("https://clinic.test/api/quiz-leads", {
        method: "POST",
        body: JSON.stringify({ ...payload, startedAt: now, website: "spam" }),
      }),
      site,
      { now, insert: async () => undefined },
    );
    expect(rejected.status).toBe(400);
  });
});
