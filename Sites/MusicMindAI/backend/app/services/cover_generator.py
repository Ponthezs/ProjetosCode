import os
import io
import base64
import random
from typing import Tuple

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    Image = None

class CoverGenerator:
    """
    Generates modern, minimalist, neon, dark, Spotify-style playlist cover art.
    Supports gradient background generation, geometric accents, overlay typography, and glassmorphism.
    """

    COLOR_PALETTES = [
        # Dark Emerald / Neon Green
        ((11, 14, 20), (29, 185, 84), (16, 185, 129)),
        # Cyber Violet / Purple
        ((15, 12, 29), (139, 92, 246), (192, 132, 252)),
        # Sunset Flame / Coral
        ((24, 15, 15), (244, 63, 94), (251, 146, 60)),
        # Midnight Blue / Ocean
        ((10, 20, 35), (14, 165, 233), (99, 102, 241)),
        # Dark Luxury Gold
        ((18, 18, 18), (234, 179, 8), (250, 204, 21))
    ]

    def generate_cover_b64(self, title: str, style: str = "neon") -> str:
        """
        Creates a 500x500 PNG image and returns a data:image/png;base64 string.
        """
        if not Image:
            return self._svg_fallback_b64(title, style)

        width, height = 500, 500
        bg_color, accent1, accent2 = random.choice(self.COLOR_PALETTES)

        # Create base dark image
        img = Image.new("RGB", (width, height), bg_color)
        draw = ImageDraw.Draw(img)

        # Draw diagonal gradient / neon ambient glow circles
        glow = Image.new("RGB", (width, height), bg_color)
        glow_draw = ImageDraw.Draw(glow)

        # Neon Glow circles
        glow_draw.ellipse([100, 50, 450, 400], fill=accent1)
        glow_draw.ellipse([50, 200, 350, 500], fill=accent2)

        # Blur for glassmorphic neon aura
        glow = glow.filter(ImageFilter.GaussianBlur(80))
        img = Image.blend(img, glow, alpha=0.55)
        draw = ImageDraw.Draw(img)

        # Draw minimalist frame lines
        draw.rectangle([30, 30, 470, 470], outline=(255, 255, 255, 40), width=2)
        draw.line([50, 400, 450, 400], fill=accent1, width=4)

        # Add Title text
        words = title.upper().split()
        line1 = words[0] if words else "MUSIC"
        line2 = " ".join(words[1:]) if len(words) > 1 else "PLAYLIST"

        try:
            font_title = ImageFont.truetype("arial.ttf", 36)
            font_sub = ImageFont.truetype("arial.ttf", 22)
        except Exception:
            font_title = ImageFont.load_default()
            font_sub = ImageFont.load_default()

        draw.text((60, 310), line1[:16], fill=(255, 255, 255), font=font_title)
        draw.text((60, 355), line2[:20], fill=accent1, font=font_sub)
        draw.text((60, 60), "MUSICMIND AI", fill=(255, 255, 255, 120), font=font_sub)

        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{img_str}"

    def _svg_fallback_b64(self, title: str, style: str) -> str:
        bg, acc1, acc2 = random.choice([
            ("#0B0E14", "#1DB954", "#10B981"),
            ("#0F0C1D", "#8B5CF6", "#C084FC"),
            ("#180F0F", "#F43F5E", "#FB923C")
        ])
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
        <rect width="500" height="500" fill="{bg}"/>
        <circle cx="280" cy="200" r="180" fill="{acc1}" opacity="0.4" filter="blur(40px)"/>
        <circle cx="180" cy="320" r="150" fill="{acc2}" opacity="0.4" filter="blur(40px)"/>
        <rect x="30" y="30" width="440" height="440" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
        <line x1="60" y1="410" x2="440" y2="410" stroke="{acc1}" stroke-width="4"/>
        <text x="60" y="80" fill="#888" font-family="sans-serif" font-size="18" font-weight="bold">MUSICMIND AI</text>
        <text x="60" y="350" fill="#FFF" font-family="sans-serif" font-size="34" font-weight="900">{title[:18]}</text>
        <text x="60" y="390" fill="{acc1}" font-family="sans-serif" font-size="20" font-weight="600">CURATED PLAYLIST</text>
        </svg>"""
        b64 = base64.b64encode(svg.encode('utf-8')).decode('utf-8')
        return f"data:image/svg+xml;base64,{b64}"
