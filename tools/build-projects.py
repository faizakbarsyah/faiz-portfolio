#!/usr/bin/env python3
"""
FAIZ AKBARSYAH® — BUILD PROJECT ASSETS
==========================================================================
Mengubah file MENTAH proyek (PDF, PNG, JPG — disimpan DI LUAR repo) menjadi
aset siap web di  projects/<slug>/  lalu menyinkronkan data/projects.json.

  • PDF   → setiap halaman jadi 01.webp, 02.webp, ... (sisi terpanjang 2400px)
  • Foto  → WebP, auto-rotate (EXIF iPhone), metadata/GPS dihapus, maks 2400px
  • File bernama "cover.*" → cover.webp. Tanpa cover → gambar pertama dipakai.
  • Video → DILEWATI. Video ditampilkan lewat item gallery "youtube" di
    projects.json (diisi manual), dan TIDAK disentuh oleh script ini.

Aman dijalankan berulang kali:
  • File sumber yang sudah pernah dikonversi TIDAK dikonversi ulang (dicatat di
    <folder sumber>/.web-export.json). Jadi halaman PDF yang sudah kamu hapus
    dari projects/<slug>/ tidak akan muncul lagi.
  • File sumber baru → dikonversi & diberi nomor lanjutan.
  • projects.json: gallery gambar dibangun ulang dari file .webp yang ADA,
    caption yang sudah kamu edit tetap dipertahankan, item video/YouTube tidak
    disentuh (selalu diletakkan di awal galeri). Proyek otomatis published=true
    bila ada cover.webp ATAU minimal 1 video YouTube (cover = thumbnail YouTube).

Kebutuhan (sekali saja, di Mac):
  brew install imagemagick poppler

Pemakaian (dari root repo faiz-portfolio):
  python3 tools/build-projects.py                         # sumber default: ~/Documents/faiz-portfolio-source
  python3 tools/build-projects.py "/path/ke/folder/sumber"

Konversi ulang satu proyek dari nol: hapus folder projects/<slug>/ DAN file
.web-export.json di folder sumbernya, lalu jalankan lagi.
==========================================================================
"""

import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PROJECTS_DIR = REPO / "projects"
DATA_FILE = REPO / "data" / "projects.json"
MAP_FILE = Path(__file__).resolve().parent / "project-sources.json"
DEFAULT_SOURCE = Path.home() / "Documents" / "faiz-portfolio-source"

MANIFEST_NAME = ".web-export.json"
MAX_SIDE = 2400
QUALITY = 82

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".heic"}
VIDEO_EXT = {".mp4", ".mov", ".m4v", ".avi", ".mkv", ".webm"}
PDF_EXT = {".pdf"}
CAMERA_NAME = re.compile(r"^(IMG|DSC|DSCF|DJI|PXL|MVI)[_-]?\d+", re.IGNORECASE)
GALLERY_NAME = re.compile(r"^(\d+)\.webp$")


def fail(msg):
    print(f"\n✖ {msg}")
    sys.exit(1)


def find_magick():
    # ImageMagick 7 = "magick"; ImageMagick 6 = "convert"
    return shutil.which("magick") or shutil.which("convert")


def check_tools():
    magick = find_magick()
    if not magick:
        fail("ImageMagick belum terpasang. Jalankan: brew install imagemagick poppler")
    if not shutil.which("pdftoppm"):
        fail("Poppler (pdftoppm) belum terpasang. Jalankan: brew install imagemagick poppler")
    return magick


def to_webp(magick, src, dest):
    cmd = [
        magick, str(src),
        "-auto-orient",
        "-resize", f"{MAX_SIDE}x{MAX_SIDE}>",
        "-strip",
        "-quality", str(QUALITY),
        str(dest),
    ]
    subprocess.run(cmd, check=True, capture_output=True)


