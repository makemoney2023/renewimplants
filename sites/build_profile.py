#!/usr/bin/env python3
"""Build Renew-shaped clinic profiles from the scraped page JSON.

Facts come from sites/<id>/content/pages.json and site.json. Copy that is not
in the scrape is not invented: pricing, before-and-after, and other Renew-only
pages are omitted and listed in content/omitted.json.
"""

from __future__ import annotations

import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent

RENEW_REDIRECTS = [
    "/pricing",
    "/before-after",
    "/services/all-on-4-dental-implants",
    "/services/full-arch-dental-implants",
    "/services/same-day-dental-implants",
    "/services/upper-jaw-implants",
    "/services/lower-jaw-implants",
    "/services/denture-alternative",
    "/services/sedation-dentistry",
    "/services/failed-dental-work",
    "/easy-implant-en",
    "/easy-implant",
    "/for-dentists",
    "/blog/dentures-vs-dental-implants",
    "/blog/full-arch-vs-individual-dental-implants",
    "/blog/why-people-are-choosing-all-on-4",
    "/blog/same-day-dental-implants-new-teeth-one-day",
    "/blog/all-on-4-dental-implants-after-years-of-missing-teeth",
]


class TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)


def text_of(html: str) -> str:
    parser = TextExtractor()
    parser.feed(html or "")
    return re.sub(r"\s+", " ", " ".join(parser.parts)).strip()


def scrub(value: str) -> str:
    value = re.sub(r"\bDr\.?\s+(?=(Tom|Tomasz|Szarski)\b)", "", value, flags=re.I)
    value = re.sub(r"webmarketers\.ca|medianv\.com|admin@webmarketers\.ca|mittalvala@medianv\.com", "", value, flags=re.I)
    return re.sub(r"\s+", " ", value).strip()


def clip(value: str, limit: int) -> str:
    value = scrub(value)
    if len(value) <= limit:
        return value
    cut = value.rfind(". ", 0, limit)
    if cut < 40:
        cut = value.rfind(" ", 0, limit)
    if cut < 40:
        cut = limit
    trimmed = value[: cut + 1].strip()
    return trimmed if trimmed.endswith((".", "!", "?")) else f"{trimmed}."


class Raw:
    def __init__(self, code: str) -> None:
        self.code = code


def media_expr(path: str) -> Raw:
    return Raw(f"mediaUrl({json.dumps(path)})")


def ts(value: object, indent: int = 0) -> str:
    pad = "  " * indent
    if isinstance(value, Raw):
        return value.code
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, bool):
        return "true" if value else "false"
    if value is None:
        return "null"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        if not value:
            return "[]"
        inner = ",\n".join(f"{pad}  {ts(item, indent + 1)}" for item in value)
        return f"[\n{inner},\n{pad}]"
    if isinstance(value, dict):
        if not value:
            return "{}"
        rows = []
        for key, item in value.items():
            name = key if re.fullmatch(r"[A-Za-z_$][\w$]*", str(key)) else json.dumps(str(key))
            rows.append(f"{pad}  {name}: {ts(item, indent + 1)}")
        return "{\n" + ",\n".join(rows) + f",\n{pad}}}"
    raise TypeError(type(value))


def load(site_id: str) -> tuple[dict, list[dict]]:
    base = ROOT / site_id / "content"
    site = json.loads((base / "site.json").read_text())
    pages = json.loads((base / "pages.json").read_text())
    return site, pages


def page_map(pages: list[dict]) -> dict[str, dict]:
    return {page["path"]: page for page in pages}


def paragraphs(page: dict) -> list[str]:
    found = []
    for block in page["blocks"]:
        if block["type"] == "paragraph":
            value = scrub(text_of(block.get("html", "")))
            if value:
                found.append(value)
        elif block["type"] == "list":
            items = [scrub(item) for item in block.get("items") or [] if scrub(item)]
            if items:
                found.append(" ".join(items))
    return found


def sections_from(page: dict, limit: int = 14) -> list[dict]:
    sections: list[dict] = []
    heading = ""
    buffer: list[str] = []

    def flush() -> None:
        nonlocal heading, buffer
        body = scrub(" ".join(buffer))
        if heading and body:
            sections.append({"heading": heading[:140], "body": body[:1800]})
        heading = ""
        buffer = []

    for block in page["blocks"]:
        if block["type"] == "heading" and block.get("level", 2) <= 2:
            flush()
            heading = scrub(block.get("text", ""))
        elif block["type"] == "heading" and heading:
            bit = scrub(block.get("text", ""))
            if bit:
                buffer.append(bit)
        elif block["type"] == "paragraph":
            bit = scrub(text_of(block.get("html", "")))
            if bit:
                buffer.append(bit)
        elif block["type"] == "list":
            items = [scrub(item) for item in block.get("items") or [] if scrub(item)]
            if items:
                buffer.append(" ".join(items))
    flush()
    if not sections:
        body = scrub(" ".join(paragraphs(page)))
        if body:
            sections.append({"heading": scrub(page.get("h1") or "Details"), "body": body[:1800]})
    seen: dict[str, int] = {}
    unique = []
    for section in sections[:limit]:
        key = section["heading"]
        seen[key] = seen.get(key, 0) + 1
        if seen[key] > 1:
            section = {**section, "heading": f"{key} ({seen[key]})"}
        unique.append(section)
    return unique


def faqs_of(page: dict) -> list[dict]:
    found = []
    seen = set()
    for block in page["blocks"]:
        if block["type"] != "faq":
            continue
        for item in block.get("items") or []:
            question = scrub(item.get("q") or "")
            answer = scrub(text_of(item.get("a") or ""))
            if not question or not answer or question in seen:
                continue
            seen.add(question)
            found.append({"question": question, "answer": answer[:2000]})
    return found


def images_of(page: dict) -> list[dict]:
    found = []
    seen = set()

    def add(src: str, alt: str) -> None:
        if not src or src in seen:
            return
        seen.add(src)
        found.append({"src": src, "alt": scrub(alt) or "Clinic photo"})

    add(page.get("hero") or "", page.get("h1") or "Clinic photo")
    for block in page["blocks"]:
        if block["type"] == "image":
            add(block.get("src") or "", block.get("alt") or page.get("h1") or "Clinic photo")
        elif block["type"] == "gallery":
            for image in block.get("images") or []:
                add(image.get("src") or "", image.get("alt") or page.get("h1") or "Clinic photo")
    return found


def quotes_of(pages: list[dict], location: str) -> list[dict]:
    found = []
    seen = set()
    for page in pages:
        for block in page["blocks"]:
            if block["type"] != "quotes":
                continue
            for item in block.get("items") or []:
                name = scrub(item.get("name") or "")
                quote = scrub(item.get("quote") or "")
                key = (name, quote)
                if not name or not quote or key in seen:
                    continue
                seen.add(key)
                found.append({"name": name, "location": location, "quote": quote})
    return found


