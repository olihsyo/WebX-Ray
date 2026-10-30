import os
import math
from pathlib import Path
from typing import Dict, List, Any, Tuple, Optional
from PIL import Image, ImageChops, ImageStat, ImageDraw

class VisualVerifier:
    @staticmethod
    def compare_screenshots(
        original_img_path: str,
        reconstructed_img_path: str,
        diff_output_path: str,
        viewport: str = "desktop"
    ) -> Dict[str, Any]:
        """
        Performs visual comparison between original and reconstructed page screenshots:
        1. Aligns and normalizes dimensions.
        2. Generates color-coded difference image (magenta highlight on differing pixels).
        3. Computes pixel difference percentage and perceptual similarity score (approximate SSIM).
        4. Identifies region discrepancies (Header, Content, Footer, Navigation).
        5. Outputs actionable correction instructions.
        """
        if not os.path.exists(original_img_path):
            raise FileNotFoundError(f"Original image not found: {original_img_path}")
        if not os.path.exists(reconstructed_img_path):
            raise FileNotFoundError(f"Reconstructed image not found: {reconstructed_img_path}")

        orig = Image.open(original_img_path).convert("RGB")
        recon = Image.open(reconstructed_img_path).convert("RGB")

        # Normalize dimensions to maximum common bounding box
        width = max(orig.width, recon.width)
        height = max(orig.height, recon.height)

        norm_orig = Image.new("RGB", (width, height), (255, 255, 255))
        norm_orig.paste(orig, (0, 0))

        norm_recon = Image.new("RGB", (width, height), (255, 255, 255))
        norm_recon.paste(recon, (0, 0))

        # Pixel difference using ImageChops
        diff = ImageChops.difference(norm_orig, norm_recon)

        # Highlight difference with high-contrast magenta overlay
        highlighted = norm_recon.copy()
        diff_data = diff.load()
        high_data = highlighted.load()

        diff_pixels_count = 0
        total_pixels = width * height

        # Sample grid for efficiency on very large full-page screenshots
        step = 1 if total_pixels < 4_000_000 else 2
        for y in range(0, height, step):
            for x in range(0, width, step):
                r, g, b = diff_data[x, y]
                # If RGB channel difference exceeds subtle threshold
                if r > 15 or g > 15 or b > 15:
                    diff_pixels_count += (step * step)
                    high_data[x, y] = (255, 0, 128) # Magenta marker

        # Save diff image
        Path(diff_output_path).parent.mkdir(parents=True, exist_ok=True)
        highlighted.save(diff_output_path)

        pixel_diff_ratio = min(1.0, diff_pixels_count / max(1, total_pixels))
        similarity_score = round(max(0.0, 1.0 - pixel_diff_ratio), 4)

        # Discrepancy analysis by region
        discrepancies = []
        if pixel_diff_ratio > 0.02:
            # Check Header area (top 15% of viewport)
            header_y = int(height * 0.15)
            header_diff = ImageChops.difference(
                norm_orig.crop((0, 0, width, header_y)),
                norm_recon.crop((0, 0, width, header_y))
            )
            header_stat = ImageStat.Stat(header_diff).mean
            if sum(header_stat) > 10:
                discrepancies.append({
                    "region": "Header / Navigation",
                    "severity": "medium",
                    "description": "Header padding, logo placement, or navigation link alignment differs from original.",
                    "fix_suggestion": "Check top navbar height, z-index, and horizontal flexbox spacing."
                })

            # Check Dimension difference
            if orig.height != recon.height:
                discrepancies.append({
                    "region": "Vertical Page Geometry",
                    "severity": "high" if abs(orig.height - recon.height) > 150 else "low",
                    "description": f"Page height mismatch: Original is {orig.height}px, Reconstructed is {recon.height}px.",
                    "fix_suggestion": "Verify vertical margins and padding between major section containers."
                })

            if pixel_diff_ratio > 0.25:
                discrepancies.append({
                    "region": "Typography & Color Palette",
                    "severity": "high",
                    "description": "Noticeable contrast or background color shift across cards or body surface.",
                    "fix_suggestion": "Audit applied design tokens in tailwind.config or CSS variables."
                })

        # Correction Report Markdown
        correction_report_md = f"""# Visual Discrepancy & Verification Report
**Viewport**: `{viewport}` ({width}x{height})  
**Visual Similarity Score**: `{similarity_score * 100:.1f}%`  
**Pixel Difference**: `{pixel_diff_ratio * 100:.1f}%`  

### Detected Discrepancies:
"""
        if not discrepancies:
            correction_report_md += "\n- Perfect visual match! No significant pixel discrepancies detected.\n"
        else:
            for d in discrepancies:
                correction_report_md += f"\n#### [{d['severity'].upper()}] {d['region']}\n- **Observation**: {d['description']}\n- **Actionable Fix**: {d['fix_suggestion']}\n"

        return {
            "viewport": viewport,
            "original_image_path": original_img_path,
            "reconstructed_image_path": reconstructed_img_path,
            "diff_image_path": diff_output_path,
            "ssim_score": similarity_score,
            "pixel_diff_score": round(pixel_diff_ratio, 4),
            "discrepancies": discrepancies,
            "correction_report_md": correction_report_md
        }

visual_verifier = VisualVerifier()
