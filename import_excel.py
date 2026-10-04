#!/usr/bin/env python3
"""
Excel -> clean -> Postgres seed SQL (+ sitemap).
Usage:  python3 scripts/import_excel.py path/to/Recruitly_Universities_COMPLETE.xlsx
Writes: supabase/seed/001_universities.sql, 002_programs.sql, scripts/import_report.json, public/sitemap.xml
Never invents data: fields missing in the workbook stay NULL.
"""
import sys, re, json, math, difflib, unicodedata, datetime as dt
import pandas as pd, warnings
warnings.filterwarnings("ignore")

SRC = sys.argv[1] if len(sys.argv) > 1 else "Recruitly_Universities_COMPLETE.xlsx"
X = pd.ExcelFile(SRC)
FIX = {"Hunugary": "Hungary"}

def slugify(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

def country_of(sheet):
    c = re.sub(r"^[^\w]+", "", sheet).strip()
    c = re.sub(r"\s*(Unis|Programs)\s*$", "", c).strip()
    return FIX.get(c, c)

def nn(v):
    if v is None or (isinstance(v, float) and math.isnan(v)): return None
    if isinstance(v, (pd.Timestamp, dt.datetime, dt.date)): return v.strftime("%Y-%m-%d")
    v = str(v).strip()
    return v or None

def read_sheet(name):
    raw = X.parse(name, header=None)
    for i in range(min(5, len(raw))):
        vals = [str(v).strip().lower() for v in raw.iloc[i].tolist()]
        if "id" in vals and ("university name" in vals or "university" in vals):
            df = raw.iloc[i + 1:].copy()
            df.columns = vals
            return df
    return None

unis, progs = {}, []
used_slugs = set()
def uniq(base, extra):
    s = slugify(base) or "item"
    if s in used_slugs: s = slugify(f"{base}-{extra}")
    n = 2
    while s in used_slugs:
        s = f"{slugify(base)}-{slugify(extra)}-{n}"; n += 1
    used_slugs.add(s); return s

def add_uni(country, name, **kw):
    name = nn(name)
    if not name: return
    key = (country, slugify(name))
    if key in unis:  # duplicate: keep first, fill gaps
        for k, v in kw.items():
            if unis[key].get(k) is None and v is not None: unis[key][k] = v
        return
    unis[key] = dict(country=country, name=name, **kw)

for s in X.sheet_names:
    if "DASHBOARD" in s or "HOW TO" in s: continue
    plain = re.sub(r"^[^\w]+", "", s).strip()
    if plain == "Austria Programs":   # header-less list of Austrian institutions: name, country, link, type
        raw = X.parse(s, header=None)
        for _, r in raw.iterrows():
            add_uni("Austria", r[0], type=nn(r[3]), link=nn(r[2]))
        continue
    df = read_sheet(s)
    if df is None: print("skip (no header):", s); continue
    c = country_of(s)
    if "Program" in s:
        cn = "course name"
        for _, r in df.iterrows():
            course = nn(r.get(cn)); u = nn(r.get("university") or r.get("university name"))
            if not course or course in ("College/Institute", "University") or not u: continue
            progs.append(dict(country=c, uni=u, course=course, level=nn(r.get("level")), dept=nn(r.get("department")),
                              tuition=nn(r.get("tuition fee")), status=nn(r.get("status")), req=nn(r.get("admission req.")),
                              link=nn(r.get("link to the program")) or None))
    else:
        for _, r in df.iterrows():
            def num(v):
                try:
                    f = float(v); return None if math.isnan(f) else f
                except: return None
            st = nn(r.get("status")); st = st.upper() if st and st.upper() in ("OPEN", "CLOSED") else None
            add_uni(c, r.get("university name"), type=nn(r.get("type")), fee=nn(r.get("admission fee")),
                    english=nn(r.get("english certificate")), adm_date=nn(r.get("admission date")), deadline=nn(r.get("deadline")),
                    status=st, link=nn(r.get("link")), cgpa=nn(r.get("cgpa requirement")), fee_num=num(r.get("fee (num)")))

# ---- assign slugs (universities first) ----
for (c, _), u in sorted(unis.items(), key=lambda kv: (kv[0][0], kv[1]["name"])):
    u["slug"] = uniq(u["name"], c)
    u["status_data"] = "partial" if (u.get("link") and (u.get("fee") or u.get("english") or u.get("cgpa"))) else "unknown"

# ---- match programs to universities (same country only) ----
def norm(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"\(.*?\)", " ", s)
    s = re.sub(r"\buniv\b\.?", "university", s); s = re.sub(r"\b(tech|technol)\b\.?", "technology", s)
    s = re.sub(r"\bmedical\b", "medicine", s)
    return re.sub(r"[^a-z0-9 ]+", " ", s).split()
STOP = {"of", "the", "and", "in", "for"}
by_country = {}
for (c, _), u in unis.items():
    toks = [t for t in norm(u["name"]) if t not in STOP]
    ini = "".join(w[0] for w in re.sub(r"\(.*?\)", " ", u["name"]).split() if w.lower() not in STOP and w[0].isalpha()).upper()
    paren = [p.upper().replace(" ", "") for p in re.findall(r"\((.*?)\)", u["name"])]
    by_country.setdefault(c, []).append((u, " ".join(toks), set(toks), ini, paren))

def match(c, name):
    cands = by_country.get(c, [])
    toks = [t for t in norm(name) if t not in STOP]; joined = " ".join(toks); tset = set(toks)
    raw_up = re.sub(r"[^A-Za-z]", "", name).upper()
    for u, j, ts, ini, paren in cands:
        if j == joined: return u
    for u, j, ts, ini, paren in cands:
        if raw_up and (raw_up == ini or raw_up in paren): return u
    best = [u for u, j, ts, ini, paren in cands if len(tset) >= 2 and tset <= ts]
    if len(best) == 1: return best[0]
    return None

def lvl(v):
    if not v: return None
    l = v.lower()
    if l.startswith("bachelor"): return "Bachelor"
    if "master" in l: return "Master"
    if "phd" in l or "doctor" in l: return "PhD"
    return v.strip().title()

seen = set(); matched = 0; plist = []
for p in progs:
    u = match(p["country"], p["uni"])
    p["level"] = lvl(p["level"]); p["u"] = u
    k = (p["country"], slugify(p["uni"]), slugify(p["course"]), p["level"])
    if k in seen: continue
    seen.add(k)
    matched += 1 if u else 0
    p["slug"] = uniq(f'{p["course"]} {p["level"] or ""} {u["name"] if u else p["uni"]}', p["country"])
    p["status_data"] = "partial" if (p["tuition"] and u) else "unknown"
    plist.append(p)

# ---- write SQL ----
def q(v):
    if v is None: return "NULL"
    if isinstance(v, float): return "NULL" if math.isnan(v) or math.isinf(v) else repr(v)
    return "'" + str(v).replace("'", "''") + "'"
def chunks(lst, n):
    for i in range(0, len(lst), n): yield lst[i:i + n]

with open("supabase/seed/001_universities.sql", "w") as f:
    f.write("-- Generated by scripts/import_excel.py. Idempotent (upsert on slug).\n"
            "-- If the tables still hold the previous partial import, clear them first:\n"
            "--   TRUNCATE public.university_programs; TRUNCATE public.universities CASCADE;\n\n")
    cols = "(slug,country,university_name,type,admission_fee,english_cert,admission_date,deadline,status,link,website_url,cgpa_requirement,fee_numeric,data_status)"
    for ch in chunks(sorted(unis.values(), key=lambda u: (u["country"], u["name"])), 300):
        rows = ",\n".join("(" + ",".join(q(x) for x in (u["slug"], u["country"], u["name"], u.get("type"), u.get("fee"), u.get("english"),
                          u.get("adm_date"), u.get("deadline"), u.get("status"), u.get("link"), u.get("link"), u.get("cgpa"), u.get("fee_num"), u["status_data"])) + ")" for u in ch)
        f.write(f"INSERT INTO public.universities {cols} VALUES\n{rows}\nON CONFLICT (slug) DO UPDATE SET country=EXCLUDED.country, university_name=EXCLUDED.university_name, "
                "type=EXCLUDED.type, admission_fee=EXCLUDED.admission_fee, english_cert=EXCLUDED.english_cert, admission_date=EXCLUDED.admission_date, deadline=EXCLUDED.deadline, "
                "status=EXCLUDED.status, link=EXCLUDED.link, website_url=EXCLUDED.website_url, cgpa_requirement=EXCLUDED.cgpa_requirement, fee_numeric=EXCLUDED.fee_numeric, data_status=EXCLUDED.data_status;\n\n")

with open("supabase/seed/002_programs.sql", "w") as f:
    f.write("-- Generated by scripts/import_excel.py. Run AFTER 001_universities.sql.\n\n")
    cols = "(slug,country,university_name,university_id,course_name,level,department,tuition_fee,admission_requirement,status,link,program_url,data_status)"
    for ch in chunks(plist, 200):
        rows = []
        for p in ch:
            uid = f"(SELECT id FROM public.universities WHERE slug={q(p['u']['slug'])})" if p["u"] else "NULL"
            st = (p["status"] or "").upper(); st = "OPEN" if st.startswith("OPEN") else "CLOSED" if st.startswith("CLOS") else None
            rows.append("(" + ",".join([q(p["slug"]), q(p["country"]), q(p["u"]["name"] if p["u"] else p["uni"]), uid, q(p["course"]), q(p["level"]),
                        q(p["dept"]), q(p["tuition"]), q(p["req"]), q(st), q(p["link"]), q(p["link"]), q(p["status_data"])]) + ")")
        f.write(f"INSERT INTO public.university_programs {cols} VALUES\n" + ",\n".join(rows) +
                "\nON CONFLICT (slug) DO UPDATE SET university_id=EXCLUDED.university_id, course_name=EXCLUDED.course_name, level=EXCLUDED.level, department=EXCLUDED.department, "
                "tuition_fee=EXCLUDED.tuition_fee, admission_requirement=EXCLUDED.admission_requirement, status=EXCLUDED.status, link=EXCLUDED.link, program_url=EXCLUDED.program_url, data_status=EXCLUDED.data_status;\n\n")

# ---- sitemap: keep existing static entries, add country + university pages ----
import os
today = dt.date.today().isoformat()
existing = re.findall(r"<url>.*?</url>", open("public/sitemap.xml").read(), re.S) if os.path.exists("public/sitemap.xml") else []
existing = [e for e in existing if "/study-abroad" not in e and "/universities/" not in e]
COUNTRIES = sorted({u["country"] for u in unis.values()})
def url(p, pr): return f"  <url><loc>https://www.recruitlygroup.com{p}</loc><lastmod>{today}</lastmod><priority>{pr}</priority></url>"
new = [url("/study-abroad", "0.9")] + [url(f"/study-abroad/{slugify(c)}", "0.8") for c in COUNTRIES] + \
      [url(f"/universities/{u['slug']}", "0.5") for u in unis.values() if u.get("link") or u["status_data"] != "unknown"]
with open("public/sitemap.xml", "w") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            "\n".join(["  " + e.strip() for e in existing] + new) + "\n</urlset>\n")

