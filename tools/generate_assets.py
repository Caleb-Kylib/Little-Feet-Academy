"""Generate logo.png, apple-touch-icon.png, og-share.jpg from favicon.svg."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow not installed; skip raster assets")
    raise SystemExit(0)


def draw_logo(size):
    img = Image.new("RGBA", (size, size), (12, 27, 51, 255))
    d = ImageDraw.Draw(img)
    r = size // 8
    d.ellipse((size * 0.18, size * 0.22, size * 0.18 + r * 2, size * 0.22 + r * 2), fill=(255, 122, 162))
    d.ellipse((size * 0.58, size * 0.22, size * 0.58 + r * 2, size * 0.22 + r * 2), fill=(102, 166, 255))
    d.arc((size * 0.15, size * 0.45, size * 0.85, size * 0.85), 20, 160, fill=(255, 209, 102), width=max(2, size // 16))
    return img


IMG.mkdir(parents=True, exist_ok=True)
logo = draw_logo(256)
logo.save(IMG / "logo.png", "PNG")
logo.resize((180, 180), Image.Resampling.LANCZOS).save(ROOT / "apple-touch-icon.png", "PNG")

og = Image.new("RGB", (1200, 630), (12, 27, 51))
d = ImageDraw.Draw(og)
d.rounded_rectangle((80, 120, 520, 520), radius=40, fill=(47, 103, 216))
d.rounded_rectangle((600, 180, 1120, 480), radius=30, fill=(255, 122, 162))
try:
    font = ImageFont.truetype("arial.ttf", 56)
    font_sm = ImageFont.truetype("arial.ttf", 32)
except OSError:
    font = ImageFont.load_default()
    font_sm = font
d.text((140, 200), "Little Feet", fill=(255, 255, 255), font=font)
d.text((140, 270), "Academy", fill=(255, 209, 102), font=font)
d.text((620, 260), "Joyful learning", fill=(255, 255, 255), font=font_sm)
d.text((620, 310), "Ongata Rongai", fill=(255, 255, 255), font=font_sm)
og.save(IMG / "og-share.jpg", "JPEG", quality=85, optimize=True)
print("Generated logo.png, apple-touch-icon.png, og-share.jpg")
