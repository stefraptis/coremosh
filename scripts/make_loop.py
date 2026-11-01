"""Makes a case-study loop: a desktop window and a phone, each scrolling its own
full-page screenshot, on the site's floor colour. Deterministic (every frame is
drawn from the screenshots; nothing is recorded live), so the loop is the same
every time it is made.

    python3 scripts/make_loop.py <desktop-full.png> <phone-full.png> <out-name> [--down 1900] [--phone-down 2100]

Writes media/<out-name>.mp4 (H.264, muted, 1600x900, 9 s) and
media/<out-name>-poster.webp (the first frame), and work images
media/<out-name>-1600.webp and -960.webp (the desktop's first screen, 16:10).
"""

import argparse
import pathlib
import subprocess
import tempfile

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H, FPS, SECONDS = 1600, 900, 30, 9
FLOOR, EDGE = (23, 21, 19), (62, 57, 51)


def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t) if t < 1 else 1.0


def scroll(t, down):
    """Hold, scroll down slowly, hold, scroll back up faster: a loop that meets itself."""
    if t < 1.0:
        return 0
    if t < 6.2:
        return down * ease((t - 1.0) / 5.2)
    if t < 7.2:
        return down
    return down * (1 - ease((t - 7.2) / 1.6))


def rounded_mask(size, r):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=r, fill=255)
    return m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("desktop")
    ap.add_argument("phone")
    ap.add_argument("name")
    ap.add_argument("--down", type=float, default=1900)
    ap.add_argument("--phone-down", type=float, default=2100)
    a = ap.parse_args()

    out = ROOT / "media"
    out.mkdir(exist_ok=True)

    dw, dh = 1040, 650
    desk = Image.open(a.desktop).convert("RGB")
    desk = desk.resize((dw, round(desk.height * dw / desk.width)), Image.LANCZOS)
    pw, ph = 300, 650
    phone = Image.open(a.phone).convert("RGB")
    phone = phone.resize((pw, round(phone.height * pw / phone.width)), Image.LANCZOS)
    pmask = rounded_mask((pw, ph), 30)
    dmask = rounded_mask((dw, dh), 10)
    dx, dy = 96, (H - dh) // 2
    px, py = W - 96 - pw, (H - ph) // 2
    down = min(a.down, desk.height - dh)
    pdown = min(a.phone_down, phone.height - ph)

    # Work images: the desktop's first screen at 16:10.
    first = Image.open(a.desktop).convert("RGB")
    first = first.crop((0, 0, first.width, round(first.width * 10 / 16)))
    for wdt in (1600, 960):
        first.resize((wdt, wdt * 10 // 16), Image.LANCZOS).save(out / f"{a.name}-{wdt}.webp", quality=82, method=6)

    with tempfile.TemporaryDirectory() as tmp:
        n = FPS * SECONDS
        for f in range(n):
            t = f / FPS
            frame = Image.new("RGB", (W, H), FLOOR)
            d = ImageDraw.Draw(frame)
            y = round(scroll(t, down))
            frame.paste(desk.crop((0, y, dw, y + dh)), (dx, dy), dmask)
            d.rounded_rectangle([dx - 1, dy - 1, dx + dw, dy + dh], radius=11, outline=EDGE, width=1)
            yp = round(scroll(max(0.0, t - 0.25), pdown))
            frame.paste(phone.crop((0, yp, pw, yp + ph)), (px, py), pmask)
            d.rounded_rectangle([px - 1, py - 1, px + pw, py + ph], radius=31, outline=EDGE, width=2)
            frame.save(f"{tmp}/f{f:04d}.png")
            if f == 0:
                frame.save(out / f"{a.name}-poster.webp", quality=80, method=6)
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", f"{tmp}/f%04d.png",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "27", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart", "-an", str(out / f"{a.name}.mp4"),
        ], check=True)
    for p in sorted(out.glob(a.name + "*")):
        print(p.relative_to(ROOT), p.stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
