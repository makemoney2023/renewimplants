#!/usr/bin/env python3
"""Scrape renewimplants.ca for rebuild salvage — same pack pattern as wilkandwilk/queenlynch/smilecaredental.
Also captures sister-site hero video from orleansdentureclinic.com.
"""
import os, re, json, hashlib, time, urllib.parse, html as htmlmod, subprocess
from pathlib import Path
from html import unescape
from collections import Counter, defaultdict
from datetime import datetime

BASE = "https://www.renewimplants.ca"
BASE_BARE = "https://renewimplants.ca"
SISTER = "https://orleansdentureclinic.com"
OUT = Path("/workspace/renewimplants")
RAW = OUT / "raw"
PAGES = OUT / "pages"
ASSETS = OUT / "assets"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

ALLOWED_HOSTS = (
    "renewimplants.ca",
    "www.renewimplants.ca",
    "orleansdentureclinic.com",
    "www.orleansdentureclinic.com",
    "assets.webmarketers.ca",
)

SKIP_HOST_FRAGMENTS = (
    "google-analytics", "doubleclick", "facebook.com/tr", "hotjar",
    "googletagmanager", "googleadservices", "google.com", "gstatic.com",
    "fonts.googleapis", "callrail", "msgsndr",
)

ASSET_CATS = ("brand", "staff", "interiors", "exteriors", "heroes", "other", "video")
for d in [RAW, PAGES] + [ASSETS / c for c in ASSET_CATS]:
    d.mkdir(parents=True, exist_ok=True)

def fetch(url, save_as=None, timeout=60):
    tmp = OUT / ".tmp_fetch"
    cmd = ["curl", "-sL", "--max-time", str(timeout), "-A", UA,
           "-w", "\n__META__%{http_code}|%{url_effective}|%{size_download}|%{content_type}",
           "-o", str(tmp), url]
    r = subprocess.run(cmd, capture_output=True, text=True)
    meta = r.stdout.strip().split("__META__")[-1] if r.stdout else "000|||0|"
    parts = meta.split("|")
    code = parts[0] if parts else "000"
    eff = parts[1] if len(parts) > 1 else url
    size = parts[2] if len(parts) > 2 else "0"
    ctype = parts[3] if len(parts) > 3 else ""
    data = tmp.read_bytes() if tmp.exists() else b""
    if save_as is not None:
        save_as.parent.mkdir(parents=True, exist_ok=True)
        save_as.write_bytes(data)
    return {"code": code, "url": url, "effective": eff, "size": int(float(size or 0)),
            "ctype": ctype, "data": data}

def slugify(path):
    p = path.strip("/") or "home"
    p = p.replace("/", "-")
    return re.sub(r"[^a-zA-Z0-9._-]", "-", p)[:140]

def strip_tags(html):
    html = re.sub(r"(?is)<script[^>]*>.*?</script>", " ", html)
    html = re.sub(r"(?is)<style[^>]*>.*?</style>", " ", html)
    html = re.sub(r"(?is)<!--.*?-->", " ", html)
    html = re.sub(r"(?is)<br\s*/?>", "\n", html)
    html = re.sub(r"(?is)</p>", "\n\n", html)
    html = re.sub(r"(?is)</(h[1-6]|li|tr|div)>", "\n", html)
    html = re.sub(r"(?is)<li[^>]*>", "- ", html)
    html = re.sub(r"(?is)<[^>]+>", " ", html)
    html = unescape(html)
    html = re.sub(r"[ \t]+", " ", html)
    html = re.sub(r"\n[ \t]+", "\n", html)
    html = re.sub(r"\n{3,}", "\n\n", html)
    return html.strip()

def extract_meta(html):
    title = ""
    m = re.search(r"(?is)<title[^>]*>(.*?)</title>", html)
    if m: title = strip_tags(m.group(1))
    desc = ""
    m = re.search(r'(?is)<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)["\']', html)
    if not m:
        m = re.search(r'(?is)<meta[^>]+content=["\']([^"\']*)["\'][^>]+name=["\']description["\']', html)
    if m: desc = unescape(m.group(1))
    og = ""
    m = re.search(r'(?is)<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', html)
    if not m:
        m = re.search(r'(?is)<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']', html)
    if m: og = m.group(1)
    return title, desc, og

def extract_headings(html):
    heads = []
    for level in range(1, 4):
        for m in re.finditer(rf"(?is)<h{level}[^>]*>(.*?)</h{level}>", html):
            t = strip_tags(m.group(1))
            t = re.sub(r"\s+", " ", t).strip()
            if t and len(t) < 300:
                heads.append((f"H{level}", t))
    return heads

