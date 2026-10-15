#!/usr/bin/env python3
"""Turn a WordPress scrape into site.json + pages.json for a clinic site.

Inputs (not committed): content.json, raw HTML, and a media-r2 URL map.
Outputs keep copy, rewrite media onto MEDIA paths, and drop agency emails.
"""

from __future__ import annotations

import json
import re
import sys
from html import unescape
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse

from bs4 import BeautifulSoup, NavigableString, Tag

AGENCY_EMAILS = ("admin@webmarketers.ca", "mittalvala@medianv.com")
DR_TOM = re.compile(
    r"\b(?:Dr\.?|Doctor)\s+(?:Tom(?:asz)?\s+)?Szarski\b",
    re.IGNORECASE,
)
SIZE_SUFFIX = re.compile(r"(?:-\d+x\d+|-scaled|-rotated)(?=\.[a-z0-9]+$)", re.IGNORECASE)
SKIP_IMAGE = re.compile(
    r"favicon|creditcard|gf-credit|youtube\.png|polygon|emoji|gravatar|placeholder|spacer",
    re.IGNORECASE,
)
DAY = re.compile(
    r"^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b",
    re.IGNORECASE,
)


def decode_cfemail(encoded: str) -> str:
    try:
        key = int(encoded[:2], 16)
    except ValueError:
        return ""
    chars = []
    for index in range(2, len(encoded), 2):
        try:
            chars.append(chr(int(encoded[index : index + 2], 16) ^ key))
        except ValueError:
            return ""
    return "".join(chars)


