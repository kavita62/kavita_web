#!/usr/bin/env python3
"""
Image compression script for web optimization.
Converts images to WebP and AVIF formats, resizes large images,
and optimizes quality settings for web delivery.
"""

import os
import sys
from pathlib import Path
from PIL import Image
import shutil

# Supported input formats
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp'}
VIDEO_EXTENSIONS = {'.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.m4v'}

# Target max dimensions for web
MAX_WIDTH = 1920
MAX_HEIGHT = 1080

# Quality settings
WEBP_QUALITY = 80
AVIF_QUALITY = 50
JPEG_QUALITY = 80

# Output directories
OUTPUT_DIR = Path("optimized")
WEBP_DIR = OUTPUT_DIR / "webp"
AVIF_DIR = OUTPUT_DIR / "avif"
ORIGINAL_DIR = OUTPUT_DIR / "original"

def ensure_dirs():
    """Create output directories."""
    for d in [WEBP_DIR, AVIF_DIR, ORIGINAL_DIR]:
        d.mkdir(parents=True, exist_ok=True)

def get_image_files(root_dir):
    """Find all image files recursively."""
    root = Path(root_dir)
    files = []
    for ext in IMAGE_EXTENSIONS:
        files.extend(root.rglob(f"*{ext}"))
        files.extend(root.rglob(f"*{ext.upper()}"))
    return files

def get_video_files(root_dir):
    """Find all video files recursively."""
    root = Path(root_dir)
    files = []
    for ext in VIDEO_EXTENSIONS:
        files.extend(root.rglob(f"*{ext}"))
        files.extend(root.rglob(f"*{ext.upper()}"))
    return files

def optimize_image(input_path, output_webp, output_avif, output_original=None):
    """Optimize a single image file."""
    try:
        with Image.open(input_path) as img:
            # Convert to RGB if necessary (for JPEG/WebP compatibility)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create white background for transparency
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # Resize if too large
            if img.width > MAX_WIDTH or img.height > MAX_HEIGHT:
                img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.Resampling.LANCZOS)
                print(f"  Resized: {img.width}x{img.height}")

            # Save original copy
            if output_original:
                img.save(output_original, quality=95, optimize=True)

            # Save WebP
            img.save(output_webp, 'WEBP', quality=WEBP_QUALITY, method=6, optimize=True)

            # Save AVIF (if supported)
            try:
                img.save(output_avif, 'AVIF', quality=AVIF_QUALITY, optimize=True)
            except Exception as e:
                print(f"  AVIF not supported, skipping: {e}")
                output_avif.unlink(missing_ok=True)

            return True
    except Exception as e:
        print(f"  Error processing {input_path}: {e}")
        return False

def process_images(root_dir="."):
    """Process all images in the directory."""
    image_files = get_image_files(root_dir)
    print(f"Found {len(image_files)} image files")

    stats = {
        'processed': 0,
        'failed': 0,
        'original_size': 0,
        'webp_size': 0,
        'avif_size': 0,
    }

    for img_path in image_files:
        # Skip if already in output directory
        if OUTPUT_DIR in img_path.parents:
            continue

        rel_path = img_path.relative_to(Path(root_dir))
        print(f"\nProcessing: {rel_path}")

        # Get original size
        original_size = img_path.stat().st_size
        stats['original_size'] += original_size

        # Create output paths preserving directory structure
        webp_path = WEBP_DIR / rel_path.with_suffix('.webp')
        avif_path = AVIF_DIR / rel_path.with_suffix('.avif')
        original_path = ORIGINAL_DIR / rel_path

        # Ensure parent directories exist
        webp_path.parent.mkdir(parents=True, exist_ok=True)
        avif_path.parent.mkdir(parents=True, exist_ok=True)
        original_path.parent.mkdir(parents=True, exist_ok=True)

        # Optimize
        if optimize_image(img_path, webp_path, avif_path, original_path):
            stats['processed'] += 1
            stats['webp_size'] += webp_path.stat().st_size if webp_path.exists() else 0
            stats['avif_size'] += avif_path.stat().st_size if avif_path.exists() else 0
        else:
            stats['failed'] += 1

    return stats

def print_stats(stats):
    """Print compression statistics."""
    print("\n" + "="*60)
    print("COMPRESSION STATISTICS")
    print("="*60)
    print(f"Images processed: {stats['processed']}")
    print(f"Images failed: {stats['failed']}")
    print(f"Original total size: {stats['original_size'] / 1024 / 1024:.2f} MB")
    print(f"WebP total size: {stats['webp_size'] / 1024 / 1024:.2f} MB")
    print(f"AVIF total size: {stats['avif_size'] / 1024 / 1024:.2f} MB")

    if stats['original_size'] > 0:
        webp_savings = (1 - stats['webp_size'] / stats['original_size']) * 100
        avif_savings = (1 - stats['avif_size'] / stats['original_size']) * 100
        print(f"WebP savings: {webp_savings:.1f}%")
        print(f"AVIF savings: {avif_savings:.1f}%")

def main():
    print("Starting image optimization for web...")
    print(f"Max dimensions: {MAX_WIDTH}x{MAX_HEIGHT}")
    print(f"WebP quality: {WEBP_QUALITY}")
    print(f"AVIF quality: {AVIF_QUALITY}")

    ensure_dirs()
    stats = process_images(".")
    print_stats(stats)

    print(f"\nOptimized images saved to: {OUTPUT_DIR.absolute()}")
    print("  - WebP: optimized/webp/")
    print("  - AVIF: optimized/avif/")
    print("  - Original copies: optimized/original/")

if __name__ == "__main__":
    main()