rep = dict(universities=len(unis), programs=len(plist), programs_matched_to_university=matched, programs_unmatched=len(plist) - matched,
           countries=len(COUNTRIES), unis_partial=sum(u["status_data"] == "partial" for u in unis.values()),
           unis_with_link=sum(bool(u.get("link")) for u in unis.values()), sitemap_urls=len(new),
           unmatched_examples=[(p["country"], p["uni"]) for p in plist if not p["u"]][:15])
json.dump(rep, open("scripts/import_report.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps(rep, indent=1, ensure_ascii=False))

# ---- static filter/country lists for the frontend (no runtime request needed) ----
flags = dict(re.findall(r'^\s*"?([A-Za-z ]+?)"?:\s*\{\s*flag:"([^"]+)"', open("src/data/countryStore.ts").read(), re.M))
flags.update({"Greece": "🇬🇷", "Montenegro": "🇲🇪", "Malta": flags.get("Malta", "🇲🇹")})
deps = sorted({p["dept"] for p in plist if p["dept"]})
with open("src/data/generated.ts", "w") as f:
    f.write("// Generated by scripts/import_excel.py — do not edit by hand.\n")
    f.write("export const COUNTRY_LIST: { name: string; slug: string; flag: string }[] = " +
            json.dumps([dict(name=c, slug=slugify(c), flag=flags.get(c, "🌍")) for c in COUNTRIES], ensure_ascii=False, indent=1) + ";\n")
    f.write("export const DEPARTMENTS: string[] = " + json.dumps(deps, ensure_ascii=False, indent=1) + ";\n")
    f.write('export const LEVELS = ["Bachelor", "Master", "PhD"];\n')