def extract_paragraphs(html):
    paras = []
    for m in re.finditer(r"(?is)<p[^>]*>(.*?)</p>", html):
        t = strip_tags(m.group(1))
        t = re.sub(r"\s+", " ", t).strip()
        if not t or len(t) < 12: continue
        paras.append(t)
    for m in re.finditer(r"(?is)<li[^>]*>(.*?)</li>", html):
        t = strip_tags(m.group(1))
        t = re.sub(r"\s+", " ", t).strip()
        if t and 20 < len(t) < 500:
            if t.startswith("http"): continue
            if t not in paras:
                paras.append(f"• {t}")
    # blockquotes / testimonials
    for m in re.finditer(r"(?is)<blockquote[^>]*>(.*?)</blockquote>", html):
        t = strip_tags(m.group(1))
        t = re.sub(r"\s+", " ", t).strip()
        if t and len(t) > 20:
            paras.append(f"> {t}")
    return paras

def extract_ctas(html):
    ctas = []
    for m in re.finditer(r'(?is)<a[^>]+class=["\'][^"\']*(?:cta|btn|button)[^"\']*["\'][^>]*>(.*?)</a>', html):
        t = strip_tags(m.group(1))
        if t and 2 < len(t) < 80:
            ctas.append(t)
    seen = set(); out = []
    for c in ctas:
        if c not in seen:
            seen.add(c); out.append(c)
    return out

def abs_url(base, src):
    src = unescape(src.strip()).replace("&#38;", "&").replace("&amp;", "&")
    if not src or src.startswith("data:"): return None
    if src.startswith("//"): return "https:" + src
    return urllib.parse.urljoin(base, src)

IMG_EXT = re.compile(r"\.(?:jpe?g|png|gif|webp|svg|ico|bmp|tiff?)(?:\?|$)", re.I)
VID_EXT = re.compile(r"\.(?:mp4|webm|mov|m4v)(?:\?|$)", re.I)

def host_ok(url):
    try:
        h = urllib.parse.urlparse(url).hostname or ""
    except Exception:
        return False
    if any(s in h for s in SKIP_HOST_FRAGMENTS):
        return False
    return any(h == a or h.endswith("." + a) for a in ALLOWED_HOSTS) or h.endswith("webmarketers.ca")

def classify_asset(url, alt="", context=""):
    u = url.lower()
    name = urllib.parse.urlparse(u).path.lower()
    blob = " ".join([name, (alt or "").lower(), (context or "").lower()])
    if VID_EXT.search(u):
        return "video"
    if any(k in blob for k in ("logo", "favicon", "icon", "brand", "mark")):
        return "brand"
    if any(k in blob for k in ("tom", "team", "staff", "dentist", "doctor", "portrait", "headshot", "szarski")):
        return "staff"
    if any(k in blob for k in ("hero", "banner", "homepage")):
        return "heroes"
    if any(k in blob for k in ("lab", "interior", "clinic", "operatory", "office", "room", "reception")):
        return "interiors"
    if any(k in blob for k in ("exterior", "storefront", "building", "facade", "street")):
        return "exteriors"
    if any(k in blob for k in ("before", "after", "service-", "treatment", "allon4", "fullarch", "sedation", "snapon")):
        return "other"  # treatments / before-after live in other for pack consistency unless heroes
    return "other"

def extract_media_urls(html, page_url):
    found = []  # (url, alt, context)
    # img tags
    for m in re.finditer(r'(?is)<img\b([^>]*)>', html):
        attrs = m.group(1)
        src = None
        for attr in ("data-src", "data-lazy-src", "data-original", "src"):
            am = re.search(rf'{attr}=["\']([^"\']+)["\']', attrs, re.I)
            if am:
                src = am.group(1); break
        if not src:
            continue
        alt = ""
        am = re.search(r'alt=["\']([^"\']*)["\']', attrs, re.I)
        if am: alt = am.group(1)
        u = abs_url(page_url, src)
        if u: found.append((u, alt, "img"))
        # srcset
        sm = re.search(r'srcset=["\']([^"\']+)["\']', attrs, re.I)
        if sm:
            for part in sm.group(1).split(","):
                part = part.strip().split()[0] if part.strip() else ""
                if part:
                    u2 = abs_url(page_url, part)
                    if u2: found.append((u2, alt, "srcset"))
    # CSS url() backgrounds in inline style / style blocks
    for m in re.finditer(r'url\(["\']?([^"\')\s]+)["\']?\)', html, re.I):
        u = abs_url(page_url, m.group(1))
        if u and (IMG_EXT.search(u) or VID_EXT.search(u) or "/img/" in u):
            found.append((u, "", "css-url"))
    # video/source
    for m in re.finditer(r'(?is)<(?:video|source)\b([^>]*)>', html):
        attrs = m.group(1)
        for attr in ("src", "data-src", "poster"):
            am = re.search(rf'{attr}=["\']([^"\']+)["\']', attrs, re.I)
            if am:
                u = abs_url(page_url, am.group(1))
                if u: found.append((u, "", f"video-{attr}"))
    # elementor / data-settings encoded
    for m in re.finditer(r'background_video_link\\?&quot;:\\?&quot;(https?:[^&"\\]+)', html):
        u = unescape(m.group(1).replace("\\/", "/"))
        found.append((u, "", "elementor-bg-video"))
    for m in re.finditer(r'https?://[^"\'\s<>]+\.(?:mp4|webm|mov|m4v)', html, re.I):
        found.append((m.group(0), "", "raw-video-url"))
    # og:image
    title, desc, og = extract_meta(html)
    if og:
        u = abs_url(page_url, og)
        if u: found.append((u, "og:image", "og"))
    # naked /img/ paths
    for m in re.finditer(r'/img/[a-zA-Z0-9._/-]+', html):
        u = abs_url(page_url, m.group(0))
        if u: found.append((u, "", "path"))
    return found