def form_id(page: dict | None) -> str | None:
    if not page:
        return None
    for block in page["blocks"]:
        if block["type"] == "form" and block.get("id"):
            return block["id"]
    return None


def slug_of(path: str) -> str:
    return path.strip("/").split("/")[-1]


def rewrite_href(href: str, mapping: dict[str, str], site_url: str) -> str:
    if not href or href.startswith(("mailto:", "tel:", "#")):
        return href
    cleaned = href
    for prefix in (site_url, site_url.replace("https://www.", "https://"), site_url.replace("https://", "https://www.")):
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix) :] or "/"
    if cleaned.startswith("http"):
        return href
    path = cleaned.split("?")[0].split("#")[0]
    if not path.startswith("/"):
        path = f"/{path}"
    if not path.endswith("/"):
        path = f"{path}/"
    target = mapping.get(path) or mapping.get(path.rstrip("/") or "/")
    return target or href


class InlineHtml(HTMLParser):
    def __init__(self, mapping: dict[str, str], site_url: str) -> None:
        super().__init__(convert_charrefs=True)
        self.mapping = mapping
        self.site_url = site_url
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag not in {"a", "strong", "em", "b"}:
            return
        if tag == "a":
            href = dict(attrs).get("href") or ""
            href = rewrite_href(href, self.mapping, self.site_url)
            self.parts.append(f'<a href="{json.dumps(href)[1:-1]}">')
        else:
            self.parts.append(f"<{tag}>")

    def handle_endtag(self, tag: str) -> None:
        if tag in {"a", "strong", "em", "b"}:
            self.parts.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        self.parts.append(
            data.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        )


def inline_html(html: str, mapping: dict[str, str], site_url: str) -> str:
    parser = InlineHtml(mapping, site_url)
    parser.feed(html or "")
    return scrub("".join(parser.parts))


def heading_id(text: str, seen: dict[str, int]) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "section"
    seen[base] = seen.get(base, 0) + 1
    return base if seen[base] == 1 else f"{base}-{seen[base]}"


def post_html(page: dict, mapping: dict[str, str], site_url: str) -> tuple[str, list[dict]]:
    parts: list[str] = []
    headings: list[dict] = []
    seen: dict[str, int] = {}
    for block in page["blocks"]:
        if block["type"] == "heading" and block.get("level", 2) <= 3:
            level = 2 if block.get("level", 2) <= 2 else 3
            label = scrub(block.get("text", ""))
            if not label:
                continue
            anchor = heading_id(label, seen)
            headings.append({"id": anchor, "text": label})
            parts.append(f'<h{level} id="{anchor}">{label}</h{level}>')
        elif block["type"] == "paragraph":
            inner = inline_html(block.get("html", ""), mapping, site_url)
            if inner:
                parts.append(f"<p>{inner}</p>")
        elif block["type"] == "list":
            items = [scrub(item) for item in block.get("items") or [] if scrub(item)]
            if not items:
                continue
            tag = "ol" if block.get("ordered") else "ul"
            lis = "".join(f"<li>{item}</li>" for item in items)
            parts.append(f"<{tag}>{lis}</{tag}>")
    return "".join(parts), headings


def phone_e164(label: str) -> str:
    digits = re.sub(r"\D", "", label)
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return f"+1-{digits[0:3]}-{digits[3:6]}-{digits[6:10]}"


def route(
    slug: str,
    *,
    title: str,
    intro: str,
    image: str,
    eyebrow: str,
    sections: list[dict],
    links: list[dict],
    faqs: list[dict] | None = None,
    quotes: list[dict] | None = None,
    hours: list[dict] | None = None,
    map_href: str | None = None,
    photos: list[dict] | None = None,
) -> dict:
    payload: dict = {
        "slug": slug,
        "grammar": "document",
        "eyebrow": eyebrow,
        "title": title,
        "intro": intro,
        "image": media_expr(image) if image.startswith("/") else image,
        "sections": sections or [{"heading": title, "body": intro}],
        "links": links,
    }
    if faqs:
        payload["faqs"] = faqs
    if quotes:
        payload["quotes"] = quotes
    if hours:
        payload["hours"] = hours
    if map_href:
        payload["mapHref"] = map_href
    if photos:
        payload["photos"] = [
            {"src": media_expr(photo["src"]) if photo["src"].startswith("/") else photo["src"], "alt": photo["alt"]}
            for photo in photos
        ]
    return payload


