"""Compress JPEG/PNG in assets/img (backs up to assets/img/_originals on first run)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
BACKUP = IMG / "_originals"

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install Pillow")
    raise SystemExit(1)

MAX_DIM = 1920
JPEG_QUALITY = 82


def compress(path: Path) -> None:
    rel = path.relative_to(IMG)
    bak = BACKUP / rel
    if not bak.exists():
        bak.parent.mkdir(parents=True, exist_ok=True)
        bak.write_bytes(path.read_bytes())

    img = Image.open(path)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    w, h = img.size
    if max(w, h) > MAX_DIM:
        img.thumbnail((MAX_DIM, MAX_DIM), Image.Resampling.LANCZOS)
    if path.suffix.lower() in (".jpg", ".jpeg"):
        img.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    elif path.suffix.lower() == ".png":
        img.save(path, "PNG", optimize=True)
    print("compressed", rel)


def main():
    for p in sorted(IMG.rglob("*")):
        if p.is_file() and p.suffix.lower() in (".jpg", ".jpeg", ".png"):
            if "_originals" in p.parts:
                continue
            try:
                compress(p)
            except Exception as e:
                print("skip", p.name, e)


if __name__ == "__main__":
    main()