def clean_label(stem):
    if CAMERA_NAME.match(stem):
        return ""
    label = re.sub(r"^[A-Z]\s-\s", "", stem)   # buang prefix seperti "G - "
    label = re.sub(r"\s+", " ", label).strip()
    return label


def gallery_files(out_dir):
    files = []
    for f in out_dir.glob("*.webp"):
        m = GALLERY_NAME.match(f.name)
        if m:
            files.append((int(m.group(1)), f))
    return [f for _, f in sorted(files)]


def load_manifest(src_folder):
    path = src_folder / MANIFEST_NAME
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {"processed": {}, "captions": {}}


def save_manifest(src_folder, manifest):
    (src_folder / MANIFEST_NAME).write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def next_index(out_dir, manifest):
    used = [int(GALLERY_NAME.match(f.name).group(1)) for f in gallery_files(out_dir)]
    for outputs in manifest["processed"].values():
        for name in outputs:
            m = GALLERY_NAME.match(name)
            if m:
                used.append(int(m.group(1)))
    return (max(used) + 1) if used else 1


def process_folder(magick, src_folder, slug):
    out_dir = PROJECTS_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = load_manifest(src_folder)
    idx = next_index(out_dir, manifest)
    skipped_videos = []
    converted = 0

    sources = sorted(
        (f for f in src_folder.iterdir() if f.is_file() and not f.name.startswith(".")),
        key=lambda f: f.name.lower(),
    )

    for src in sources:
        ext = src.suffix.lower()

        if ext in VIDEO_EXT:
            skipped_videos.append(src.name)
            continue
        if src.name in manifest["processed"]:
            continue

        outputs = []

        if ext in PDF_EXT:
            label = clean_label(src.stem)
            with tempfile.TemporaryDirectory() as tmp:
                subprocess.run(
                    ["pdftoppm", "-png", "-scale-to", str(MAX_SIDE), str(src), f"{tmp}/page"],
                    check=True, capture_output=True,
                )
                pages = sorted(Path(tmp).glob("page*.png"),
                               key=lambda p: int(re.findall(r"\d+", p.stem)[-1]))
                for page_no, page in enumerate(pages, start=1):
                    name = f"{idx:02d}.webp"
                    to_webp(magick, page, out_dir / name)
                    manifest["captions"][name] = f"{label} — Halaman {page_no}" if label else ""
                    outputs.append(name)
                    idx += 1
            print(f"  • {src.name} → {len(outputs)} halaman")

        elif ext in IMAGE_EXT:
            if src.stem.lower() == "cover":
                name = "cover.webp"
            else:
                name = f"{idx:02d}.webp"
                manifest["captions"][name] = clean_label(src.stem)
                idx += 1
            to_webp(magick, src, out_dir / name)
            outputs.append(name)
            print(f"  • {src.name} → {name}")

        else:
            print(f"  ? {src.name} dilewati (format tidak dikenali)")
            continue

        manifest["processed"][src.name] = outputs
        converted += 1

    cover = out_dir / "cover.webp"
    gallery = gallery_files(out_dir)
    if not cover.exists() and gallery:
        shutil.copyfile(gallery[0], cover)
        print(f"  • cover.webp dibuat dari {gallery[0].name}")

    if skipped_videos:
        print(f"  ⏭  {len(skipped_videos)} video dilewati (YouTube): {', '.join(skipped_videos)}")

    save_manifest(src_folder, manifest)

    if not any(out_dir.iterdir()):
        out_dir.rmdir()

    return manifest["captions"], converted


def new_entry(slug, folder_name):
    return {
        "slug": slug, "title": folder_name, "categories": [], "year": "",
        "client": "", "role": "", "featured": False, "size": "medium",
        "published": False, "coverImage": "", "previewVideo": "",
        "summary": "", "context": "", "approach": "", "execution": "",
        "impact": "", "reflection": "", "gallery": [],
    }