def build(site_id: str) -> None:
    site, pages = load(site_id)
    by_path = page_map(pages)
    profile = CLINICS[site_id]
    locality = site["address"]["locality"]
    address = site["address"]["label"]
    quotes = quotes_of(pages, f"{locality}, ON")
    home = by_path["/"]
    hero_path = home.get("hero") or ""
    tom_path = profile["tom_path"]
    tom = by_path[tom_path]
    tom_image = tom.get("hero") or hero_path

    old_to_new: dict[str, str] = {}
    for old, new in profile["paths"].items():
        old_to_new[old if old.endswith("/") else f"{old}/"] = new
    for page in pages:
        if page.get("kind") == "post":
            old_to_new[page["path"]] = f"/blog/{slug_of(page['path'])}"

    def dest_for(path: str) -> str:
        if path in old_to_new:
            return old_to_new[path]
        slash = path if path.endswith("/") else f"{path}/"
        return old_to_new.get(slash, path)

    team_pages = [page for page in pages if page["path"].startswith("/team/") and page["path"] != tom_path]

    def links_for(*pairs: tuple[str, str]) -> list[dict]:
        return [{"label": label, "href": href} for label, href in pairs]

    primary = links_for((profile["primary_label"], "/contact-us"), (site["phone"]["label"], site["phone"]["href"]))
    eyebrow = profile["eyebrow"]

    routes: list[dict] = []

    def add_scraped(slug: str, source: str, extra_links: list[tuple[str, str]] | None = None, photos: list[dict] | None = None) -> None:
        page = by_path[source]
        secs = sections_from(page)
        useful = [item for item in paragraphs(page) if len(item) > 80]
        intro = clip(useful[0] if useful else (page.get("description") or page.get("h1") or ""), 360)
        image = (images_of(page) or [{"src": hero_path}])[0]["src"]
        title = scrub(page.get("h1") or slug)
        if len(title) > 88:
            title = clip(title, 88).rstrip(".")
        page_links = primary + links_for(*(extra_links or []))
        routes.append(
            route(
                slug,
                title=title,
                intro=intro or title,
                image=image,
                eyebrow=eyebrow,
                sections=secs,
                links=page_links[:4],
                faqs=faqs_of(page),
                photos=photos,
            )
        )

    for old, new in profile["service_order"]:
        add_scraped(new.removeprefix("/"), old)

    # Other mapped pages
    for old, new in profile["pages"]:
        if new in {item[1] for item in profile["service_order"]}:
            continue
        add_scraped(new.removeprefix("/"), old)

    # Tom
    tom_sections = sections_from(tom) or [{"heading": "Tom Szarski, DD", "body": paragraphs(tom)[0]}]
    if not tom_sections and paragraphs(tom):
        tom_sections = [{"heading": "Tom Szarski, DD", "body": " ".join(paragraphs(tom))[:1800]}]
    if paragraphs(tom) and not any(section["heading"].startswith("Tom") for section in tom_sections):
        tom_sections = [{"heading": "Tom Szarski, DD", "body": " ".join(paragraphs(tom))[:1800]}, *tom_sections]
    if team_pages:
        names = []
        for member in team_pages:
            blurb = clip(paragraphs(member)[0], 180) if paragraphs(member) else ""
            names.append(f"{scrub(member['h1'])} ({blurb})" if blurb else scrub(member["h1"]))
        tom_sections.append({"heading": "The team", "body": " ".join(names)[:1800]})
    team_links = [(scrub(member["h1"]), f"/team/{slug_of(member['path'])}") for member in team_pages[:6]]
    routes.append(
        route(
            "meet-your-dentist",
            title="Tom Szarski, DD",
            intro=clip(paragraphs(tom)[0], 360),
            image=tom_image,
            eyebrow="Denturist",
            sections=tom_sections,
            links=primary + links_for(*team_links[:3]),
        )
    )
    for member in team_pages:
        add_scraped(f"team/{slug_of(member['path'])}", member["path"], [("Meet Tom Szarski, DD", "/meet-your-dentist")])

    # why choose us
    if profile["why_source"]:
        add_scraped("why-choose-us", profile["why_source"], [("Meet Tom Szarski, DD", "/meet-your-dentist")])
        # rename if the scraped h1 is just About
        for item in routes:
            if item["slug"] == "why-choose-us" and item["title"].lower() in {"about", "about us"}:
                item["title"] = f"Why {site['shortName']}"
    else:
        why_sections = profile["why_sections"]
        routes.append(
            route(
                "why-choose-us",
                title="Why patients come here",
                intro=clip(why_sections[0]["body"], 360),
                image=profile["lab_image"],
                eyebrow=eyebrow,
                sections=why_sections,
                links=primary + links_for(("Our lab", "/our-lab"), ("Meet Tom Szarski, DD", "/meet-your-dentist")),
            )
        )

    if profile["stories"] and quotes:
        routes.append(
            route(
                "patient-stories",
                title="Patient stories",
                intro="Reviews published on the clinic site, in the patients' own words.",
                image=tom_image,
                eyebrow=eyebrow,
                sections=[{"heading": "Client reviews", "body": "These notes are the named reviews carried over from the previous site."}],
                links=primary,
                quotes=quotes,
            )
        )

    if profile["anxiety_faq"]:
        question, answer = profile["anxiety_faq"]
        routes.append(
            route(
                "dental-anxiety",
                title="Sedation for anxious patients",
                intro=clip(answer, 360),
                image=hero_path,
                eyebrow=eyebrow,
                sections=[{"heading": question, "body": answer}],
                links=primary + links_for(("Dental implants", "/services/dental-implants")),
                faqs=[{"question": question, "answer": answer}],
            )
        )

    # FAQ
    faq_items: list[dict] = []
    seen_q = set()
    for source in profile["faq_sources"]:
        for item in faqs_of(by_path[source]):
            if item["question"] in seen_q:
                continue
            seen_q.add(item["question"])
            faq_items.append(item)
    if not profile["faq_sources"]:
        for page in pages:
            for item in faqs_of(page):
                if item["question"] in seen_q:
                    continue
                seen_q.add(item["question"])
                faq_items.append(item)
    routes.append(
        route(
            "faq",
            title="Frequently asked questions",
            intro=clip(faq_items[0]["answer"], 280) if faq_items else site["description"],
            image=hero_path,
            eyebrow=eyebrow,
            sections=[{"heading": "Questions from the clinic site", "body": "Answers below are the questions and answers published on the previous site."}],
            links=primary,
            faqs=faq_items,
        )
    )

    # Service areas
    area_sections = []
    for old in profile["area_pages"]:
        page = by_path[old]
        body = clip(" ".join(paragraphs(page)[:2]) or page.get("description") or page["h1"], 700)
        heading = scrub(page["h1"])
        # The scraped Embrun landing listed 614 Notre-Dame with Orleans's postal K1C 1G7.
        if "Notre-Dame" in body and "K1C 1G7" in body:
            heading = "Embrun"
            served = ", ".join(area.split(",")[0] for area in site.get("areaServed") or [])
            body = (
                "Looking For Dentures In Embrun? Orleans Denture Clinic is Worth The Drive! "
                f"Patients come from {served}."
            )
        area_sections.append({"heading": heading, "body": body})
    if not area_sections:
        area_sections.append(
            {
                "heading": "Areas we see patients from",
                "body": f"{site['name']} is at {address}. Patients come from {', '.join(site['areaServed'])}.",
            }
        )
    area_links = []
    for old in profile["area_children"]:
        area_links.append((scrub(by_path[old]["h1"]), dest_for(old)))
        add_scraped(dest_for(old).removeprefix("/"), old)
    routes.append(
        route(
            "service-areas",
            title="Service areas",
            intro=area_sections[0]["body"],
            image=hero_path,
            eyebrow=eyebrow,
            sections=area_sections,
            links=primary + links_for(*area_links[:4]),
        )
    )

    # Contact
    contact = by_path[profile["contact_path"]]
    contact_intro = clip(" ".join(paragraphs(contact)[:2]) or f"Call {site['phone']['label']} or send a note. The clinic is at {address}.", 360)
    routes.append(
        route(
            "contact-us",
            title=scrub(contact.get("h1") or "Contact"),
            intro=contact_intro,
            image=hero_path,
            eyebrow=eyebrow,
            sections=sections_from(contact) or [{"heading": "Visit the clinic", "body": f"{address}. Phone {site['phone']['label']}. Email {site['email']}."}],
            links=links_for(("Call the clinic", site["phone"]["href"]), ("Email the clinic", f"mailto:{site['email']}")),
            hours=site["hours"],
            map_href=site["mapHref"],
        )
    )

    if profile.get("appointment_path"):
        add_scraped("request-an-appointment", profile["appointment_path"])

    if profile.get("gallery_path"):
        gallery = by_path[profile["gallery_path"]]
        photos = images_of(gallery)[:12]
        routes.append(
            route(
                "gallery",
                title="Clinic gallery",
                intro="Photographs of the clinic. These are office photos, not before-and-after treatment pairs.",
                image=photos[0]["src"] if photos else hero_path,
                eyebrow=eyebrow,
                sections=[{"heading": "The clinic", "body": "Photos published in the clinic gallery."}],
                links=primary,
                photos=photos[1:] or photos,
            )
        )

    routes.append(
        route(
            "sitemap",
            title="Sitemap",
            intro=f"Every public page on {site['name']}.",
            image=hero_path,
            eyebrow=eyebrow,
            sections=[{"heading": "Find a page", "body": "The list below is generated from the pages on this site."}],
            links=primary,
        )
    )

    # Blog posts
    blog_posts = []
    for page in pages:
        if page.get("kind") != "post":
            continue
        slug = slug_of(page["path"])
        html, headings = post_html(page, old_to_new, site["url"])
        description = clip(page.get("description") or (paragraphs(page)[0] if paragraphs(page) else page["h1"]), 220)
        published = (page.get("published") or page.get("modified") or "")[:10]
        image = page.get("hero") or hero_path
        blog_posts.append(
            {
                "slug": slug,
                "title": scrub(page["h1"]),
                "description": description,
                "date": published,
                "image": image,
                "imageAlt": scrub(page["h1"]),
                "html": html or f"<p>{description}</p>",
                "headings": headings,
            }
        )

    blog_index = by_path.get(profile["blog_index"])
    blog_intro = ""
    if blog_index and paragraphs(blog_index):
        blog_intro = clip(paragraphs(blog_index)[0], 280)
    elif blog_index and blog_index.get("description"):
        blog_intro = clip(blog_index["description"], 280)
    else:
        blog_intro = site["description"]

    # Redirects
    redirects = []
    seen_sources = set()

    def add_redirect(source: str, destination: str) -> None:
        if not source.startswith("/"):
            source = f"/{source}"
        bare = source.rstrip("/") or "/"
        if bare == destination.rstrip("/") or source == destination:
            return
        for candidate in {bare, f"{bare}/"} if bare != "/" else set():
            if candidate in seen_sources or candidate.rstrip("/") == destination:
                continue
            seen_sources.add(candidate)
            redirects.append({"source": candidate, "destination": destination})

    for old, new in old_to_new.items():
        add_redirect(old, new)
    fallback = {
        "/pricing": "/canadian-dental-care-plan",
        "/before-after": profile["before_after_dest"],
        "/services/all-on-4-dental-implants": "/services/dental-implants",
        "/services/full-arch-dental-implants": "/services/dental-implants",
        "/services/same-day-dental-implants": "/services/dental-implants",
        "/services/upper-jaw-implants": "/services/dental-implants",
        "/services/lower-jaw-implants": "/services/dental-implants",
        "/services/denture-alternative": "/services/dentures",
        "/services/sedation-dentistry": profile["sedation_dest"],
        "/services/failed-dental-work": "/services/dental-implants",
        "/easy-implant-en": "/services/dental-implants",
        "/easy-implant": "/services/dental-implants",
        "/for-dentists": "/contact-us",
        "/blog/dentures-vs-dental-implants": profile["dentures_vs_dest"],
        "/blog/full-arch-vs-individual-dental-implants": "/services/dental-implants",
        "/blog/why-people-are-choosing-all-on-4": "/services/dental-implants",
        "/blog/same-day-dental-implants-new-teeth-one-day": "/services/dental-implants",
        "/blog/all-on-4-dental-implants-after-years-of-missing-teeth": "/services/dental-implants",
        "/patient-stories": "/patient-stories" if profile["stories"] else "/why-choose-us",
        "/dental-anxiety": "/dental-anxiety" if profile["anxiety_faq"] else "/faq",
        "/privacy-policy": "/privacy-policy" if profile["legal"] else "/contact-us",
        "/terms": "/terms" if profile["legal"] else "/contact-us",
        "/services": "/services/dentures",
        "/about": "/meet-your-dentist",
        "/home": "/",
    }
    for source, destination in fallback.items():
        if destination == source:
            continue
        add_redirect(source, destination)

    # Drop redirects whose destination is not a real path
    real_paths = {"/", "/blog", "/implant-candidate-quiz"}
    real_paths.update(f"/{item['slug']}" for item in routes)
    real_paths.update(f"/blog/{post['slug']}" for post in blog_posts)
    bad = [item for item in redirects if item["destination"] not in real_paths]
    if bad:
        raise SystemExit(f"redirects to missing pages: {bad[:8]}")

    # Nav
    service_links = [{"label": scrub(by_path[old]["h1"]), "href": new} for old, new in profile["service_order"]]
    about_links = [{"label": "Meet Tom Szarski, DD", "href": "/meet-your-dentist"}, {"label": "Why choose us", "href": "/why-choose-us"}]
    if profile["anxiety_faq"]:
        about_links.append({"label": "Dental anxiety", "href": "/dental-anxiety"})
    if profile["stories"] and quotes:
        about_links.append({"label": "Patient stories", "href": "/patient-stories"})
    if profile.get("lab_path"):
        about_links.append({"label": "Our lab", "href": "/our-lab"})
    if profile.get("gallery_path"):
        about_links.append({"label": "Gallery", "href": "/gallery"})
    patient_links = [
        {"label": "Am I a candidate? Take the quiz", "href": "/implant-candidate-quiz"},
        {"label": "What to expect", "href": "/what-to-expect"},
        {"label": "Canadian Dental Care Plan", "href": "/canadian-dental-care-plan"},
        {"label": "FAQ", "href": "/faq"},
        {"label": "Service areas", "href": "/service-areas"},
    ]
    if profile.get("appointment_path"):
        patient_links.append({"label": "Request an appointment", "href": "/request-an-appointment"})
    blog_links = [{"label": clip(post["title"], 48).rstrip("."), "href": f"/blog/{post['slug']}"} for post in blog_posts[:5]]
    contact_links = [{"label": "Contact us", "href": "/contact-us"}]
    if profile.get("appointment_path"):
        contact_links.append({"label": "Request an appointment", "href": "/request-an-appointment"})
    nav = [
        {"label": "Services", "href": "/services/dentures", "children": service_links},
        {"label": "About", "href": "/meet-your-dentist", "children": about_links},
        {"label": "Patients", "href": "/what-to-expect", "children": patient_links},
        {"label": "Blog", "href": "/blog", "children": blog_links},
        {"label": "Contact", "href": "/contact-us", "children": contact_links},
    ]

    legal = [
        {"label": "Sitemap", "href": "/sitemap"},
        {"label": "FAQ", "href": "/faq"},
    ]
    if profile["legal"]:
        legal.extend(
            [
                {"label": "Privacy policy", "href": "/privacy-policy"},
                {"label": "Terms of use", "href": "/terms"},
            ]
        )
    sitemap_extras = [{"label": "Home", "href": "/"}] + [item for item in legal if item["href"] != "/sitemap"]

    # Homepage acts
    trust_page = by_path.get(profile.get("lab_path") or "") if profile.get("lab_path") else None
    trust_body = clip(profile["trust_body"], 320)
    choice_body = clip(profile["choice_body"], 320)
    tom_body = clip(paragraphs(tom)[0], 320)
    proof_body = clip(profile["proof_body"], 320)
    close_body = clip(profile["close_body"], 320)
    tiles = []
    for src, alt in profile["tiles"]:
        if src:
            tiles.append({"src": src, "alt": alt})
    while len(tiles) < 4:
        tiles.append(tiles[-1])

    treatment_cards = []
    for old, new, title in profile["treatments"]:
        page = by_path[old]
        body = clip(paragraphs(page)[0] if paragraphs(page) else page.get("description") or title, 180)
        image = page.get("hero") or hero_path
        treatment_cards.append(
            {
                "title": title,
                "body": body,
                "href": new,
                "image": media_expr(image),
                "imageAlt": scrub(page.get("h1") or title),
            }
        )

    steps = []
    expect = by_path[profile["expect_path"]]
    expect_sections = sections_from(expect)[:3]
    if len(expect_sections) < 3:
        for paragraph in paragraphs(expect):
            if len(steps) >= 3:
                break
            steps.append({"title": clip(paragraph, 42).rstrip("."), "body": clip(paragraph, 220)})
    else:
        steps = [{"title": section["heading"], "body": clip(section["body"], 220)} for section in expect_sections[:3]]
    while len(steps) < 3:
        steps.append({"title": "Call the clinic", "body": f"Phone {site['phone']['label']} or use the contact form. The clinic is at {address}."})

    home_faqs = [item["question"] for item in faq_items[:3]]
    while len(home_faqs) < 3 and faq_items:
        home_faqs.append(faq_items[0]["question"])

    forms = {}
    contact_form = form_id(contact) or site["forms"][0]["id"]
    forms["contact-us"] = contact_form
    if profile.get("appointment_path"):
        forms["request-an-appointment"] = form_id(by_path[profile["appointment_path"]]) or contact_form

    omitted = profile["omitted"]

    out = ROOT / site_id / "src" / "profile"
    out.mkdir(parents=True, exist_ok=True)

    site_ts = f"""import leadSiteJson from "../../content/site.json";
import type {{ ClinicSite }} from "@shell/types";
import type {{ ScrollAct, TreatmentCard }} from "../../../../src/content/site";

const MEDIA_BASE = (
  process.env.MEDIA_BASE_URL ||
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
  {json.dumps(site["mediaBaseDefault"])}
).replace(/\\/$/, "");

export function mediaUrl(path: string) {{
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${{MEDIA_BASE}}${{path.startsWith("/") ? path : `/${{path}}`}}`;
}}

export const leadSite = leadSiteJson as ClinicSite;

export const site = {{
  name: {json.dumps(site["name"])},
  shortName: {json.dumps(site["shortName"])},
  url: {json.dumps(site["url"])},
  description: {json.dumps(site["description"])},
  phone: {ts(site["phone"], 1)},
  email: {json.dumps(site["email"])},
  primaryCta: {{ label: {json.dumps(profile["primary_label"])}, href: "/contact-us" }},
  secondaryCta: {{ label: {json.dumps(profile["secondary_label"])}, href: {json.dumps(profile["secondary_href"])} }},
  address: {json.dumps(address)},
  mapHref: {json.dumps(site["mapHref"])},
  hours: {ts(site["hours"], 1)},
}};

export const heroLines: readonly [string, string] = {json.dumps(profile["hero_lines"])};
export const headerCta = {json.dumps(profile["header_cta"])};
export const trustNote = {{ strong: {json.dumps(profile["trust_strong"])}, span: {json.dumps(profile["trust_span"])} }};
export const panorama = {{ label: {json.dumps(profile["panorama_label"])}, caption: {json.dumps(profile["panorama_caption"])} }};
export const doctorLink = {{ label: {json.dumps(profile["doctor_label"])}, href: "/meet-your-dentist" }};
export const featuredReviewNames: string[] = [];
export const footerNote = {json.dumps(profile["footer_note"])};
export const legalLinks = {ts(legal, 0)};
export const sitemapExtras = {ts(sitemap_extras, 0)};
export const brandLogo = {{ src: mediaUrl({json.dumps(site["logo"])}), width: {profile["logo_width"]}, height: {profile["logo_height"]} }};
export const homeFaqQuestions = {json.dumps(home_faqs)} as const;
export const blogHero = {{ src: mediaUrl({json.dumps(tom_image)}), alt: "Tom Szarski, DD" }};
export const blogIntro = {json.dumps(blog_intro)};
export const blogTitle = {json.dumps(profile["blog_h1"])};
export const formsBySlug: Record<string, string> = {ts(forms, 0)};

export const practice = {{
  telephone: {json.dumps(phone_e164(site["phone"]["label"]))},
  streetAddress: {json.dumps(site["address"]["street"])},
  addressLocality: {json.dumps(site["address"]["locality"])},
  addressRegion: {json.dumps(site["address"]["region"])},
  postalCode: {json.dumps(site["address"]["postalCode"])},
  addressCountry: {json.dumps(site["address"]["country"])},
  areaServed: {json.dumps([area.split(",")[0] for area in site["areaServed"]])},
  availableLanguage: {json.dumps(site["languages"])},
  paymentAccepted: "Canadian Dental Care Plan (CDCP)",
  servicesHub: "/services/dentures",
  person: {{
    name: "Tom Szarski",
    honorificSuffix: "DD",
    jobTitle: "Denturist",
    path: "/meet-your-dentist",
    alumniOf: "George Brown College",
    memberOf: "Denturist Association of Ontario",
  }},
}};

export const media = {{
  heroClinic: mediaUrl({json.dumps(hero_path)}),
  heroConsult: mediaUrl({json.dumps(tom_image)}),
  clinic: mediaUrl({json.dumps(hero_path)}),
  tom: mediaUrl({json.dumps(tom_image)}),
  team: mediaUrl({json.dumps(tiles[2]["src"])}),
}};

export const implantAnimation: {{
  poster: string;
  mobilePoster: string;
  webm: string;
  video: string;
  mobileWebm: string;
  mobileVideo: string;
  alt: string;
}} | null = null;

export const scrollActs: ScrollAct[] = [
  {{
    id: "arrival",
    label: {json.dumps(profile["hero_label"])},
    title: {json.dumps(profile["hero_title"])},
    body: {json.dumps(clip(profile["hero_body"], 240))},
    image: media.heroClinic,
    imageAlt: {json.dumps(profile["hero_alt"])},
    device: "parallax" as const,
    span: 1.7,
  }},
  {{
    id: "trust",
    label: {json.dumps(profile["trust_label"])},
    title: {json.dumps(profile["trust_title"])},
    body: {json.dumps(trust_body)},
    image: mediaUrl({json.dumps(profile["trust_image"])}),
    imageAlt: {json.dumps(profile["trust_alt"])},
    device: "kinetic" as const,
    span: 1.5,
  }},
  {{
    id: "choice",
    label: {json.dumps(profile["choice_label"])},
    title: {json.dumps(profile["choice_title"])},
    body: {json.dumps(choice_body)},
    image: mediaUrl({json.dumps(treatment_cards[0]["image"].code if False else profile["choice_image"])}),
    imageAlt: {json.dumps(profile["choice_alt"])},
    device: "rail" as const,
    span: 2,
  }},
  {{
    id: "connection",
    label: "Meet Tom Szarski, DD",
    title: "Tom Szarski, DD.",
    body: {json.dumps(tom_body)},
    image: media.tom,
    imageAlt: "Portrait of denturist Tom Szarski",
    device: "split" as const,
    span: 1.4,
  }},
  {{
    id: "proof",
    label: {json.dumps(profile["proof_label"])},
    title: {json.dumps(profile["proof_title"])},
    body: {json.dumps(proof_body)},
    image: media.clinic,
    imageAlt: {json.dumps(profile["hero_alt"])},
    device: "panorama" as const,
    span: 2.8,
    peak: true,
  }},
  {{
    id: "commitment",
    label: {json.dumps(profile["close_label"])},
    title: {json.dumps(profile["close_title"])},
    body: {json.dumps(close_body)},
    image: media.heroClinic,
    imageAlt: {json.dumps(profile["hero_alt"])},
    device: "iris" as const,
    span: 1.4,
  }},
];

export const treatments: TreatmentCard[] = {ts(treatment_cards, 0)};

export const processSteps = {ts(steps, 0)};

export const panoramaTiles = {ts([{"src": media_expr(tile["src"]), "alt": tile["alt"]} for tile in tiles[:4]], 0)};

export const navLinks = [
  {{ label: "Services", href: "/services/dentures" }},
  {{ label: "About", href: "/meet-your-dentist" }},
  {{ label: "Patients", href: "/what-to-expect" }},
  {{ label: "Blog", href: "/blog" }},
  {{ label: "Contact", href: "/contact-us" }},
] as const;
"""
    # Fix choice image: I left a silly conditional. Patch profile choice_image into the string already via profile key.
    (out / "site.ts").write_text(site_ts)

    nav_ts = f"""export const primaryNav = {ts(nav, 0)};

export function getPrimaryNav() {{
  return primaryNav;
}}

export function getRouteAliases() {{
  return [];
}}
"""
    (out / "nav.ts").write_text(nav_ts)

    routes_ts = f"""import {{ mediaUrl }} from "./site";
export type {{ RouteContent, RouteFaq, RouteLink }} from "../../../../src/content/routes";

export const routes = {ts(routes, 0)};

export function getRouteContent(slug: string) {{
  return routes.find((route) => route.slug === slug);
}}

export function getRouteSlugs() {{
  return routes.map((route) => route.slug);
}}
"""
    (out / "routes.ts").write_text(routes_ts)

    testimonials_ts = f"""export type Testimonial = {{ name: string; location: string; quote: string }};

export const testimonials: Testimonial[] = {ts(quotes, 0)};

export function getTestimonials(names?: readonly string[]) {{
  if (!names || names.length === 0) return testimonials;
  return names.flatMap((name) => {{
    const match = testimonials.find((quote) => quote.name === name);
    return match ? [match] : [];
  }});
}}
"""
    (out / "testimonials.ts").write_text(testimonials_ts)

    blog_ts = f"""import {{ mediaUrl }} from "./site";

export type ClinicPost = {{
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  imageAlt: string;
  html: string;
  headings: {{ id: string; text: string }}[];
}};

const postsSource = {ts([{k: v for k, v in post.items()} for post in blog_posts], 0)};

export const posts: ClinicPost[] = postsSource.map((post) => ({{
  ...post,
  image: mediaUrl(post.image),
}}));

export function getPost(slug: string) {{
  return posts.find((post) => post.slug === slug);
}}

export const postCards = posts.map((post) => ({{
  slug: post.slug,
  url: `/blog/${{post.slug}}`,
  title: post.title,
  description: post.description,
  image: post.image,
  imageAlt: post.imageAlt,
}}));
"""
    (out / "blog.ts").write_text(blog_ts)

    redirects_ts = f"""export const redirects = {ts(redirects, 0)};

export function getRedirects() {{
  return redirects.map((item) => ({{
    source: item.source,
    destination: item.destination,
    statusCode: 301 as const,
  }}));
}}
"""
    (out / "redirects.ts").write_text(redirects_ts)
    (ROOT / site_id / "content" / "omitted.json").write_text(json.dumps(omitted, indent=2) + "\n")
    print(site_id, "routes", len(routes), "posts", len(blog_posts), "redirects", len(redirects), "faqs", len(faq_items))


