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
            gray = image.convert("L")
            threshold = 200
            mask = gray.point(lambda p: 255 if p < threshold else 0)
            
            ink_rgb = (0, 0, 0) if signature_ink == "black" else (0, 45, 150) # Dark Blue
            
            new_img = Image.new("RGBA", image.size, (255, 255, 255, 0) if bg_color == "transparent" else (255, 255, 255, 255))
            
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

            if image.mode != "RGBA":
                image = image.convert("RGBA")
                
            bg_layer = Image.new("RGBA", image.size, target_bg + (255,))
            for x in range(image.width):
                for y in range(image.height):
                    r, g, b, a = image.getpixel((x, y))
                    # Retain non-background pixels
                    if a < 50 or (r > 220 and g > 220 and b > 220):
                        pass
                    else:
                        bg_layer.putpixel((x, y), (r, g, b, 255))
            image = bg_layer

        # 4. Color Adjustments (Brightness, Contrast, Sharpness, Grayscale)
        if grayscale:
            image = image.convert("L").convert("RGB")
        else:
            if image.mode == "RGBA" and output_format.upper() in ("JPG", "JPEG"):
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
        if target_width and target_height and target_width > 0 and target_height > 0:
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
            low_q, high_q = 5, 98
            best_data = None
            
            while low_q <= high_q:
                mid_q = (low_q + high_q) // 2
                temp_buf = io.BytesIO()
                image.save(temp_buf, format=fmt, quality=mid_q, dpi=dpi_val)
                size_kb = temp_buf.tell() / 1024.0
                
                if size_kb <= target_kb:
                    best_data = temp_buf.getvalue()
                    low_q = mid_q + 1
                else:
                    high_q = mid_q - 1
                    
            if best_data is not None:
                buf = io.BytesIO(best_data)
            else:
                image.save(buf, format=fmt, quality=10, dpi=dpi_val)
        else:
            image.save(buf, format=fmt, quality=90, dpi=dpi_val)

        # 8. Uncorrupted Min KB Padding via valid JPEG COM (Comment) Segment
        if min_kb and min_kb > 0:
            current_bytes = len(buf.getvalue())
            min_target_bytes = int(min_kb * 1024)
            needed_bytes = min_target_bytes - current_bytes
            
            if needed_bytes > 0:
                data = buf.getvalue()
                if fmt == "JPEG":
                    eoi_idx = data.rfind(b'\xff\xd9')
                    if eoi_idx != -1:
                        # Construct valid JPEG COM segment (0xFF 0xFE + length + padding payload)
                        comment_len = needed_bytes
                        if comment_len > 4:
                            length_header = (comment_len).to_bytes(2, byteorder='big')
                            comment_segment = b'\xff\xfe' + length_header + (b'DocReadyPad' * (comment_len // 11 + 1))[:comment_len-2]
                            data = data[:eoi_idx] + comment_segment + data[eoi_idx:]
                            buf = io.BytesIO(data)

        buf.seek(0)
        final_bytes = buf.getvalue()
        media_type = "image/jpeg" if fmt == "JPEG" else f"image/{fmt.lower()}"
        
        return StreamingResponse(io.BytesIO(final_bytes), media_type=media_type, headers={
            "Content-Disposition": f'attachment; filename="docready_processed.{fmt.lower()}"',
            "X-Processed-Width": str(image.width),
            "X-Processed-Height": str(image.height),
            "X-Processed-Size-KB": f"{len(final_bytes) / 1024.0:.2f}"
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