def extract_internal_links(html, page_url):
    links = set()
    for m in re.finditer(r'(?is)<a[^>]+href=["\']([^"\'#]+)["\']', html):
        href = unescape(m.group(1)).strip()
        if href.startswith("mailto:") or href.startswith("tel:") or href.startswith("javascript:"):
            continue
        u = abs_url(page_url, href)
        if not u: continue
        p = urllib.parse.urlparse(u)
        if p.hostname and ("renewimplants.ca" in p.hostname):
            # drop query/fragment for crawl key
            clean = f"{p.scheme}://{p.hostname}{p.path}"
            if not clean.endswith("/") and "." not in Path(p.path).name:
                clean += "/"
            if p.path.endswith(".xml") or p.path.endswith(".txt"):
                clean = f"{p.scheme}://{p.hostname}{p.path}"
            links.add(clean.split("#")[0])
    return links

def image_dims(path):
    try:
        r = subprocess.run(["identify", "-format", "%wx%h", str(path)],
                           capture_output=True, text=True, timeout=10)
        if r.returncode == 0 and r.stdout.strip():
            return r.stdout.strip()
    except Exception:
        pass
    # fallback: try python pillow if available
    try:
        from PIL import Image
        with Image.open(path) as im:
            return f"{im.size[0]}x{im.size[1]}"
    except Exception:
        return "?"

def video_info(path):
    try:
        r = subprocess.run([
            "ffprobe", "-v", "quiet", "-print_format", "json",
            "-show_format", "-show_streams", str(path)
        ], capture_output=True, text=True, timeout=30)
        if r.returncode == 0 and r.stdout:
            info = json.loads(r.stdout)
            w = h = dur = None
            for s in info.get("streams", []):
                if s.get("codec_type") == "video":
                    w = s.get("width"); h = s.get("height")
                    break
            dur = info.get("format", {}).get("duration")
            return {"width": w, "height": h, "duration_sec": float(dur) if dur else None,
                    "size": int(info.get("format", {}).get("size") or path.stat().st_size)}
    except Exception:
        pass
    try:
        return {"width": None, "height": None, "duration_sec": None, "size": path.stat().st_size}
    except Exception:
        return {}

def nap_from_html(htmls):
    phones = set(); emails = set(); addresses = set()
    for html in htmls:
        for m in re.finditer(r'(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', html):
            phones.add(m.group(0).strip())
        # decoded emails if present as plaintext
        for m in re.finditer(r'[a-zA-Z0-9._%+-]+@renewimplants\.ca', html):
            emails.add(m.group(0).lower())
        if "2530" in html and "St Joseph" in html:
            addresses.add("2530 St Joseph Blvd #6, Orléans, ON K1C 1G1")
        if "2530" in html and "St. Joseph" in html:
            addresses.add("2530 St Joseph Blvd #6, Orléans, ON K1C 1G1")
    emails.add("info@renewimplants.ca")  # known from visible copy / mailto protection
    return sorted(phones), sorted(emails), sorted(addresses)

def is_soft_block(data, ctype):
    if not data: return True
    if "text/html" in (ctype or "") and len(data) < 20000:
        text = data.decode("utf-8", errors="replace")[:2000]
        if "One moment, please" in text or "just a moment" in text.lower():
            return True
    return False

