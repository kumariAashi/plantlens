from PIL import Image
import os


def compress_image(path: str, max_size: int = 800):
    """Compress and resize an image to reduce upload size."""
    img = Image.open(path)
    img.thumbnail((max_size, max_size), Image.LANCZOS)
    # Convert to RGB if necessary for JPEG
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    img.save(path, "JPEG", quality=85)
