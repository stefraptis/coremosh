"""Makes the worn-surface textures that sit behind the sections below the hero.

Each texture is a soft patch of light marks on a transparent background:
scratches, speckles and scuffed, worn areas, fading out to nothing at the
edges (no hard edges). They are drawn in bone white and shown at low opacity
on the dark page, like the stage-light glows, but for surface instead of light.

    python3 scripts/make_textures.py

writes media/texture-scratch.webp, media/texture-speck.webp and
media/texture-worn.webp. The random seed is fixed, so the files only change
when this script does. Needs numpy and Pillow.
"""

import math
import pathlib

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H = 1400, 1000
SS = 2  # draw lines at twice the size, then shrink, for clean anti-aliasing
BONE = (236, 231, 222)


def noise(rng, w, h, scales=(8, 16, 32, 64), weights=(0.45, 0.3, 0.17, 0.08)):
    """Smooth value noise in 0..1, made from upscaled random grids."""
    out = np.zeros((h, w), np.float32)
    for s, wt in zip(scales, weights):
        grid = rng.random((max(2, h // s + 2), max(2, w // s + 2))).astype(np.float32)
        img = Image.fromarray((grid * 255).astype(np.uint8)).resize((w + 2 * s, h + 2 * s), Image.BICUBIC)
        out += wt * np.asarray(img, np.float32)[s:s + h, s:s + w] / 255
    out -= out.min()
    return out / out.max()


def falloff(rng, cx=0.5, cy=0.5):
    """An irregular soft patch: 1 in the middle, 0 at the edges."""
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    dx = (x / W - cx) / 0.5
    dy = (y / H - cy) / 0.5
    r = np.sqrt(dx * dx + dy * dy)
    n = noise(rng, W, H, scales=(64, 128, 256), weights=(0.3, 0.4, 0.3))
    r = r + (n - 0.5) * 0.55
    f = np.clip(1.0 - r, 0, 1)
    return f * f * (3 - 2 * f)


def scratches(rng, count, angle, spread, length, alpha, width=(0.6, 1.3)):
    """Thin, slightly bent strokes, mostly along one direction, with breaks."""
    layer = Image.new("L", (W * SS, H * SS), 0)
    d = ImageDraw.Draw(layer)
    for _ in range(count):
        a = math.radians(angle + rng.normal(0, spread))
        n = int(rng.uniform(*length) * SS)
        x, y = rng.uniform(0, W * SS), rng.uniform(0, H * SS)
        bend = rng.normal(0, 0.0025)
        base = rng.uniform(*alpha)
        wd = max(1, round(rng.uniform(*width) * SS))
        step = 3 * SS
        on = True
        for i in range(0, n, step):
            if rng.random() < 0.035:
                on = not on  # the scratch skips, like a worn surface
            env = math.sin(math.pi * i / max(n, 1)) ** 0.6
            nx, ny = x + math.cos(a) * step, y + math.sin(a) * step
            if on:
                v = int(255 * base * env * rng.uniform(0.6, 1.0))
                d.line((x, y, nx, ny), fill=v, width=wd)
            x, y = nx, ny
            a += bend
    return np.asarray(layer.resize((W, H), Image.LANCZOS), np.float32) / 255


def specks(rng, count, density, alpha, size=(0.5, 2.4)):
    """Small dots and flecks, gathered where the density map is high."""
    layer = Image.new("L", (W * SS, H * SS), 0)
    d = ImageDraw.Draw(layer)
    placed = 0
    while placed < count:
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        if rng.random() > density[int(y), int(x)] ** 1.6:
            continue
        placed += 1
        r = rng.uniform(*size) * SS
        v = int(255 * rng.uniform(*alpha))
        for _ in range(rng.integers(1, 4)):  # one to three dots make an uneven fleck
            ox, oy = rng.normal(0, r * 0.5, 2)
            rr = r * rng.uniform(0.5, 1.0)
            d.ellipse((x * SS + ox - rr, y * SS + oy - rr, x * SS + ox + rr, y * SS + oy + rr), fill=v)
    return np.asarray(layer.resize((W, H), Image.LANCZOS), np.float32) / 255


def worn(rng, alpha):
    """Scuffed areas: patchy, fine-grained light, like ink rubbed thin."""
    big = noise(rng, W, H, scales=(12, 32, 96, 192), weights=(0.25, 0.3, 0.25, 0.2))
    patch = np.clip((big - 0.58) / 0.2, 0, 1)
    grain = rng.random((H, W)).astype(np.float32)
    grain = np.asarray(Image.fromarray((grain * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)), np.float32) / 255
    grain = np.clip((grain - 0.5) / 0.22, 0, 1)
    return patch * grain * alpha


def scuffs(rng, count, alpha):
    """Small clusters of short parallel nicks."""
    out = np.zeros((H, W), np.float32)
    for _ in range(count):
        sub = scratches(rng, 14, rng.uniform(-40, 40), 4, (8, 40), alpha, (0.5, 0.9))
        cx, cy = rng.uniform(0.15, 0.85) * W, rng.uniform(0.15, 0.85) * H
        y, x = np.mgrid[0:H, 0:W].astype(np.float32)
        m = np.exp(-(((x - cx) / 60) ** 2 + ((y - cy) / 45) ** 2))
        out = np.maximum(out, sub * m)
    return out


def save(name, alpha):
    a = np.clip(alpha, 0, 1)
    rgba = np.zeros((H, W, 4), np.uint8)
    rgba[..., :3] = BONE
    rgba[..., 3] = (a * 255).astype(np.uint8)
    out = ROOT / "media" / f"texture-{name}.webp"
    Image.fromarray(rgba, "RGBA").save(out, "WEBP", quality=72, alpha_quality=60, method=6)
    print(f"{out.relative_to(ROOT)}: {out.stat().st_size // 1024} KB")


def main():
    rng = np.random.default_rng(1708)
    f = falloff(rng, 0.55, 0.5)
    dens = noise(rng, W, H)
    a = scratches(rng, 70, -14, 9, (60, 420), (0.25, 0.6))
    a = np.maximum(a, scratches(rng, 18, 62, 12, (30, 160), (0.15, 0.4)))
    a = np.maximum(a, scuffs(rng, 4, (0.3, 0.55)))
    a = np.maximum(a, specks(rng, 500, dens, (0.2, 0.6), (0.4, 1.4)))
    a = np.maximum(a, worn(rng, 0.18))
    save("scratch", a * f)

    rng = np.random.default_rng(2611)
    f = falloff(rng, 0.45, 0.5)
    dens = noise(rng, W, H)
    a = specks(rng, 2200, dens, (0.15, 0.65), (0.4, 2.2))
    a = np.maximum(a, specks(rng, 60, dens, (0.25, 0.5), (2.2, 4.2)))
    a = np.maximum(a, scratches(rng, 22, 8, 25, (20, 140), (0.18, 0.4)))
    a = np.maximum(a, worn(rng, 0.14))
    save("speck", a * f)

    rng = np.random.default_rng(904)
    f = falloff(rng, 0.5, 0.5)
    dens = noise(rng, W, H)
    a = worn(rng, 0.24)
    a = np.maximum(a, scuffs(rng, 7, (0.25, 0.5)))
    a = np.maximum(a, scratches(rng, 30, -28, 14, (40, 260), (0.18, 0.45)))
    a = np.maximum(a, specks(rng, 700, dens, (0.15, 0.5), (0.4, 1.6)))
    save("worn", a * f)


if __name__ == "__main__":
    main()
