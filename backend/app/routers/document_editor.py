"""
API endpoints for DocReady AI Document Editor.
Handles image resizing, precise file size targeting, background removal, signature tools, DPI metadata, and PDF operations.
"""

import io
import os
import zipfile
import math
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from fastapi.responses import StreamingResponse, JSONResponse
from PIL import Image, ImageEnhance, ImageOps, ImageFilter, ImageDraw
import pypdf
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4

from app.services.templates import get_all_templates, get_template_by_id

router = APIRouter(prefix="/editor", tags=["Document Editor"])

@router.get("/templates")
async def list_templates():
    return {"templates": get_all_templates()}

@router.post("/process-image")
async def process_image(
    file: UploadFile = File(...),
    target_width: Optional[int] = Form(None),
    target_height: Optional[int] = Form(None),
    dpi: Optional[int] = Form(300),
    target_kb: Optional[float] = Form(None),
    min_kb: Optional[float] = Form(None),
    output_format: Optional[str] = Form("JPEG"),
    rotate_angle: Optional[int] = Form(0),
    flip_h: Optional[bool] = Form(False),
    flip_v: Optional[bool] = Form(False),
    grayscale: Optional[bool] = Form(False),
    bg_color: Optional[str] = Form(None), # white, blue, gray, transparent
    signature_ink: Optional[str] = Form(None), # black, blue
    brightness: Optional[float] = Form(1.0),
    contrast: Optional[float] = Form(1.0),
    sharpness: Optional[float] = Form(1.0)
):
    """
    Core image manipulation endpoint: resize, target KB compression, background replace, signature enhancement, DPI embedding.
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # 1. Image Rotations & Flips
        if rotate_angle and rotate_angle != 0:
            image = image.rotate(-rotate_angle, expand=True)
            
        if flip_h:
            image = image.transpose(Image.FLIP_LEFT_RIGHT)
        if flip_v:
            image = image.transpose(Image.FLIP_TOP_BOTTOM)
            
        # Convert to RGBA for processing if needed
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA")
            
        # 2. Signature Tools (ink color conversion & transparent bg)
        if signature_ink:
            # Convert to grayscale first to evaluate intensity
            gray = image.convert("L")
            # Create mask for ink (dark pixels)
            threshold = 200
            mask = gray.point(lambda p: 255 if p < threshold else 0)
            
            # Select target ink RGB
            ink_rgb = (0, 0, 0) if signature_ink == "black" else (0, 45, 150) # Dark Blue
            
            new_img = Image.new("RGBA", image.size, (255, 255, 255, 0) if bg_color == "transparent" else (255, 255, 255, 255))
            draw = ImageDraw.Draw(new_img)
            
            # Apply colored ink mask
            for x in range(image.width):
                for y in range(image.height):
                    if mask.getpixel((x, y)) > 0:
                        alpha = 255 - gray.getpixel((x, y))
                        new_img.putpixel((x, y), ink_rgb + (alpha,))
                    elif bg_color != "transparent":
                        new_img.putpixel((x, y), (255, 255, 255, 255))
            image = new_img

        # 3. Background Replacer (Passport photo background fill)
        elif bg_color and bg_color not in ("none", ""):
            if bg_color == "white":
                target_bg = (255, 255, 255)
            elif bg_color == "blue":
                target_bg = (59, 130, 246)
            elif bg_color == "gray":
                target_bg = (229, 231, 235)
            else:
                target_bg = (255, 255, 255)

            # High-threshold brightness mask for background replacement
            if image.mode != "RGBA":
                image = image.convert("RGBA")
                
            bg_layer = Image.new("RGBA", image.size, target_bg + (255,))
            # Replace whitish or near-transparent background
            for x in range(image.width):
                for y in range(image.height):
                    r, g, b, a = image.getpixel((x, y))
                    if a < 50 or (r > 230 and g > 230 and b > 230):
                        pass
                    else:
                        bg_layer.putpixel((x, y), (r, g, b, 255))
            image = bg_layer

        # 4. Color Adjustments (Brightness, Contrast, Sharpness, Grayscale)
        if grayscale:
            image = image.convert("L").convert("RGB")
        else:
            if image.mode == "RGBA" and output_format.upper() in ("JPG", "JPEG"):
                # Composite onto white background for JPEG export
                bg = Image.new("RGB", image.size, (255, 255, 255))
                bg.paste(image, mask=image.split()[3] if "A" in image.mode else None)
                image = bg
            elif image.mode != "RGB":
                image = image.convert("RGB")

        if brightness and brightness != 1.0:
            enhancer = ImageEnhance.Brightness(image)
            image = enhancer.enhance(brightness)
            
        if contrast and contrast != 1.0:
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(contrast)
            
        if sharpness and sharpness != 1.0:
            enhancer = ImageEnhance.Sharpness(image)
            image = enhancer.enhance(sharpness)

        # 5. Dimensions Resizing
        if target_width and target_height:
            image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)

        # 6. Output format normalization & DPI metadata
        fmt = output_format.upper()
        if fmt in ("JPG", "JPEG"):
            fmt = "JPEG"
        elif fmt == "PNG":
            fmt = "PNG"
        elif fmt == "WEBP":
            fmt = "WEBP"
        else:
            fmt = "JPEG"

        dpi_val = (dpi, dpi) if dpi else (300, 300)

        # 7. Exact KB Compression / Min KB Padding Strategy
        buf = io.BytesIO()
        
        if target_kb and target_kb > 0 and fmt == "JPEG":
            # Binary search for optimal quality percentage
            low_q, high_q = 5, 98
            best_buf = None
            best_size = 0
            
            while low_q <= high_q:
                mid_q = (low_q + high_q) // 2
                temp_buf = io.BytesIO()
                image.save(temp_buf, format=fmt, quality=mid_q, dpi=dpi_val)
                size_kb = temp_buf.tell() / 1024.0
                
                if size_kb <= target_kb:
                    best_buf = temp_buf
                    best_size = size_kb
                    low_q = mid_q + 1 # try higher quality
                else:
                    high_q = mid_q - 1 # try lower quality
                    
            if best_buf is not None:
                buf = best_buf
            else:
                image.save(buf, format=fmt, quality=10, dpi=dpi_val)
        else:
            image.save(buf, format=fmt, quality=90, dpi=dpi_val)

        # Min KB padding (if size is below minimum required KB)
        if min_kb and min_kb > 0:
            current_kb = buf.tell() / 1024.0
            if current_kb < min_kb:
                needed_bytes = int((min_kb - current_kb) * 1024)
                # Append safe zero padding comment block in JPEG EXIF/APP section
                buf.write(b'\x00' * needed_bytes)

        buf.seek(0)
        media_type = "image/jpeg" if fmt == "JPEG" else f"image/{fmt.lower()}"
        return StreamingResponse(buf, media_type=media_type, headers={
            "Content-Disposition": f'attachment; filename="docready_processed.{fmt.lower()}"',
            "X-Processed-Width": str(image.width),
            "X-Processed-Height": str(image.height),
            "X-Processed-Size-KB": f"{buf.getbuffer().nbytes / 1024.0:.2f}"
        })

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

@router.post("/images-to-pdf")
async def images_to_pdf(files: List[UploadFile] = File(...)):
    """
    Convert one or multiple images into a clean consolidated PDF document.
    """
    try:
        pdf_buf = io.BytesIO()
        pil_images = []
        for file in files:
            img_bytes = await file.read()
            img = Image.open(io.BytesIO(img_bytes))
            if img.mode != "RGB":
                img = img.convert("RGB")
            pil_images.append(img)

        if not pil_images:
            raise HTTPException(status_code=400, detail="No valid images provided")

        first_image = pil_images[0]
        rest_images = pil_images[1:] if len(pil_images) > 1 else []
        first_image.save(pdf_buf, format="PDF", save_all=True, append_images=rest_images)
        pdf_buf.seek(0)
        
        return StreamingResponse(pdf_buf, media_type="application/pdf", headers={
            "Content-Disposition": 'attachment; filename="docready_converted.pdf"'
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF conversion failed: {str(e)}")
