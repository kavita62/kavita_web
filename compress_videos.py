#!/usr/bin/env python3
"""
Video compression script for web optimization.
Uses ffmpeg to compress videos to WebM (VP9) and MP4 (H.264) formats.
"""

import os
import sys
import subprocess
from pathlib import Path

# Supported input formats
VIDEO_EXTENSIONS = {'.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.m4v'}

# Target settings
MAX_WIDTH = 1280
MAX_HEIGHT = 720
CRF = 28  # Constant Rate Factor (lower = better quality, 18-28 is good for web)
PRESET = 'medium'

# Output directories
OUTPUT_DIR = Path("optimized")
VIDEO_DIR = OUTPUT_DIR / "video"

def ensure_dirs():
    """Create output directories."""
    VIDEO_DIR.mkdir(parents=True, exist_ok=True)

def get_video_files(root_dir):
    """Find all video files recursively."""
    root = Path(root_dir)
    files = []
    for ext in VIDEO_EXTENSIONS:
        files.extend(root.rglob(f"*{ext}"))
        files.extend(root.rglob(f"*{ext.upper()}"))
    return files

def check_ffmpeg():
    """Check if ffmpeg is available."""
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def compress_video(input_path, output_webm, output_mp4):
    """Compress a single video file to WebM and MP4."""
    try:
        # Get video info first
        probe_cmd = [
            'ffprobe', '-v', 'error', '-select_streams', 'v:0',
            '-show_entries', 'stream=width,height,duration',
            '-of', 'csv=p=0', str(input_path)
        ]
        result = subprocess.run(probe_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"  Could not probe video: {result.stderr}")
            return False

        # Parse video info
        parts = result.stdout.strip().split(',')
        if len(parts) >= 2:
            width, height = int(parts[0]), int(parts[1])
            print(f"  Original: {width}x{height}")
        else:
            width, height = MAX_WIDTH, MAX_HEIGHT

        # Calculate scale filter
        scale_filter = f"scale='min({MAX_WIDTH},iw)':'min({MAX_HEIGHT},ih)':force_original_aspect_ratio=decrease"

        # Compress to WebM (VP9)
        webm_cmd = [
            'ffmpeg', '-y', '-i', str(input_path),
            '-vf', scale_filter,
            '-c:v', 'libvpx-vp9',
            '-crf', str(CRF),
            '-b:v', '0',
            '-c:a', 'libopus',
            '-b:a', '128k',
            str(output_webm)
        ]

        print(f"  Compressing to WebM...")
        result = subprocess.run(webm_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"  WebM compression failed: {result.stderr[:200]}")
            return False

        # Compress to MP4 (H.264)
        mp4_cmd = [
            'ffmpeg', '-y', '-i', str(input_path),
            '-vf', scale_filter,
            '-c:v', 'libx264',
            '-crf', str(CRF),
            '-preset', PRESET,
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart',
            str(output_mp4)
        ]

        print(f"  Compressing to MP4...")
        result = subprocess.run(mp4_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"  MP4 compression failed: {result.stderr[:200]}")
            return False

        return True

    except Exception as e:
        print(f"  Error processing {input_path}: {e}")
        return False

def process_videos(root_dir="."):
    """Process all videos in the directory."""
    if not check_ffmpeg():
        print("ERROR: ffmpeg not found. Please install ffmpeg to compress videos.")
        print("  Windows: Download from https://ffmpeg.org/download.html")
        print("  Or install via: winget install ffmpeg")
        return {'processed': 0, 'failed': 0, 'original_size': 0, 'compressed_size': 0}

    video_files = get_video_files(root_dir)
    print(f"Found {len(video_files)} video files")

    stats = {
        'processed': 0,
        'failed': 0,
        'original_size': 0,
        'compressed_size': 0,
    }

    for vid_path in video_files:
        # Skip if already in output directory
        if OUTPUT_DIR in vid_path.parents:
            continue

        rel_path = vid_path.relative_to(Path(root_dir))
        print(f"\nProcessing: {rel_path}")

        # Get original size
        original_size = vid_path.stat().st_size
        stats['original_size'] += original_size

        # Create output paths preserving directory structure
        webm_path = VIDEO_DIR / rel_path.with_suffix('.webm')
        mp4_path = VIDEO_DIR / rel_path.with_suffix('.mp4')

        # Ensure parent directories exist
        webm_path.parent.mkdir(parents=True, exist_ok=True)
        mp4_path.parent.mkdir(parents=True, exist_ok=True)

        # Compress
        if compress_video(vid_path, webm_path, mp4_path):
            stats['processed'] += 1
            stats['compressed_size'] += webm_path.stat().st_size if webm_path.exists() else 0
            stats['compressed_size'] += mp4_path.stat().st_size if mp4_path.exists() else 0
        else:
            stats['failed'] += 1

    return stats

def print_stats(stats):
    """Print compression statistics."""
    print("\n" + "="*60)
    print("VIDEO COMPRESSION STATISTICS")
    print("="*60)
    print(f"Videos processed: {stats['processed']}")
    print(f"Videos failed: {stats['failed']}")
    print(f"Original total size: {stats['original_size'] / 1024 / 1024:.2f} MB")
    print(f"Compressed total size: {stats['compressed_size'] / 1024 / 1024:.2f} MB")

    if stats['original_size'] > 0 and stats['compressed_size'] > 0:
        savings = (1 - stats['compressed_size'] / stats['original_size']) * 100
        print(f"Compression savings: {savings:.1f}%")

def main():
    print("Starting video optimization for web...")
    print(f"Max dimensions: {MAX_WIDTH}x{MAX_HEIGHT}")
    print(f"CRF quality: {CRF}")
    print(f"Preset: {PRESET}")

    if not check_ffmpeg():
        print("\nWARNING: ffmpeg not installed. Skipping video compression.")
        print("To enable video compression, install ffmpeg:")
        print("  winget install ffmpeg")
        print("  or download from https://ffmpeg.org/download.html")
        return

    ensure_dirs()
    stats = process_videos(".")
    print_stats(stats)

    if stats['processed'] > 0:
        print(f"\nOptimized videos saved to: {VIDEO_DIR.absolute()}")
        print("  - WebM (VP9): optimized/video/")
        print("  - MP4 (H.264): optimized/video/")

if __name__ == "__main__":
    main()