# Filled after helper definitions so the data stays next to the builder.
CLINICS: dict = {}


def anxiety_from(pages: list[dict]) -> tuple[str, str] | None:
    for page in pages:
        for block in page["blocks"]:
            if block["type"] != "faq":
                continue
            for item in block.get("items") or []:
                question = scrub(item.get("q") or "")
                answer = scrub(text_of(item.get("a") or ""))
                if re.search(r"sedat|anxious|anxiety", f"{question} {answer}", re.I):
                    return question, answer
    return None


def configure() -> None:
    orleans_site, orleans_pages = load("orleans")
    embrun_site, embrun_pages = load("embrun")
    by_o = page_map(orleans_pages)
    anxiety = anxiety_from(orleans_pages)
    home_paras = paragraphs(by_o["/"])
    lab_paras = paragraphs(by_o["/our-lab/"])
    tom_paras = paragraphs(by_o["/team/tomasz-szarski/"])
    expect_paras = paragraphs(by_o["/what-to-expect/"])
    embrun_home = paragraphs(page_map(embrun_pages)["/"])
    embrun_about = paragraphs(page_map(embrun_pages)["/about/"])
    embrun_new = paragraphs(page_map(embrun_pages)["/new-patients/"])

    orleans_services = [
        ("/implants/", "/services/dental-implants"),
        ("/dentures/", "/services/dentures"),
        ("/dentures/full-dentures/", "/services/full-dentures"),
        ("/dentures/partial-dentures/", "/services/partial-dentures"),
        ("/dentures/immediate-dentures/", "/services/immediate-dentures"),
        ("/dentures/emergency-dentures/", "/services/emergency-dentures"),
        ("/dentures/digital-dentures/", "/services/digital-dentures"),
        ("/dentures/mobile-dentures/", "/services/mobile-dentures"),
        ("/dentures/suction-dentures/", "/services/suction-dentures"),
        ("/dentures/denture-consultation/", "/services/denture-consultation"),
        ("/services/relines-repairs/", "/services/relines-repairs"),
        ("/services/appliances-guards/", "/services/appliances-guards"),
        ("/services/digital-impressions/", "/services/digital-impressions"),
        ("/services/teeth-whitening/", "/services/teeth-whitening"),
    ]
    embrun_services = [
        ("/service/dental-implants-embrun-on/", "/services/dental-implants"),
        ("/service/dentures-embrun-on/", "/services/dentures"),
        ("/service/full-dentures-embrun-on/", "/services/full-dentures"),
        ("/service/partial-dentures-embrun-on/", "/services/partial-dentures"),
        ("/service/immediate-dentures-embrun-on/", "/services/immediate-dentures"),
        ("/service/emergency-dentures-embrun-on/", "/services/emergency-dentures"),
        ("/service/digital-dentures-embrun-on/", "/services/digital-dentures"),
        ("/service/mobile-dentures-embrun-on/", "/services/mobile-dentures"),
        ("/service/denture-consultation-embrun-on/", "/services/denture-consultation"),
        ("/service/denture-relines-and-repairs-embrun-on/", "/services/relines-repairs"),
        ("/service/dental-appliances-embrun-on/", "/services/dental-appliances"),
        ("/service/mouthguards-embrun-on/", "/services/mouthguards"),
        ("/service/digital-dental-impressions-embrun-on/", "/services/digital-impressions"),
        ("/service/teeth-whitening-embrun-on/", "/services/teeth-whitening"),
    ]

    def path_dict(pairs: list[tuple[str, str]], extra: dict[str, str]) -> dict[str, str]:
        mapped = {old: new for old, new in pairs}
        mapped.update(extra)
        return mapped

    CLINICS["orleans"] = {
        "eyebrow": "Orléans, Ottawa",
        "hero_lines": ["Dentures and implants,", "in Orléans."],
        "hero_label": "Orléans, Ottawa",
        "hero_title": "Dentures and implants, in Orléans.",
        "hero_body": "Expert denture care in Orléans, helping patients across Ottawa feel comfortable, confident, and at ease with their smile.",
        "hero_alt": "The front desk and lab at Orleans Denture Clinic",
        "header_cta": "Free consultation",
        "primary_label": "Book a free consultation",
        "secondary_label": "Canadian Dental Care Plan",
        "secondary_href": "/canadian-dental-care-plan",
        "trust_strong": "CDCP welcome · On-site dental lab",
        "trust_span": "Free consultations · Dentures and implants",
        "trust_label": "On-site dental lab",
        "trust_title": "Dentures made in Orléans.",
        "trust_body": lab_paras[0],
        "trust_image": by_o["/our-lab/"].get("hero") or by_o["/"].get("hero"),
        "trust_alt": "The on-site dental lab",
        "choice_label": "Our services",
        "choice_title": "Dentures, implants, and repairs.",
        "choice_body": next((item for item in home_paras if len(item) > 80), orleans_site["description"]),
        "choice_image": by_o["/dentures/full-dentures/"].get("hero") or by_o["/"].get("hero"),
        "choice_alt": "Denture care at Orleans Denture Clinic",
        "proof_label": "With you at every step",
        "proof_title": "The same team, from the first visit.",
        "proof_body": expect_paras[0] if expect_paras else "Our staff will ensure that you are comfortable through every step of the process.",
        "close_label": "Free consultation",
        "close_title": "Book a free consultation.",
        "close_body": f"The clinic is at {orleans_site['address']['label']}. Call {orleans_site['phone']['label']}.",
        "footer_note": "Dentures and implants in Orléans, at 2882 St. Joseph Blvd. On-site dental lab.",
        "panorama_label": "Inside Orleans Denture Clinic",
        "panorama_caption": "Consultation, lab work, and follow-up at 2882 St. Joseph Blvd.",
        "doctor_label": "Meet Tom Szarski, DD",
        "blog_h1": "Our blog",
        "logo_width": 220,
        "logo_height": 64,
        "tom_path": "/team/tomasz-szarski/",
        "legal": True,
        "stories": True,
        "anxiety_faq": anxiety,
        "why_source": "",
        "why_sections": [
            {"heading": "A trusted clinic in the Ottawa area", "body": home_paras[0] if home_paras else orleans_site["description"]},
            {"heading": "Our on-site dental lab", "body": " ".join(lab_paras[:2])[:1800]},
            {"heading": "Four generations in dentistry", "body": tom_paras[1] if len(tom_paras) > 1 else tom_paras[0]},
        ],
        "lab_path": "/our-lab/",
        "lab_image": by_o["/our-lab/"].get("hero") or by_o["/"].get("hero"),
        "gallery_path": "",
        "contact_path": "/contact/",
        "appointment_path": "",
        "expect_path": "/what-to-expect/",
        "blog_index": "/blogs/",
        "faq_sources": ["/faqs/"],
        "area_pages": ["/embrun/"],
        "area_children": [],
        "before_after_dest": "/patient-stories",
        "sedation_dest": "/dental-anxiety",
        "dentures_vs_dest": "/blog/dentures-vs-implants-how-to-choose",
        "service_order": orleans_services,
        "pages": [
            ("/what-to-expect/", "/what-to-expect"),
            ("/our-lab/", "/our-lab"),
            ("/canadian-dental-care-plan/", "/canadian-dental-care-plan"),
            ("/privacy-policy/", "/privacy-policy"),
            ("/terms-conditions/", "/terms"),
        ],
        "paths": path_dict(
            orleans_services
            + [
                ("/what-to-expect/", "/what-to-expect"),
                ("/our-lab/", "/our-lab"),
                ("/canadian-dental-care-plan/", "/canadian-dental-care-plan"),
                ("/privacy-policy/", "/privacy-policy"),
                ("/terms-conditions/", "/terms"),
                ("/faqs/", "/faq"),
                ("/contact/", "/contact-us"),
                ("/blogs/", "/blog"),
                ("/meet-the-denturists/", "/meet-your-dentist"),
                ("/team/tomasz-szarski/", "/meet-your-dentist"),
                ("/embrun/", "/service-areas"),
                ("/services/dental-impressions/", "/services/digital-impressions"),
                ("/teeth-whitening/", "/services/teeth-whitening"),
            ],
            {},
        ),
        "treatments": [
            ("/dentures/full-dentures/", "/services/full-dentures", "Full dentures"),
            ("/dentures/partial-dentures/", "/services/partial-dentures", "Partial dentures"),
            ("/implants/", "/services/dental-implants", "Dental implants"),
            ("/dentures/suction-dentures/", "/services/suction-dentures", "Suction dentures"),
        ],
        "tiles": [
            (by_o["/"].get("hero"), "The front desk at Orleans Denture Clinic"),
            (by_o["/our-lab/"].get("hero"), "The on-site dental lab"),
            (by_o["/team/tomasz-szarski/"].get("hero"), "Tom Szarski, DD"),
            (by_o["/what-to-expect/"].get("hero") or by_o["/"].get("hero"), "A visit to the clinic"),
        ],
        "omitted": [
            {"path": "/pricing", "reason": "The scrape has no price list. Cost notes stay in the blog post tooth-implant-cost-ontario. /pricing redirects to the Canadian Dental Care Plan page."},
            {"path": "/before-after", "reason": "No before-and-after treatment pairs were in the scrape. /before-after redirects to patient stories."},
            {"path": "/easy-implant-en", "reason": "Renew product page. Not part of this clinic's scrape."},
            {"path": "/for-dentists", "reason": "No dentist-referral page in the scrape. Redirects to contact."},
        ],
    }
    # team paths
    for page in orleans_pages:
        if page["path"].startswith("/team/") and page["path"] != "/team/tomasz-szarski/":
            CLINICS["orleans"]["paths"][page["path"]] = f"/team/{slug_of(page['path'])}"

    by_e = page_map(embrun_pages)
    CLINICS["embrun"] = {
        "eyebrow": "Embrun, Ontario",
        "hero_lines": ["Denture care,", "in Embrun."],
        "hero_label": "Embrun, Ontario",
        "hero_title": "Denture care, in Embrun.",
        "hero_body": embrun_home[0] if embrun_home else embrun_site["description"],
        "hero_alt": "Embrun Denture & Implant Centre",
        "header_cta": "Request an appointment",
        "primary_label": "Request an appointment",
        "secondary_label": "Canadian Dental Care Plan",
        "secondary_href": "/canadian-dental-care-plan",
        "trust_strong": "CDCP guidance · In-house dentures",
        "trust_span": "More than 20 years of experience",
        "trust_label": "Your denturist",
        "trust_title": "Care from a denturist.",
        "trust_body": paragraphs(by_e["/meet-our-denturist/"])[0],
        "trust_image": by_e["/meet-our-denturist/"].get("hero") or by_e["/"].get("hero"),
        "trust_alt": "Tom Szarski, DD",
        "choice_label": "Dentures and implants",
        "choice_title": "Dentures and implants in Embrun.",
        "choice_body": embrun_home[2] if len(embrun_home) > 2 else embrun_home[0],
        "choice_image": by_e["/service/dentures-embrun-on/"].get("hero") or by_e["/"].get("hero"),
        "choice_alt": "Denture care in Embrun",
        "proof_label": "The clinic",
        "proof_title": "A bright, welcoming clinic.",
        "proof_body": next((paragraph for paragraph in embrun_home if paragraph.lower().startswith("step into")), embrun_new[0] if embrun_new else embrun_home[0]),
        "close_label": "Appointments",
        "close_title": "Request an appointment.",
        "close_body": f"Call {embrun_site['phone']['label']} or send a request. The clinic is at {embrun_site['address']['label']}.",
        "footer_note": "Denture and implant care in Embrun, at 614 Notre-Dame St.",
        "panorama_label": "Inside Embrun Denture & Implant Centre",
        "panorama_caption": "Denture and implant visits at 614 Notre-Dame St, Embrun.",
        "doctor_label": "Meet Tom Szarski, DD",
        "blog_h1": "Blog",
        "logo_width": 240,
        "logo_height": 72,
        "tom_path": "/meet-our-denturist/",
        "legal": False,
        "stories": False,
        "anxiety_faq": None,
        "why_source": "/about/",
        "why_sections": [],
        "lab_path": "",
        "lab_image": by_e["/"].get("hero"),
        "gallery_path": "/gallery/",
        "contact_path": "/contact/",
        "appointment_path": "/request-an-appointment/",
        "expect_path": "/new-patients/",
        "blog_index": "/blog/",
        "faq_sources": [],
        "area_pages": [
            "/dentist-near-brisson/",
            "/dentist-near-forest-park/",
            "/dentist-near-forget/",
            "/dentist-near-longtinville/",
            "/dentist-near-russell/",
        ],
        "area_children": [
            "/dentist-near-brisson/",
            "/dentist-near-forest-park/",
            "/dentist-near-forget/",
            "/dentist-near-longtinville/",
            "/dentist-near-russell/",
        ],
        "before_after_dest": "/gallery",
        "sedation_dest": "/faq",
        "dentures_vs_dest": "/blog/what-to-know-before-getting-dentures-a-complete-guide-for-patients",
        "service_order": embrun_services,
        "pages": [
            ("/new-patients/", "/what-to-expect"),
            ("/canadian-dental-care-plan/", "/canadian-dental-care-plan"),
        ],
        "paths": path_dict(
            embrun_services
            + [
                ("/new-patients/", "/what-to-expect"),
                ("/canadian-dental-care-plan/", "/canadian-dental-care-plan"),
                ("/about/", "/why-choose-us"),
                ("/meet-our-denturist/", "/meet-your-dentist"),
                ("/contact/", "/contact-us"),
                ("/request-an-appointment/", "/request-an-appointment"),
                ("/gallery/", "/gallery"),
                ("/blog/", "/blog"),
                ("/dentist-near-brisson/", "/service-areas/brisson"),
                ("/dentist-near-forest-park/", "/service-areas/forest-park"),
                ("/dentist-near-forget/", "/service-areas/forget"),
                ("/dentist-near-longtinville/", "/service-areas/longtinville"),
                ("/dentist-near-russell/", "/service-areas/russell"),
            ],
            {},
        ),
        "treatments": [
            ("/service/dentures-embrun-on/", "/services/dentures", "Dentures"),
            ("/service/dental-implants-embrun-on/", "/services/dental-implants", "Dental implants"),
            ("/service/denture-relines-and-repairs-embrun-on/", "/services/relines-repairs", "Relines and repairs"),
            ("/service/teeth-whitening-embrun-on/", "/services/teeth-whitening", "Teeth whitening"),
        ],
        "tiles": [
            (by_e["/"].get("hero"), "Embrun Denture & Implant Centre"),
            (by_e["/meet-our-denturist/"].get("hero") or by_e["/"].get("hero"), "Tom Szarski, DD"),
            (by_e["/gallery/"].get("hero") or by_e["/"].get("hero"), "Inside the clinic"),
            (by_e["/new-patients/"].get("hero") or by_e["/"].get("hero"), "The clinic"),
        ],
        "omitted": [
            {"path": "/pricing", "reason": "No price list in the scrape. /pricing redirects to the Canadian Dental Care Plan page."},
            {"path": "/before-after", "reason": "The gallery is office photos, not before-and-after pairs. /before-after redirects to the gallery."},
            {"path": "/patient-stories", "reason": "No named patient reviews were in the scrape."},
            {"path": "/dental-anxiety", "reason": "No sedation or dental-anxiety copy was in the scrape. /dental-anxiety redirects to the FAQ."},
            {"path": "/privacy-policy", "reason": "The scrape has no privacy policy. The URL redirects to contact. No policy text was written."},
            {"path": "/terms", "reason": "The scrape has no terms of use. The URL redirects to contact. No terms text was written."},
            {"path": "/easy-implant-en", "reason": "Renew product page. Not part of this clinic's scrape."},
            {"path": "/for-dentists", "reason": "No dentist-referral page in the scrape. Redirects to contact."},
        ],
    }
    _ = embrun_about


if __name__ == "__main__":
    configure()
    build("orleans")
    build("embrun")