def clean_text(value: str) -> str:
    text = unescape(value or "")
    text = text.replace("\xa0", " ")
    text = DR_TOM.sub("Tom Szarski, DD", text)
    text = re.sub(r"\s+", " ", text).strip()
    for email in AGENCY_EMAILS:
        text = re.sub(re.escape(email), "", text, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", text).strip(" -|")


def phone_href(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    if len(digits) == 10:
        return f"tel:{digits[0:3]}-{digits[3:6]}-{digits[6:10]}"
    return "tel:" + digits


def has_agency_email(value: str) -> bool:
    lowered = value.lower()
    return any(email in lowered for email in AGENCY_EMAILS)


class MediaMap:
    def __init__(self, mapping: dict[str, str], prefix: str):
        self.prefix = prefix.strip("/")
        self.by_url: dict[str, str] = {}
        self.by_name: dict[str, str] = {}
        for src, dest in mapping.items():
            path = urlparse(dest).path
            self.by_url[self.norm(src)] = path
            self.by_name[Path(urlparse(src).path).name.lower()] = path

    @staticmethod
    def norm(url: str) -> str:
        parsed = urlparse(url)
        if parsed.scheme:
            return f"{parsed.scheme}://{parsed.netloc}{parsed.path}".rstrip("/")
        return url.split("?")[0]

    def resolve(self, url: str) -> str | None:
        if not url or url.startswith("data:"):
            return None
        name = Path(urlparse(url).path).name
        candidates = [url, name]
        stripped = SIZE_SUFFIX.sub("", name)
        while stripped != name:
            candidates.append(stripped)
            name = stripped
            stripped = SIZE_SUFFIX.sub("", name)
        for candidate in candidates:
            hit = self.by_url.get(self.norm(candidate))
            if hit:
                return hit
            name = Path(urlparse(candidate).path).name.lower()
            if name in self.by_name:
                return self.by_name[name]
        return None


def load_pages(scrape: Path) -> list[dict]:
    return json.loads((scrape / "content.json").read_text())


def file_index(pages: list[dict]) -> dict[str, str]:
    index: dict[str, str] = {}
    for page in pages:
        file_name = page["file"]
        index[file_name] = page["path"]
        index[Path(file_name).name] = page["path"]
        index[unquote(Path(file_name).name)] = page["path"]
    return index


def canonical_path(path: str) -> str:
    if path == "/":
        return "/"
    return path if path.endswith("/") else f"{path}/"


class Linker:
    def __init__(self, host: str, pages: list[dict], raw_root: Path, email: str = ""):
        self.host = host
        self.raw_root = raw_root
        self.email = email
        self.by_file = file_index(pages)
        self.known = {canonical_path(page["path"]) for page in pages}
        self.known.add("/")
        self.ids: dict[str, str] = {}
        for page in pages:
            html_path = raw_root / page["file"]
            if not html_path.exists():
                continue
            text = html_path.read_text(errors="ignore")
            match = re.search(r"<body[^>]*\b(?:page-id-|postid-)(\d+)", text)
            if match:
                self.ids[match.group(1)] = canonical_path(page["path"])

    def resolve(self, href: str, page_file: str) -> str | None:
        if not href:
            return None
        href = unescape(unquote(href.strip()))
        if href.startswith(("mailto:", "tel:", "#", "javascript:")):
            return href
        id_match = re.search(r"[?&]p=(\d+)", href)
        if id_match and id_match.group(1) in self.ids:
            return self.ids[id_match.group(1)]
        if href.startswith("http"):
            parsed = urlparse(href)
            if parsed.netloc and self.host not in parsed.netloc:
                return href
            target = canonical_path(parsed.path or "/")
            return target if target in self.known or target == "/" else href

        page_dir = (self.raw_root / page_file).parent
        joined = Path(urljoin(page_dir.as_posix() + "/", href.split("#")[0]))
        try:
            relative = joined.resolve().relative_to(self.raw_root.resolve()).as_posix()
        except ValueError:
            relative = href
        relative = unquote(relative)
        for key in (relative, Path(relative).name, unquote(Path(relative).name)):
            if key in self.by_file:
                return canonical_path(self.by_file[key])
        # Pretty path guessed from the relative directory.
        guess = "/" + relative
        guess = re.sub(r"/index\.html$", "/", guess)
        guess = re.sub(r"\.html$", "/", guess)
        guess = canonical_path(guess)
        if guess in self.known:
            return guess
        return None


def img_url(tag: Tag) -> str:
    for attr in ("data-src", "data-lazy-src", "src"):
        value = tag.get(attr) or ""
        if value and not value.startswith("data:"):
            return value
    srcset = tag.get("data-srcset") or tag.get("srcset") or ""
    if srcset:
        return srcset.split(",")[0].strip().split(" ")[0]
    return ""


def inline_text(value: str) -> str:
    """Collapse whitespace inside one text node without trimming the edges."""
    text = unescape(value or "").replace("\xa0", " ")
    text = DR_TOM.sub("Tom Szarski, DD", text)
    for email in AGENCY_EMAILS:
        text = re.sub(re.escape(email), "", text, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", text)


def inline_html(node: Tag, linker: Linker, page_file: str) -> str:
    parts: list[str] = []

    def walk(child: Tag | NavigableString) -> None:
        if isinstance(child, NavigableString):
            parts.append(inline_text(str(child)))
            return
        if not isinstance(child, Tag):
            return
        name = child.name.lower()
        classes = " ".join(child.get("class") or [])
        if name in {"script", "style", "svg", "noscript"}:
            return
        if "apbct-email-encoder" in classes or "apbct-blur" in classes:
            return
        if name == "br":
            parts.append("<br />")
            return
        if name in {"strong", "b", "em", "i"}:
            tag_name = "strong" if name in {"strong", "b"} else "em"
            inner = inline_html(child, linker, page_file)
            if inner:
                parts.append(f"<{tag_name}>{inner}</{tag_name}>")
            return
        if name == "span" and "cf_email" in classes:
            decoded = decode_cfemail(child.get("data-cfemail") or "")
            if decoded and not has_agency_email(decoded):
                parts.append(decoded)
            return
        if name == "a":
            href = child.get("href") or ""
            if child.select_one(".apbct-email-encoder") or "apbct" in href or "<span" in href:
                if linker.email and not has_agency_email(linker.email):
                    parts.append(f'<a href="mailto:{linker.email}">{linker.email}</a>')
                return
            if "/email-protection#" in href:
                decoded = decode_cfemail(href.split("#", 1)[-1])
                if decoded and not has_agency_email(decoded):
                    parts.append(f'<a href="mailto:{decoded}">{decoded}</a>')
                return
            href = linker.resolve(href, page_file) or ""
            if href.startswith("tel:"):
                href = "tel:" + re.sub(r"\s+", "", href[4:])
            inner = inline_html(child, linker, page_file)
            if not inner:
                return
            if href:
                parts.append(f'<a href="{href}">{inner}</a>')
            else:
                parts.append(inner)
            return
        for grandchild in child.children:
            walk(grandchild)

    for child in node.children:
        walk(child)
    html = re.sub(r"\s+", " ", "".join(parts)).strip()
    html = re.sub(r"(?:<br />\s*){2,}", "<br />", html)
    return html


def text_blocks(container: Tag, linker: Linker, page_file: str) -> list[dict]:
    blocks: list[dict] = []
    elements = container.find_all(["p", "ul", "ol", "h2", "h3", "h4", "blockquote"], recursive=False)
    if not elements:
        html = inline_html(container, linker, page_file)
        if html:
            blocks.append({"type": "paragraph", "html": html})
        return blocks
    for element in elements:
        if element.name in {"h2", "h3", "h4"}:
            text = clean_text(element.get_text(" ", strip=True))
            if text:
                blocks.append({"type": "heading", "level": int(element.name[1]), "text": text})
            continue
        if element.name in {"ul", "ol"}:
            items = []
            for li in element.find_all("li", recursive=False):
                html = inline_html(li, linker, page_file)
                if html:
                    items.append(html)
            if items:
                blocks.append({"type": "list", "ordered": element.name == "ol", "items": items})
            continue
        html = inline_html(element, linker, page_file)
        if html:
            blocks.append({"type": "paragraph", "html": html})
    return blocks


def extract_form(form: Tag) -> dict | None:
    fields = []
    for field in form.select(".gfield"):
        classes = " ".join(field.get("class") or [])
        if "honeypot" in classes or "gform_validation_container" in classes:
            continue
        label_el = field.select_one(".gform-field-label__text")
        label = clean_text(label_el.get_text(" ", strip=True) if label_el else "")
        if not label or label.lower().startswith("apbct"):
            continue
        control = field.find(["input", "textarea", "select"])
        if control is None:
            radios = field.select("input[type=radio]")
            if not radios:
                continue
            options = []
            for radio in radios:
                choice = radio.find_parent("label") or field.select_one(f"label[for='{radio.get('id')}']")
                options.append(clean_text(choice.get_text(" ", strip=True) if choice else radio.get("value") or ""))
            fields.append(
                {
                    "name": slug_field(label),
                    "label": label,
                    "type": "radio",
                    "required": "gfield_contains_required" in classes or radio_required(field),
                    "options": [option for option in options if option],
                }
            )
            continue
        if control.get("type") == "hidden":
            continue
        if control.get("type") == "radio":
            options = []
            for radio in field.select("input[type=radio]"):
                choice = radio.find_parent("label") or field.select_one(f"label[for='{radio.get('id')}']")
                text = clean_text(choice.get_text(" ", strip=True) if choice else radio.get("value") or "")
                if text and text not in options:
                    options.append(text)
            fields.append(
                {
                    "name": slug_field(label),
                    "label": label.rstrip("*").strip(),
                    "type": "radio",
                    "required": "gfield_contains_required" in classes or radio_required(field),
                    "placeholder": "",
                    "options": options,
                }
            )
            continue
        input_type = control.name
        if input_type == "input":
            input_type = control.get("type") or "text"
        options = []
        if control.name == "select":
            input_type = "select"
            for option in control.find_all("option"):
                value = clean_text(option.get_text(" ", strip=True))
                if value and "placeholder" not in " ".join(option.get("class") or []):
                    options.append(value)
        placeholder = control.get("placeholder") or ""
        fields.append(
            {
                "name": slug_field(label),
                "label": label.rstrip("*").strip(),
                "type": {"phone": "tel"}.get(input_type, input_type),
                "required": "gfield_contains_required" in classes or control.get("aria-required") == "true",
                "placeholder": clean_text(placeholder),
                **({"options": options} if options else {}),
            }
        )
    if not fields:
        return None
    button = form.select_one("button, input[type=submit]")
    submit = clean_text(button.get_text(" ", strip=True) if button and button.name == "button" else button.get("value") if button else "")
    form_id = slug_field(form.get("data-form-name") or form.get("id") or "contact")
    return {"id": form_id, "submitLabel": submit or "Submit", "fields": dedupe_field_names(fields)}


def radio_required(field: Tag) -> bool:
    return "gfield_contains_required" in " ".join(field.get("class") or [])


def slug_field(label: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", " ", label.lower()).strip()
    special = {
        "first name": "firstName",
        "last name": "lastName",
        "email": "email",
        "email address": "email",
        "phone": "phone",
        "phone number": "phone",
        "service interested in": "service",
        "enter your message": "message",
        "message": "message",
        "preferred date": "preferredDate",
        "preferred time": "preferredTime",
        "your message": "message",
    }
    if slug in special:
        return special[slug]
    parts = slug.split()
    if not parts:
        return "field"
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


def dedupe_field_names(fields: list[dict]) -> list[dict]:
    seen: dict[str, int] = {}
    for field in fields:
        name = field["name"]
        seen[name] = seen.get(name, 0) + 1
        if seen[name] > 1:
            field["name"] = f"{name}{seen[name]}"
    return fields


WIDGET_CLASS = {
    "elementor-widget-heading": "widget-heading",
    "elementor-widget-text-editor": "widget-text-editor",
    "elementor-widget-image": "widget-image",
    "elementor-widget-image-gallery": "widget-gallery",
    "elementor-widget-gallery": "widget-gallery",
    "elementor-widget-image-box": "widget-image-box",
    "elementor-widget-icon-box": "widget-icon-box",
    "elementor-widget-video": "widget-video",
    "elementor-widget-button": "widget-button",
    "elementor-widget-accordion": "widget-accordion",
    "elementor-widget-n-accordion": "widget-n-accordion",
    "elementor-widget-toggle": "widget-toggle",
    "elementor-widget-icon-list": "widget-icon-list",
    "elementor-widget-shortcode": "widget-shortcode",
    "elementor-widget-theme-post-content": "widget-theme-post-content",
    "elementor-widget-theme-post-featured-image": "widget-theme-post-featured-image",
    "elementor-widget-testimonial-carousel": "widget-testimonial-carousel",
}


def widget_type(widget: Tag) -> str:
    classes = set(widget.get("class") or [])
    for class_name, kind in WIDGET_CLASS.items():
        if class_name in classes:
            return kind
    if widget.select_one("form"):
        return "form"
    return ""


def extract_blocks(main: Tag, linker: Linker, media: MediaMap, page_file: str, gaps: list[str]) -> tuple[list[dict], dict | None]:
    blocks: list[dict] = []
    form = None
    widgets = [
        widget
        for widget in main.select(".elementor-widget")
        if widget.find_parent(class_="elementor-widget") is None
    ]
    for widget in widgets:
        kind = widget_type(widget)
        if kind == "widget-heading":
            heading = widget.find(["h1", "h2", "h3", "h4", "h5", "h6"])
            if heading:
                text = clean_text(heading.get_text(" ", strip=True))
                if text:
                    level = int(heading.name[1])
                    blocks.append({"type": "heading", "level": 2 if level == 1 else level, "text": text})
        elif kind == "widget-text-editor":
            container = widget.select_one(".elementor-widget-container") or widget
            blocks.extend(text_blocks(container, linker, page_file))
        elif kind in {"widget-theme-post-content", "widget-theme-post-featured-image"}:
            container = widget.select_one(".elementor-widget-container") or widget
            if kind.endswith("featured-image"):
                image = widget.find("img")
                if image:
                    block = image_block(image, media, gaps)
                    if block:
                        blocks.append(block)
            else:
                blocks.extend(rich_blocks(container, linker, media, page_file, gaps))
        elif kind in {"widget-icon-box", "widget-image-box"}:
            image = widget.find("img")
            title = widget.select_one(".elementor-icon-box-title, .elementor-image-box-title")
            description = widget.select_one(".elementor-icon-box-description, .elementor-image-box-description")
            if image and kind == "widget-image-box":
                block = image_block(image, media, gaps)
                if block:
                    blocks.append(block)
            if title:
                text = clean_text(title.get_text(" ", strip=True))
                if text:
                    blocks.append({"type": "heading", "level": 3, "text": text})
            if description:
                plain = clean_text(description.get_text(" ", strip=True))
                rows = []
                for match in re.finditer(
                    r"(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*:?\s*([^<\n]+)",
                    description.get_text("\n", strip=True),
                    re.I,
                ):
                    rows.append({"day": match.group(1).capitalize(), "time": clean_text(match.group(2))})
                if len(rows) >= 5:
                    blocks.append({"type": "hours", "rows": rows})
                else:
                    html = inline_html(description, linker, page_file)
                    if html:
                        blocks.append({"type": "paragraph", "html": html})
                    elif plain:
                        blocks.append({"type": "paragraph", "html": plain})
        elif kind == "widget-testimonial-carousel":
            quotes = []
            for slide in widget.select(".swiper-slide, .elementor-testimonial"):
                quote = slide.select_one(".elementor-testimonial-content, .elementor-testimonial__text")
                name = slide.select_one(".elementor-testimonial-name, .elementor-testimonial__name")
                text = clean_text(quote.get_text(" ", strip=True) if quote else "")
                who = clean_text(name.get_text(" ", strip=True) if name else "")
                if text:
                    quotes.append({"quote": text, "name": who})
            if quotes:
                blocks.append({"type": "quotes", "items": quotes})
        elif kind == "widget-image":
            image = widget.find("img")
            if image:
                block = image_block(image, media, gaps)
                if block:
                    blocks.append(block)
        elif kind == "widget-video":
            video = widget.find("video")
            source = ""
            if video:
                source = video.get("src") or ""
                if not source:
                    source_tag = video.find("source")
                    source = source_tag.get("src") if source_tag else ""
            if not source:
                settings = widget.get("data-settings") or ""
                match = re.search(r"https?:[^\"\\]+\.mp4", unescape(settings).replace("\\/", "/"))
                source = match.group(0) if match else ""
            path = media.resolve(source) if source else None
            if path:
                blocks.append({"type": "video", "src": path, "autoplay": True})
            elif source and not source.startswith("data:"):
                gaps.append(f"unmapped video {source}")
        elif kind == "widget-button":
            link = widget.find("a")
            if link:
                label = clean_text(link.get_text(" ", strip=True))
                href = linker.resolve(link.get("href") or "", page_file)
                if label and href and not href.startswith("#"):
                    blocks.append({"type": "cta", "label": label, "href": href})
        elif kind in {"widget-accordion", "widget-toggle"}:
            items = []
            for item in widget.select(".elementor-accordion-item, .elementor-toggle-item"):
                question = item.select_one(".elementor-accordion-title, .elementor-toggle-title")
                answer = item.select_one(".elementor-tab-content")
                q = clean_text(question.get_text(" ", strip=True) if question else "")
                a = inline_html(answer, linker, page_file) if answer else ""
                if q and a:
                    items.append({"q": q, "a": a})
            if items:
                blocks.append({"type": "faq", "items": items})
        elif kind == "widget-n-accordion":
            items = []
            for item in widget.select("details"):
                question = item.select_one(".e-n-accordion-item-title-text")
                q = clean_text(question.get_text(" ", strip=True) if question else "")
                region = item.find_next_sibling(attrs={"role": "region"})
                # Nested accordion keeps the answer as the details' following region or inside it.
                answer_root = region or item
                a = inline_html(answer_root, linker, page_file)
                q_plain = re.sub(r"<[^>]+>", "", a)
                if q and q in q_plain:
                    a = clean_text(q_plain.replace(q, "", 1))
                else:
                    a = clean_text(re.sub(r"<[^>]+>", "", a))
                # Prefer rich html without the question text.
                html = inline_html(answer_root, linker, page_file)
                html = re.sub(re.escape(q), "", html, count=1).strip()
                if q and html:
                    items.append({"q": q, "a": html})
            if items:
                blocks.append({"type": "faq", "items": items})
        elif kind == "widget-icon-list":
            items = []
            for li in widget.select(".elementor-icon-list-item"):
                html = inline_html(li, linker, page_file)
                if html:
                    items.append(html)
            if items and all(DAY.match(re.sub(r"<[^>]+>", "", item)) for item in items):
                rows = []
                for item in items:
                    plain = clean_text(re.sub(r"<[^>]+>", " ", item))
                    match = re.match(r"(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*(.*)", plain, re.I)
                    if match:
                        rows.append({"day": match.group(1).capitalize(), "time": match.group(2).strip(" :") or "Closed"})
                if rows:
                    blocks.append({"type": "hours", "rows": rows})
                    continue
            if items:
                blocks.append({"type": "list", "ordered": False, "items": items})
        elif kind in {"widget-shortcode", "form"} or widget.select_one("form"):
            parsed = extract_form(widget.select_one("form")) if widget.select_one("form") else None
            if parsed:
                form = parsed
                blocks.append({"type": "form", "id": parsed["id"]})
        elif kind in {"widget-gallery", "widget-image-gallery"}:
            images = []
            for image in widget.find_all("img"):
                block = image_block(image, media, gaps)
                if block:
                    images.append(block)
            if images:
                blocks.append({"type": "gallery", "images": images})
    return dedupe_blocks(blocks), form


def image_block(image: Tag, media: MediaMap, gaps: list[str]) -> dict | None:
    url = img_url(image)
    if not url or SKIP_IMAGE.search(url):
        return None
    path = media.resolve(url)
    if not path:
        if not url.startswith("data:"):
            gaps.append(f"unmapped image {url}")
        return None
    if SKIP_IMAGE.search(path):
        return None
    alt = clean_text(image.get("alt") or "")
    return {"type": "image", "src": path, "alt": alt}


def dedupe_blocks(blocks: list[dict]) -> list[dict]:
    kept: list[dict] = []
    seen_forms = False
    for block in blocks:
        if block.get("type") == "form":
            if seen_forms:
                continue
            seen_forms = True
        key = json.dumps(block, sort_keys=True)
        if kept and json.dumps(kept[-1], sort_keys=True) == key:
            continue
        if block.get("type") == "paragraph" and not re.sub(r"<[^>]+>", "", block.get("html", "")).strip():
            continue
        kept.append(block)
    return kept


def absolute_media(url: str, host: str, page_file: str, raw_root: Path) -> str:
    if url.startswith("http"):
        return url
    if url.startswith("//"):
        return "https:" + url
    page_dir = (raw_root / page_file).parent
    joined = urljoin(page_dir.as_posix() + "/", url)
    try:
        relative = Path(joined).resolve().relative_to(raw_root.resolve()).as_posix()
    except ValueError:
        relative = url.lstrip("/")
    # raw files live under raw/<host>/...
    relative = re.sub(r"^raw/[^/]+/", "", relative)
    if relative.startswith(host):
        return f"https://{relative}"
    return f"https://{host}/{relative.lstrip('/')}"


def content_root(soup: BeautifulSoup) -> Tag | None:
    main = soup.select_one("main")
    if main and len(main.get_text(" ", strip=True)) > 120:
        return main
    nodes = [
        element
        for element in soup.select("[data-elementor-type]")
        if element.get("data-elementor-type") not in {"header", "footer", "loop-item"}
    ]
    inner = [element for element in nodes if not any(other is not element and other in element.descendants for other in nodes)]
    if inner:
        return max(inner, key=lambda element: len(element.get_text(" ", strip=True)))
    return soup.select_one("main") or soup.body


def rich_blocks(container: Tag, linker: Linker, media: MediaMap, page_file: str, gaps: list[str]) -> list[dict]:
    blocks: list[dict] = []

    def walk(node: Tag | NavigableString) -> None:
        if isinstance(node, NavigableString):
            return
        if not isinstance(node, Tag):
            return
        name = (node.name or "").lower()
        if name in {"script", "style", "svg", "noscript", "form", "nav", "footer"}:
            return
        if name in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            text = clean_text(node.get_text(" ", strip=True))
            if text:
                level = min(int(name[1]), 4)
                blocks.append({"type": "heading", "level": 2 if level == 1 else level, "text": text})
            return
        if name in {"p", "blockquote"}:
            html = inline_html(node, linker, page_file)
            if html:
                blocks.append({"type": "paragraph", "html": html})
            return
        if name in {"ul", "ol"}:
            items = [inline_html(li, linker, page_file) for li in node.find_all("li", recursive=False)]
            items = [item for item in items if item]
            if items:
                blocks.append({"type": "list", "ordered": name == "ol", "items": items})
            return
        if name == "img":
            block = image_block(node, media, gaps)
            if block:
                blocks.append(block)
            return
        if name == "table":
            rows = []
            for tr in node.find_all("tr"):
                cells = [clean_text(cell.get_text(" ", strip=True)) for cell in tr.find_all(["th", "td"])]
                cells = [cell for cell in cells if cell]
                if cells:
                    rows.append(cells)
            if rows:
                blocks.append({"type": "table", "rows": rows})
            return
        if name == "video":
            source = node.get("src") or ""
            path = media.resolve(source) if source else None
            if path:
                blocks.append({"type": "video", "src": path, "autoplay": node.has_attr("autoplay")})
            return
        for child in node.children:
            walk(child)

    walk(container)
    return blocks


def parse_nav(home_html: str, linker: Linker, page_file: str) -> list[dict]:
    soup = BeautifulSoup(home_html, "html.parser")
    nav = soup.select_one("nav.elementor-nav-menu--main > ul.elementor-nav-menu")
    if nav is None:
        return []
    items = []
    for li in nav.find_all("li", recursive=False):
        link = li.find("a", recursive=False)
        if link is None:
            continue
        label = clean_text(link.get_text(" ", strip=True))
        raw_href = unescape(unquote(link.get("href") or ""))
        anchor_parent = raw_href.endswith("#") or raw_href.endswith("/#")
        href = "" if anchor_parent else (linker.resolve(link.get("href") or "", page_file) or "")
        children = []
        for child in li.select(":scope > ul > li > a"):
            child_href = linker.resolve(child.get("href") or "", page_file)
            child_label = clean_text(child.get_text(" ", strip=True))
            if child_label and child_href and child_href != "/":
                children.append({"label": child_label, "href": child_href})
        if (not href or href == "/") and children:
            href = children[0]["href"]
        if not label or not href or href.startswith("#"):
            continue
        items.append({"label": label, "href": href, "children": children})
    return items


def footer_facts(home_html: str) -> dict:
    soup = BeautifulSoup(home_html, "html.parser")
    footer = soup.select_one("footer") or soup
    text = clean_text(footer.get_text("\n", strip=True))
    phones = sorted(set(re.findall(r"\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}", footer.get_text(" ", strip=True))))
    emails = [email for email in set(re.findall(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", footer.get_text(" ", strip=True), re.I)) if not has_agency_email(email)]
    hours = []
    for match in re.finditer(
        r"(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*:?\s*([0-9].*?am|.*?pm|Closed)",
        footer.get_text("\n", strip=True),
        re.I,
    ):
        hours.append({"day": match.group(1).capitalize(), "time": clean_text(match.group(2))})
    # Unique days, first occurrence wins (visible footer list).
    deduped = []
    seen = set()
    for row in hours:
        if row["day"] in seen:
            continue
        seen.add(row["day"])
        deduped.append(row)
    return {"phones": phones, "emails": emails, "hours": deduped, "text": text[:1500]}


def meta_dates(soup: BeautifulSoup) -> dict:
    published = ""
    modified = ""
    for prop, key in (("article:published_time", "published"), ("article:modified_time", "modified")):
        tag = soup.find("meta", attrs={"property": prop})
        if tag and tag.get("content"):
            if key == "published":
                published = tag["content"][:10]
            else:
                modified = tag["content"][:10]
    return {"published": published, "modified": modified}


def kind_for(path: str, blog_paths: set[str], is_post: bool = False) -> str:
    if path == "/":
        return "home"
    if path in {"/blogs/", "/blog/"}:
        return "blog-index"
    if is_post or path.startswith("/blog/") or path in blog_paths:
        return "post"
    if path.startswith("/team/") or path in {"/meet-the-denturists/", "/meet-our-denturist/"}:
        return "team"
    if "privacy" in path or "terms" in path:
        return "legal"
    if path in {"/contact/", "/request-an-appointment/"}:
        return "contact"
    if path == "/gallery/":
        return "gallery"
    return "page"


def page_h1(page: dict, blocks: list[dict]) -> str:
    headings = page.get("h1") or []
    if headings:
        return clean_text(headings[0])
    title = clean_text(page.get("title") or "")
    title = re.sub(r"\s+[|\-–—].*$", "", title).strip()
    return title or "Page"


def short_title(title: str) -> str:
    return clean_text(re.sub(r"\s+[|\-–—].*$", "", title))


def build(site_id: str, host: str, scrape: Path, media_file: Path, out_dir: Path, brand: dict) -> None:
    pages = load_pages(scrape)
    raw_root = scrape / "raw"
    media = MediaMap(json.loads(media_file.read_text()), brand["mediaPrefix"])
    linker = Linker(host, pages, raw_root, email=brand.get("email") or "")
    gaps: list[str] = []

    # Collapse trailing-slash duplicates onto the slashed canonical.
    grouped: dict[str, dict] = {}
    for page in pages:
        path = canonical_path(page["path"])
        current = grouped.get(path)
        if current is None or (page["path"].endswith("/") and not current["path"].endswith("/")):
            grouped[path] = page
    redirects = []
    for page in pages:
        path = canonical_path(page["path"])
        if page["path"] != path:
            redirects.append({"source": page["path"], "destination": path})

    home = grouped["/"]
    home_file = raw_root / home["file"]
    home_html = home_file.read_text(errors="ignore")
    nav = parse_nav(home_html, linker, home["file"])
    facts = footer_facts(home_html)

    blog_paths: set[str] = set()
    built_pages = []
    forms: dict[str, dict] = {}
    for path, page in grouped.items():
        html_path = raw_root / page["file"]
        html = html_path.read_text(errors="ignore") if html_path.exists() else ""
        soup = BeautifulSoup(html, "html.parser")
        main = content_root(soup)
        blocks, form = extract_blocks(main, linker, media, page["file"], gaps) if main else ([], None)
        if main is not None and len([block for block in blocks if block["type"] != "form"]) < 2:
            rich = rich_blocks(main, linker, media, page["file"], gaps)
            if len(rich) > len(blocks):
                blocks = dedupe_blocks(rich + [block for block in blocks if block["type"] == "form"])
        if form:
            forms[json.dumps(form["fields"])] = form
            # Point the block at the deduped id after the loop.
        # Hero media.
        hero = next((block["src"] for block in blocks if block["type"] == "image"), "")
        if not hero:
            og_image = soup.find("meta", property="og:image")
            if og_image and og_image.get("content"):
                hero = media.resolve(og_image["content"]) or ""
        video = next((block["src"] for block in blocks if block["type"] == "video"), "")
        if path == "/" and brand.get("heroVideo"):
            mapped = media.resolve(brand["heroVideo"])
            if mapped:
                video = mapped
        dates = meta_dates(soup)
        body_class = " ".join(soup.body.get("class") or []) if soup.body else ""
        is_post = "single-post" in body_class or "type-post" in body_class
        description = clean_text(page.get("meta_description") or "")
        if has_agency_email(description):
            description = ""
        built_pages.append(
            {
                "path": path,
                "title": short_title(page.get("title") or page_h1(page, blocks)),
                "documentTitle": clean_text(page.get("title") or ""),
                "description": description,
                "h1": page_h1(page, blocks),
                "blocks": blocks,
                "hero": hero,
                "video": video,
                "published": dates["published"],
                "modified": dates["modified"],
                "isPost": is_post,
                "formFields": form["fields"] if form else None,
                "formSubmit": form["submitLabel"] if form else "",
            }
        )

    # Assign stable form ids.
    form_list = []
    signature_to_id = {}
    for signature, form in forms.items():
        form_id = form["id"]
        if form_id in {item["id"] for item in form_list}:
            form_id = f"{form_id}-{len(form_list)+1}"
        form = {**form, "id": form_id}
        form_list.append(form)
        signature_to_id[signature] = form_id
    for page in built_pages:
        if page["formFields"]:
            signature = json.dumps(page["formFields"])
            page["formId"] = signature_to_id[signature]
        else:
            page["formId"] = ""
        page.pop("formFields", None)

    # Blog membership from the blog index links plus /blog/ paths.
    for page in built_pages:
        if page["path"] in {"/blogs/", "/blog/"}:
            for block in page["blocks"]:
                if block["type"] == "paragraph":
                    for href in re.findall(r'href="([^"]+)"', block["html"]):
                        if href.startswith("/") and href not in {"/blogs/", "/blog/"}:
                            blog_paths.add(href)
                if block["type"] == "cta":
                    blog_paths.add(block["href"])
    for page in built_pages:
        page["kind"] = kind_for(page["path"], blog_paths, page.get("isPost", False))
        page.pop("isPost", None)

    logo = media.resolve(brand["logo"]) or ""
    logo_inverse = media.resolve(brand.get("logoInverse") or "") or logo
    phone = brand.get("phone") or (facts["phones"][0] if facts["phones"] else "")
    email = brand.get("email") or (facts["emails"][0] if facts["emails"] else "")
    hours = brand.get("hours") or facts["hours"]
    site = {
        "id": site_id,
        "name": brand["name"],
        "legalName": brand["legalName"],
        "shortName": brand["shortName"],
        "url": brand["url"],
        "description": brand["description"],
        "phone": {"label": phone, "href": phone_href(phone)},
        "fax": brand.get("fax", ""),
        "email": email,
        "address": brand["address"],
        "mapHref": brand["mapHref"],
        "geo": brand.get("geo"),
        "hours": hours,
        "hoursNote": brand.get("hoursNote", ""),
        "sameAs": brand.get("sameAs", []),
        "logo": logo,
        "logoInverse": logo_inverse,
        "nav": nav,
        "forms": form_list,
        "redirects": redirects,
        "areaServed": brand.get("areaServed", []),
        "languages": brand.get("languages", ["en"]),
        "person": brand.get("person"),
        "mediaBaseDefault": "https://pub-5816dac948084d6bbbebbfef2581cc24.r2.dev",
    }
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "site.json").write_text(json.dumps(site, indent=2) + "\n")
    (out_dir / "pages.json").write_text(json.dumps(built_pages, indent=2) + "\n")
    unique_gaps = sorted(set(gaps))
    (out_dir / "extract-gaps.json").write_text(json.dumps(unique_gaps, indent=2) + "\n")
    print(f"{site_id}: {len(built_pages)} pages, {len(form_list)} forms, {len(unique_gaps)} gaps, nav {len(nav)}")
    for page in built_pages:
        print(f"  {page['kind']:11} {page['path']} blocks={len(page['blocks'])} h1={page['h1'][:60]!r}")


ORLEANS = {
    "name": "Orleans Denture Clinic",
    "legalName": "Orleans Denture Clinic & Implant Centre",
    "shortName": "Orleans Denture Clinic",
    "url": "https://orleansdentureclinic.com",
    "description": "Denture specialists and implant centre in Orléans, Ottawa. Custom dentures, repairs, and dental implants at 2882 St. Joseph Blvd.",
    "phone": "613-590-9200",
    "fax": "613-590-9201",
    "email": "info@orleansdentureclinic.ca",
    "hours": [
        {"day": "Monday", "time": "8:00am - 6:00pm"},
        {"day": "Tuesday", "time": "8:00am - 4:30pm"},
        {"day": "Wednesday", "time": "8:00am - 3:00pm"},
        {"day": "Thursday", "time": "8:00am - 4:30pm"},
        {"day": "Friday", "time": "8:00am - 3:00pm"},
        {"day": "Saturday", "time": "Closed"},
        {"day": "Sunday", "time": "Closed"},
    ],
    "address": {
        "street": "2882 St. Joseph Blvd.",
        "locality": "Orléans",
        "region": "ON",
        "postalCode": "K1C 1G7",
        "country": "CA",
        "label": "2882 St. Joseph Blvd., Orléans, ON K1C 1G7",
    },
    "mapHref": "https://www.google.com/maps/search/?api=1&query=2882+St+Joseph+Blvd+Orleans+ON+K1C+1G7",
    "geo": {"latitude": 45.417412, "longitude": -75.51829},
    "hoursNote": "Thursday 8:00am–4:30pm and Friday 8:00am–3:00pm were recovered from the visible footer hours in the home page HTML. They match the LocalBusiness JSON-LD opens/closes (16:30 and 15:00).",
    "sameAs": [
        "https://www.facebook.com/p/Orleans-Denture-Clinic-100080942493508/",
        "https://www.linkedin.com/company/orleans-denture-clinic/about/",
    ],
    "logo": "https://orleansdentureclinic.com/wp-content/uploads/2023/03/odc-full-logo.svg",
    "logoInverse": "https://orleansdentureclinic.com/wp-content/uploads/2023/03/Orleans-Denture-Logo-White.svg",
    "heroVideo": "https://assets.webmarketers.ca/odc-interview.mp4",
    "mediaPrefix": "orleans",
    "areaServed": ["Ottawa, ON", "Orleans, ON", "Vanier, ON"],
    "languages": ["en", "fr"],
    "person": {
        "name": "Tom Szarski",
        "honorificSuffix": "DD",
        "jobTitle": "Denturist",
        "path": "/team/tomasz-szarski/",
    },
}

EMBRUN = {
    "name": "Embrun Denture & Implant Centre",
    "legalName": "Embrun Denture & Implant Centre",
    "shortName": "Embrun Dentures",
    "url": "https://www.embrundentures.com",
    "description": "Denture and implant centre in Embrun, Ontario. Custom dentures, implants, and denture care from a denturist near you.",
    "phone": "(613) 219-2945",
    "email": "info@embrundentures.ca",
    "address": {
        "street": "614 Notre-Dame St",
        "locality": "Embrun",
        "region": "ON",
        "postalCode": "K4R 1E5",
        "country": "CA",
        "label": "614 Notre-Dame St, Embrun, ON K4R 1E5",
    },
    "mapHref": "https://www.google.com/maps/search/?api=1&query=614+Notre-Dame+St+Embrun+ON+K4R+1E5",
    "hours": [
        {"day": "Monday", "time": "8:00am - 4:00pm"},
        {"day": "Tuesday", "time": "8:00am - 3:00pm"},
        {"day": "Wednesday", "time": "9:00am - 3:00pm"},
        {"day": "Thursday", "time": "9:00am - 3:00pm"},
        {"day": "Friday", "time": "9:00am - 3:00pm"},
        {"day": "Saturday", "time": "Closed"},
        {"day": "Sunday", "time": "Closed"},
    ],
    "hoursNote": "Hours taken from the visible Hours of Operation block on the home page.",
    "logo": "https://www.embrundentures.com/wp-content/uploads/2025/11/embrun-denture-and-implant-centre-logo.png",
    "logoInverse": "https://www.embrundentures.com/wp-content/uploads/2025/11/embrun-logo.png",
    "heroVideo": "https://www.embrundentures.com/wp-content/uploads/2026/06/banner_video.mp4",
    "mediaPrefix": "embrun",
    "areaServed": ["Embrun, ON", "Russell, ON", "Brisson, ON", "Forest Park, ON", "Forget, ON", "Longtinville, ON"],
    "languages": ["en", "fr"],
    "person": {
        "name": "Tom Szarski",
        "honorificSuffix": "DD",
        "jobTitle": "Denturist",
        "path": "/meet-our-denturist/",
    },
}


if __name__ == "__main__":
    root = Path("/tmp/scrapes")
    uploads = Path("/home/ubuntu/.cursor/projects/workspace/uploads")
    out = Path("/workspace/sites")
    build(
        "orleans",
        "orleansdentureclinic.com",
        root / "orleans",
        uploads / "media-r2_08ee.json",
        out / "orleans" / "content",
        ORLEANS,
    )
    build(
        "embrun",
        "embrundentures.com",
        root / "embrun",
        uploads / "media-r2_1757.json",
        out / "embrun" / "content",
        EMBRUN,
    )