def main():
    blockers = []
    scraped_at = datetime.now().astimezone().strftime("%Y-%m-%dT%H:%M:%S%z")
    # fix timezone format
    if len(scraped_at) >= 5 and scraped_at[-5] in "+-":
        scraped_at = scraped_at[:-2] + ":" + scraped_at[-2:] if scraped_at[-3] != ":" else scraped_at

    # --- robots + sitemap ---
    robots = fetch(BASE + "/robots.txt", RAW / "robots.txt")
    sm = fetch(BASE + "/sitemap.xml", RAW / "sitemap.xml")
    seed = set()
    if sm["code"] == "200" and sm["data"]:
        locs = re.findall(r"<loc>(.*?)</loc>", sm["data"].decode("utf-8", errors="replace"))
        for loc in locs:
            seed.add(loc.rstrip("/") + ("/" if not loc.rstrip("/").split("/")[-1].count(".") else ""))
            # normalize
            p = urllib.parse.urlparse(loc)
            path = p.path or "/"
            if path != "/" and not path.endswith("/") and "." not in Path(path).name:
                path += "/"
            seed.add(f"{BASE}{path}")
    else:
        blockers.append(f"sitemap.xml → HTTP {sm['code']}")

    # extras from nav not always in sitemap
    extras = [
        "/", "/contact-us/", "/pricing/", "/meet-your-dentist/", "/why-choose-us/",
        "/what-to-expect/", "/patient-stories/", "/before-after/", "/dental-anxiety/",
        "/faq/", "/service-areas/", "/blog/", "/privacy-policy/", "/terms/", "/sitemap/",
        "/easy-implant-en/", "/for-dentists/",
        "/services/all-on-4-dental-implants/", "/services/full-arch-dental-implants/",
        "/services/same-day-dental-implants/", "/services/denture-alternative/",
        "/services/upper-jaw-implants/", "/services/lower-jaw-implants/",
        "/services/sedation-dentistry/", "/services/failed-dental-work/",
    ]
    for e in extras:
        seed.add(BASE + e)
    # bare domain home
    seed.add(BASE_BARE + "/")

    # also try wp-sitemap variants (may soft-fail)
    for alt in ["/wp-sitemap.xml", "/sitemap_index.xml", "/page-sitemap.xml"]:
        r = fetch(BASE + alt, RAW / (slugify(alt) + ".xml"))
        if r["code"] == "200" and b"<loc>" in r["data"][:5000]:
            for loc in re.findall(r"<loc>(.*?)</loc>", r["data"].decode("utf-8", errors="replace")):
                seed.add(loc)

    # BFS crawl
    queue = sorted(seed)
    seen = set()
    pages = []  # dicts
    all_html = []
    media_map = {}  # url -> {alt, pages, context}

    while queue:
        url = queue.pop(0)
        # normalize key
        p = urllib.parse.urlparse(url)
        if "renewimplants.ca" not in (p.hostname or ""):
            continue
        key = f"{p.scheme}://www.renewimplants.ca{p.path or '/'}"
        if not key.endswith("/") and "." not in Path(p.path).name:
            key += "/"
        if p.path.endswith(".xml") or p.path.endswith(".txt") or p.path.endswith(".css") or p.path.endswith(".js"):
            key = f"{p.scheme}://www.renewimplants.ca{p.path}"
        if key in seen:
            continue
        seen.add(key)

        # skip non-html assets as pages
        if re.search(r"\.(css|js|jpg|jpeg|png|gif|webp|svg|mp4|webm|pdf|xml|txt|ico)(?:$|\?)", key, re.I):
            continue

        slug = slugify(urllib.parse.urlparse(key).path)
        print(f"FETCH {key}")
        res = fetch(key, RAW / f"{slug}.html")
        time.sleep(0.15)

        if res["code"] != "200":
            blockers.append(f"{key} → HTTP {res['code']}")
            pages.append({"url": key, "slug": slug, "code": res["code"], "title": "", "ok": False})
            continue
        if is_soft_block(res["data"], res["ctype"]):
            blockers.append(f"{key} → soft-block / bot challenge HTML")
            pages.append({"url": key, "slug": slug, "code": res["code"], "title": "(soft-block)", "ok": False})
            continue
        if "text/html" not in (res["ctype"] or "") and res["ctype"]:
            # might still be html without ctype
            if not res["data"].lstrip().startswith(b"<!DOCTYPE") and not res["data"].lstrip().startswith(b"<html"):
                continue

        html = res["data"].decode("utf-8", errors="replace")
        all_html.append(html)
        title, desc, og = extract_meta(html)
        heads = extract_headings(html)
        paras = extract_paragraphs(html)
        ctas = extract_ctas(html)

        # write page md
        md = [f"# {title or slug}", "", f"**URL:** {key}", ""]
        if desc:
            md += [f"**Meta description:** {desc}", ""]
        if heads:
            md.append("## Headings")
            for lvl, t in heads:
                md.append(f"- **{lvl}:** {t}")
            md.append("")
        if ctas:
            md.append("## CTAs")
            for c in ctas:
                md.append(f"- {c}")
            md.append("")
        if paras:
            md.append("## Copy")
            md.append("")
            for ptxt in paras:
                md.append(ptxt)
                md.append("")
        (PAGES / f"{slug}.md").write_text("\n".join(md), encoding="utf-8")

        pages.append({
            "url": key, "slug": slug, "code": res["code"], "title": title,
            "desc": desc, "heads": heads, "paras": paras, "ctas": ctas, "ok": True,
            "og": og,
        })

        # enqueue new links
        for link in extract_internal_links(html, key):
            lp = urllib.parse.urlparse(link)
            lkey = f"https://www.renewimplants.ca{lp.path or '/'}"
            if not lkey.endswith("/") and "." not in Path(lp.path).name:
                lkey += "/"
            if lkey not in seen:
                queue.append(lkey)

        # media
        for u, alt, ctx in extract_media_urls(html, key):
            if not host_ok(u) and "renewimplants.ca" not in u and "webmarketers.ca" not in u:
                # allow same-site relative resolved
                if "renewimplants.ca" not in (urllib.parse.urlparse(u).hostname or ""):
                    continue
            # strip resize query for uniqueness preference — keep full URL for download
            media_map.setdefault(u, {"alt": alt, "contexts": set(), "pages": set()})
            if alt and not media_map[u]["alt"]:
                media_map[u]["alt"] = alt
            media_map[u]["contexts"].add(ctx)
            media_map[u]["pages"].add(key)

    # Also parse CSS for /img/
    css_path = RAW / "styles.css"
    if css_path.exists():
        css = css_path.read_text(errors="replace")
        for m in re.finditer(r'/img/[a-zA-Z0-9._/-]+', css):
            u = BASE + m.group(0)
            media_map.setdefault(u, {"alt": "", "contexts": set(), "pages": set()})
            media_map[u]["contexts"].add("css")
            media_map[u]["pages"].add(BASE + "/assets/styles.css")

    # Prefer full-size: for wordpress-style -WxH names pick largest; here mostly unique paths
    # Download images
    downloaded = []  # records
    seen_hash = {}
    for url, meta in sorted(media_map.items()):
        if VID_EXT.search(url):
            cat = "video"
        else:
            cat = classify_asset(url, meta["alt"], " ".join(meta["contexts"]) + " " + " ".join(meta["pages"]))
        # filename
        path = urllib.parse.urlparse(url).path
        base_name = Path(path).name or "asset.bin"
        base_name = re.sub(r"[^a-zA-Z0-9._-]", "-", base_name)
        dest = ASSETS / cat / base_name
        # avoid overwrite collisions
        if dest.exists():
            hshort = hashlib.md5(url.encode()).hexdigest()[:6]
            dest = ASSETS / cat / f"{dest.stem}-{hshort}{dest.suffix}"

        print(f"ASSET [{cat}] {url}")
        res = fetch(url, dest, timeout=120)
        time.sleep(0.1)
        if res["code"] != "200" or is_soft_block(res["data"], res["ctype"]) or res["size"] < 200:
            if dest.exists():
                dest.unlink()
            blockers.append(f"asset fail {url} → {res['code']} {res.get('ctype')} {res['size']}")
            continue
        # skip if HTML disguised
        if res["data"][:50].lstrip().startswith(b"<!DOCTYPE") or res["data"][:20].lstrip().startswith(b"<html"):
            dest.unlink(missing_ok=True)
            blockers.append(f"asset HTML soft-404 {url}")
            continue
        digest = hashlib.md5(res["data"]).hexdigest()
        if digest in seen_hash:
            # duplicate content — keep first, note
            dest.unlink(missing_ok=True)
            continue
        seen_hash[digest] = str(dest)

        dims = "?"
        if cat != "video" and not dest.suffix.lower() in (".svg", ".ico"):
            dims = image_dims(dest)
        elif cat == "video":
            vi = video_info(dest)
            dims = f"{vi.get('width')}x{vi.get('height')}" if vi.get("width") else "?"
            dur = vi.get("duration_sec")
        else:
            dur = None

        rec = {
            "url": url, "path": str(dest.relative_to(OUT)), "cat": cat,
            "bytes": res["size"], "dims": dims, "alt": meta["alt"],
            "pages": sorted(meta["pages"])[:10],
        }
        if cat == "video":
            vi = video_info(dest)
            rec["duration_sec"] = vi.get("duration_sec")
            if vi.get("width"):
                rec["dims"] = f"{vi['width']}x{vi['height']}"
        downloaded.append(rec)

    # Sister site video (already may be downloading) — ensure present + document
    sister_html_path = RAW / "orleans-sister-home.html"
    if not sister_html_path.exists() or sister_html_path.stat().st_size < 1000:
        fetch(SISTER + "/", sister_html_path)
    sister_html = sister_html_path.read_text(errors="replace") if sister_html_path.exists() else ""
    sister_videos = []
    for m in re.finditer(r'background_video_link\\?&quot;:\\?&quot;(https?:[^&"\\]+)', sister_html):
        sister_videos.append(("hero-bg", unescape(m.group(1).replace("\\/", "/"))))
    for m in re.finditer(r'(?:src|data-src)=["\'](https?://[^"\']+\.(?:mp4|webm|mov)[^"\']*)["\']', sister_html, re.I):
        sister_videos.append(("inline-video", m.group(1)))
    # dedupe
    seen_v = set(); sister_unique = []
    for kind, vu in sister_videos:
        if vu not in seen_v:
            seen_v.add(vu); sister_unique.append((kind, vu))

    sister_records = []
    for kind, vu in sister_unique:
        name = Path(urllib.parse.urlparse(vu).path).name
        if kind == "hero-bg":
            dest = ASSETS / "video" / "orleans-homepage-hero.mp4"
        else:
            dest = ASSETS / "video" / f"orleans-{name}"
        if not dest.exists() or dest.stat().st_size < 1000:
            print(f"SISTER VIDEO {vu}")
            res = fetch(vu, dest, timeout=300)
            if res["code"] != "200" or res["size"] < 1000:
                blockers.append(f"sister video fail {vu}")
                continue
        vi = video_info(dest)
        sister_records.append({
            "kind": kind, "source_url": vu, "path": str(dest.relative_to(OUT)),
            "page": SISTER + "/",
            "dims": f"{vi.get('width')}x{vi.get('height')}" if vi.get("width") else "?",
            "duration_sec": vi.get("duration_sec"),
            "bytes": dest.stat().st_size,
        })
        # also add to downloaded if not already
        if not any(d["path"] == str(dest.relative_to(OUT)) for d in downloaded):
            downloaded.append({
                "url": vu, "path": str(dest.relative_to(OUT)), "cat": "video",
                "bytes": dest.stat().st_size,
                "dims": f"{vi.get('width')}x{vi.get('height')}" if vi.get("width") else "?",
                "duration_sec": vi.get("duration_sec"),
                "alt": "Orleans Denture Clinic homepage hero / interview",
                "pages": [SISTER + "/"],
            })

    phones, emails, addresses = nap_from_html(all_html)

    # --- Write docs ---
    ok_pages = [p for p in pages if p.get("ok")]
    counts = Counter(d["cat"] for d in downloaded)

    # SITE-MAP.md
    nav_order = []
    if ok_pages:
        # try extract from home
        home = next((p for p in ok_pages if p["slug"] == "home"), None)
        home_html = (RAW / "home.html").read_text(errors="replace") if (RAW / "home.html").exists() else ""
        for m in re.finditer(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', home_html, re.I|re.S):
            href, t = m.group(1), strip_tags(m.group(2))
            t = re.sub(r"\s+", " ", t).strip()
            if t and href.startswith("/") and len(t) < 60 and t not in [x[0] for x in nav_order]:
                if any(k in t.lower() for k in ["home", "implant", "expect", "before", "meet", "why", "scared", "blog", "patient", "pricing", "contact", "dentist", "faq", "service", "easy", "for dentist", "sedation", "denture", "failed", "same day", "upper", "lower", "full arch", "all-on"]):
                    nav_order.append((t, href))

    sm_lines = [
        "# Site map — Renew Implants",
        "",
        f"**Primary:** {BASE}/",
        f"**Also:** {BASE_BARE}/ (redirects/serves same)",
        f"**Sister:** {SISTER}/ (hero video source)",
        "",
        "## Tech stack",
        "- Custom static/marketing site (not WordPress on live front-end)",
        "- Assets under `/assets/styles.css`, `/assets/scripts.js`, `/img/*`",
        "- Fonts: DM Serif Display + Plus Jakarta Sans (Google Fonts)",
        "- Analytics: Google Tag Manager `G-YZG16B3H0V`",
        "- Call tracking: CallRail",
        "- Forms: HighLevel / msgsndr form embed",
        "- CDN/security: Cloudflare (directory indexes return bot interstitial)",
        "- Sister site: WordPress + Elementor 4.x; hero video hosted on `assets.webmarketers.ca`",
        "",
        "## Navigation (from homepage)",
        "",
    ]
    for t, href in nav_order[:40]:
        sm_lines.append(f"- [{t}]({href})")
    sm_lines += ["", "## Pages crawled", ""]
    for p in sorted(pages, key=lambda x: x["url"]):
        status = "OK" if p.get("ok") else f"FAIL {p.get('code')}"
        sm_lines.append(f"- `{p['url']}` — {status} — {p.get('title','')[:80]}")
    sm_lines += ["", f"**OK pages:** {len(ok_pages)} / {len(pages)}", ""]
    (OUT / "SITE-MAP.md").write_text("\n".join(sm_lines), encoding="utf-8")

    # COPY.md
    copy_lines = ["# Copy dump — Renew Implants", "", "Clean per-page copy also in `pages/`.", ""]
    for p in ok_pages:
        copy_lines += [f"## {p.get('title') or p['slug']}", "", f"URL: {p['url']}", ""]
        if p.get("desc"):
            copy_lines += [f"*Meta:* {p['desc']}", ""]
        for lvl, t in p.get("heads") or []:
            copy_lines.append(f"**{lvl}:** {t}")
        copy_lines.append("")
        for para in (p.get("paras") or [])[:80]:
            copy_lines.append(para)
            copy_lines.append("")
        if p.get("ctas"):
            copy_lines.append("CTAs: " + "; ".join(p["ctas"]))
            copy_lines.append("")
        copy_lines.append("---")
        copy_lines.append("")
    (OUT / "COPY.md").write_text("\n".join(copy_lines), encoding="utf-8")

    # CONTACTS-NAP.md
    nap = [
        "# Contacts / NAP — Renew Implants",
        "",
        "## Name",
        "Renew Implants / Renew Implant Centre",
        "",
        "## Address",
    ]
    for a in addresses or ["2530 St Joseph Blvd #6, Orléans, ON K1C 1G1"]:
        nap.append(f"- {a}")
    nap += ["", "## Phone"]
    # prefer formatted
    nap.append("- 613-841-6111")
    for ph in phones:
        if ph.replace(" ", "").replace("-", "").replace("(", "").replace(")", "") not in "6138416111+16138416111":
            nap.append(f"- {ph}")
    nap += ["", "## Email", "- info@renewimplants.ca", ""]
    nap += [
        "## Key people",
        "- Tom Szarski — dentist / founder (family in dentistry four generations; 20+ years in Ottawa)",
        "",
        "## Service area (from site)",
        "Orléans, Ottawa East, Rockland, Cumberland, Clarence-Rockland, Embrun, Casselman, Hawkesbury, Gatineau, Kanata, Barrhaven",
        "",
        "## Hours",
        "- Not clearly listed on scraped pages (check Google Business / contact form flow)",
        "",
        "## Sister brand",
        f"- Orleans Denture Clinic — {SISTER}/ (shared Webmarketers CDN assets; hero video salvaged)",
        "",
    ]
    (OUT / "CONTACTS-NAP.md").write_text("\n".join(nap), encoding="utf-8")

    # ASSETS-MANIFEST.md
    am = ["# Assets manifest — Renew Implants", "", f"Total files: {len(downloaded)}", ""]
    for cat in ASSET_CATS:
        items = [d for d in downloaded if d["cat"] == cat]
        am.append(f"## {cat}/ ({len(items)})")
        am.append("")
        for d in items:
            extra = ""
            if d.get("duration_sec"):
                extra = f" · duration {d['duration_sec']:.1f}s"
            am.append(f"- `{d['path']}` — {d.get('dims','?')} · {d['bytes']} bytes{extra}")
            am.append(f"  - source: {d['url']}")
            if d.get("alt"):
                am.append(f"  - alt: {d['alt']}")
            if d.get("pages"):
                am.append(f"  - seen on: {', '.join(d['pages'][:3])}")
        am.append("")
    (OUT / "ASSETS-MANIFEST.md").write_text("\n".join(am), encoding="utf-8")

    # SISTER-SITE-VIDEO.md
    sv = [
        "# Sister-site hero video — Orleans Denture Clinic",
        "",
        f"**Sister homepage:** {SISTER}/",
        "**Purpose:** Homepage background hero video for rebuild reference / reuse consideration with Renew Implants sister brand.",
        "",
        "## Primary hero (main banner background)",
    ]
    hero = next((r for r in sister_records if r["kind"] == "hero-bg"), None)
    if hero:
        sv += [
            f"- **Source URL:** {hero['source_url']}",
            f"- **Local path:** `{hero['path']}`",
            f"- **Page:** {hero['page']}",
            f"- **Dims:** {hero['dims']}",
            f"- **Duration:** {hero['duration_sec']:.1f}s" if hero.get("duration_sec") else "- **Duration:** unknown",
            f"- **Size:** {hero['bytes']} bytes",
            "- **How found:** Elementor container `data-settings` → `background_video_link` (filename typo on CDN: `orleands-denture-clinic-homepage.mp4`)",
            "- **Markup:** empty `<video class=\"elementor-background-video-hosted\" autoplay muted playsinline loop>` filled by Elementor JS from settings",
            "",
        ]
    else:
        sv += ["- NOT FOUND / download failed", ""]
    sv += ["## Other high-value video on same homepage", ""]
    for r in sister_records:
        if r["kind"] == "hero-bg":
            continue
        sv += [
            f"- **Kind:** {r['kind']}",
            f"- **Source URL:** {r['source_url']}",
            f"- **Local path:** `{r['path']}`",
            f"- **Dims:** {r['dims']}",
            f"- **Duration:** {r['duration_sec']:.1f}s" if r.get("duration_sec") else "- **Duration:** unknown",
            f"- **Size:** {r['bytes']} bytes",
            "- **Note:** Patient/doctor interview embed (`odc-interview.mp4`) — not the autoplay hero, but main content video on homepage",
            "",
        ]
    sv += [
        "## Renew Implants videos",
        "- No mp4/webm/mov found on renewimplants.ca pages during crawl (hero is still image `/img/renew-hero.jpg`).",
        "",
    ]
    (OUT / "SISTER-SITE-VIDEO.md").write_text("\n".join(sv), encoding="utf-8")

    # README
    readme = f"""# Renew Implants — website salvage pack

Scraped from [{BASE}]({BASE}/) for a clean rebuild handoff.
Sister-site homepage hero video from [{SISTER}]({SISTER}/).

## Quick facts
- **Address:** 2530 St Joseph Blvd #6, Orléans, ON K1C 1G1
- **Phone:** 613-841-6111
- **Email:** info@renewimplants.ca
- **Lead:** Tom Szarski

## What's in this pack
| File / folder | Purpose |
|---------------|---------|
| `SITE-MAP.md` | URL inventory + nav hierarchy + tech notes |
| `COPY.md` + `pages/` | Clean per-page copy |
| `CONTACTS-NAP.md` | Phone, email, address, people, service area |
| `ASSETS-MANIFEST.md` | Every downloaded image/video with dims/bytes |
| `SISTER-SITE-VIDEO.md` | Orleans hero video provenance |
| `assets/` | brand / staff / interiors / exteriors / heroes / other / video |
| `raw/` | HTML (+ CSS/JS) snapshots |
| `FINAL-REPORT.md` / `scrape-summary.json` | Counts, blockers, summary |
| `scrape.py` | Reproducible scraper |

## Counts
- Pages (md): {len(ok_pages)} · Images+video files: {len(downloaded)} · Breakdown: {dict(counts)}

## Do not
- Do not treat this as a platform migration.
- Parent agent handles CopyFromBox — this pack stays on the box under `/workspace/renewimplants/`.
"""
    (OUT / "README.md").write_text(readme, encoding="utf-8")

    # FINAL-REPORT
    fr = [
        "# Final report — Renew Implants salvage",
        "",
        f"**Scraped at:** {scraped_at} (America/Toronto)",
        f"**Primary site:** {BASE}",
        f"**Sister video source:** {SISTER}",
        "",
        "## Success metrics",
        f"- Pages OK (md): **{len(ok_pages)}**",
        f"- Pages attempted: **{len(pages)}**",
        f"- Asset files downloaded: **{len(downloaded)}**",
        f"- Asset breakdown: `{dict(counts)}`",
        f"- Hero video present: **{(ASSETS / 'video' / 'orleans-homepage-hero.mp4').exists()}**",
        f"- NAP phone: 613-841-6111 · email: info@renewimplants.ca · address: 2530 St Joseph Blvd #6, Orléans, ON K1C 1G1",
        "",
        "## Blockers / notes",
    ]
    if blockers:
        for b in blockers:
            fr.append(f"- {b}")
    else:
        fr.append("- None critical")
    fr += [
        "",
        "## Notes",
        "- Live Renew front-end is a custom `/assets` + `/img` site behind Cloudflare; directory indexes return bot interstitial HTML.",
        "- Sitemap.xml is available and lists main URLs; some nav URLs (`/easy-implant-en/`, `/for-dentists/`) may soft-block or be thin.",
        "- Image set on Renew is intentionally small (hero, lab, Tom portrait, four service cards); before/after may be embedded differently or sparse.",
        "- Orleans hero MP4 filename on CDN is misspelled `orleands-...`.",
        "",
    ]
    (OUT / "FINAL-REPORT.md").write_text("\n".join(fr), encoding="utf-8")

    summary = {
        "site": BASE,
        "sister": SISTER,
        "scraped_at": scraped_at,
        "pages_md": len(ok_pages),
        "pages_attempted": len(pages),
        "raw_html": len(list(RAW.glob("*.html"))),
        "images_and_video": len(downloaded),
        "counts": dict(counts),
        "pages_200": len(ok_pages),
        "pages_non_200": len(pages) - len(ok_pages),
        "phones": ["613-841-6111"],
        "email": "info@renewimplants.ca",
        "address": "2530 St Joseph Blvd #6, Orléans, ON K1C 1G1",
        "hero_video": str((ASSETS / "video" / "orleans-homepage-hero.mp4").relative_to(OUT)) if (ASSETS / "video" / "orleans-homepage-hero.mp4").exists() else None,
        "sister_videos": sister_records,
        "blockers": blockers,
        "tech": "Custom static front-end (/assets,/img); Cloudflare; GTM; CallRail; msgsndr forms. Sister: WP+Elementor; video CDN assets.webmarketers.ca",
    }
    (OUT / "scrape-summary.json").write_text(json.dumps(summary, indent=2, default=str), encoding="utf-8")
    print("DONE", json.dumps({k: summary[k] for k in ("pages_md", "images_and_video", "counts", "hero_video")}, indent=2))

if __name__ == "__main__":
    main()