def sync_entry(entry, slug, captions):
    out_dir = PROJECTS_DIR / slug
    cover = out_dir / "cover.webp"

    existing = {g.get("src"): g for g in entry.get("gallery", []) if g.get("type") == "image"}
    non_image = [g for g in entry.get("gallery", []) if g.get("type") != "image"]

    images = []
    if out_dir.exists():
        for f in gallery_files(out_dir):
            src = f"/projects/{slug}/{f.name}"
            images.append(existing.get(src) or {
                "type": "image", "src": src, "caption": captions.get(f.name, "")
            })

    # Video (YouTube) diletakkan di awal galeri — biasanya aftermovie adalah karya utama
    entry["gallery"] = non_image + images

    youtube = [g for g in non_image if g.get("type") == "youtube" and (g.get("id") or g.get("src"))]

    if cover.exists():
        entry["coverImage"] = f"/projects/{slug}/cover.webp"
        entry["published"] = True
    elif youtube:
        yt_id = youtube[0].get("id") or ""
        if not yt_id:
            m = re.search(r"(?:youtu\.be/|[?&]v=|/embed/|/shorts/)([A-Za-z0-9_-]{11})", youtube[0].get("src", ""))
            yt_id = m.group(1) if m else ""
        entry["coverImage"] = f"https://i.ytimg.com/vi/{yt_id}/maxresdefault.jpg" if yt_id else ""
        entry["published"] = bool(yt_id)
    else:
        entry["published"] = False


def main():
    source_root = Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else DEFAULT_SOURCE
    source_root = source_root.resolve()

    if not source_root.exists():
        fail(f"Folder sumber tidak ditemukan: {source_root}")
    if source_root == REPO or REPO in source_root.parents:
        fail("Folder sumber berada DI DALAM repo — file mentah (PDF/video klien) akan ikut "
             "ter-publish. Pindahkan ke luar folder faiz-portfolio dulu.")

    magick = check_tools()
    mapping = json.loads(MAP_FILE.read_text(encoding="utf-8"))["folders"]
    projects = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    by_slug = {p["slug"]: p for p in projects}

    print(f"Sumber : {source_root}")
    print(f"Tujuan : {PROJECTS_DIR}\n")

    missing_folders = []
    for folder_name, slug in mapping.items():
        src_folder = source_root / folder_name
        entry = by_slug.get(slug)
        if entry is None:
            entry = new_entry(slug, folder_name)
            projects.append(entry)
            by_slug[slug] = entry
            print(f"＋ Entri baru dibuat di projects.json: {slug} (lengkapi metadatanya)")

        if not src_folder.is_dir():
            missing_folders.append(folder_name)
            sync_entry(entry, slug, {})
            continue

        print(f"▸ {folder_name}  →  projects/{slug}/")
        captions, _ = process_folder(magick, src_folder, slug)
        sync_entry(entry, slug, captions)
        status = "published" if entry["published"] else "hidden (belum ada cover)"
        print(f"  ✓ {len([g for g in entry['gallery'] if g['type'] == 'image'])} gambar galeri — {status}\n")

    DATA_FILE.write_text(json.dumps(projects, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    unmapped = sorted(
        d.name for d in source_root.iterdir()
        if d.is_dir() and not d.name.startswith(".") and d.name not in mapping
    )

    print("──────────────────────────────────────────────")
    print(f"✓ data/projects.json diperbarui ({sum(1 for p in projects if p.get('published'))} proyek tampil)")
    if missing_folders:
        print(f"! Folder sumber tidak ditemukan: {', '.join(missing_folders)}")
    if unmapped:
        print(f"! Folder belum terdaftar di tools/project-sources.json: {', '.join(unmapped)}")
    print("Langkah berikut: cek projects/<slug>/, hapus halaman yang tidak ingin ditampilkan, "
          "lalu jalankan script ini sekali lagi untuk menyinkronkan projects.json.")


if __name__ == "__main__":
    main()
