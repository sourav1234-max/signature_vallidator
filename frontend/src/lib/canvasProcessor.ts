/**
 * Client-Side HTML5 Canvas Processing Engine for DocReady AI.
 * Renders all image edits, passport background replacements, signature recoloring,
 * rotations, flips, color adjustments, and dimension scaling in real-time.
 */

export interface ImageProcessingOptions {
  widthPx: number;
  heightPx: number;
  rotateAngle: number;
  flipH: boolean;
  flipV: boolean;
  brightness: number; // 0.5 to 1.5
  contrast: number;   // 0.5 to 1.5
  sharpness: number;  // 0.5 to 1.5
  grayscale: boolean;
  bgColor: string;    // 'none' | 'white' | 'blue' | 'gray' | 'transparent'
  signatureInk: string; // '' | 'black' | 'blue'
  quality: number;    // 0.1 to 1.0
  targetKb: number;   // 0 or target KB
  minKb: number;      // 0 or min KB
  format: string;     // 'JPG' | 'JPEG' | 'PNG' | 'WEBP' | 'PDF'
  dpi: number;
}

export async function processImageOnCanvas(
  sourceImage: HTMLImageElement,
  opts: ImageProcessingOptions
): Promise<{ dataUrl: string; blob: Blob; sizeKb: number; width: number; height: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get 2d canvas context");

  const targetW = opts.widthPx > 0 ? opts.widthPx : sourceImage.naturalWidth;
  const targetH = opts.heightPx > 0 ? opts.heightPx : sourceImage.naturalHeight;

  canvas.width = targetW;
  canvas.height = targetH;

  // 1. Fill Background Color
  if (opts.bgColor && opts.bgColor !== "none" && opts.bgColor !== "transparent") {
    ctx.fillStyle =
      opts.bgColor === "white"
        ? "#FFFFFF"
        : opts.bgColor === "blue"
        ? "#3B82F6"
        : opts.bgColor === "gray"
        ? "#E5E7EB"
        : opts.bgColor;
    ctx.fillRect(0, 0, targetW, targetH);
  } else if (opts.format.toUpperCase() === "JPG" || opts.format.toUpperCase() === "JPEG") {
    // JPEG requires solid white background by default if transparent
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, targetW, targetH);
  }

  // 2. Transformations (Rotate & Flip)
  ctx.save();
  ctx.translate(targetW / 2, targetH / 2);
  
  if (opts.rotateAngle !== 0) {
    ctx.rotate((opts.rotateAngle * Math.PI) / 180);
  }
  ctx.scale(opts.flipH ? -1 : 1, opts.flipV ? -1 : 1);

  // Determine draw bounds
  let drawW = targetW;
  let drawH = targetH;
  if (opts.rotateAngle % 180 !== 0) {
    drawW = targetH;
    drawH = targetW;
  }

  ctx.drawImage(sourceImage, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // 3. Pixel Manipulations (Signature recoloring, Passport Background chroma key, Grayscale)
  const imageData = ctx.getImageData(0, 0, targetW, targetH);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    let a = data[i + 3];

    // A. Signature Ink Recoloring
    if (opts.signatureInk) {
      const avg = (r + g + b) / 3;
      if (avg < 200) {
        // Ink pixel
        if (opts.signatureInk === "black") {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
        } else if (opts.signatureInk === "blue") {
          data[i] = 0;
          data[i + 1] = 45;
          data[i + 2] = 180;
        }
      } else {
        // Background pixel
        if (opts.bgColor === "transparent") {
          data[i + 3] = 0;
        } else {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        }
      }
    }
    // B. Passport Photo Background Chroma Replacement
    else if (opts.bgColor && opts.bgColor !== "none" && opts.bgColor !== "transparent") {
      // If near-white or light background pixel
      if (r > 220 && g > 220 && b > 220) {
        const bgR = opts.bgColor === "white" ? 255 : opts.bgColor === "blue" ? 59 : 229;
        const bgG = opts.bgColor === "white" ? 255 : opts.bgColor === "blue" ? 130 : 231;
        const bgB = opts.bgColor === "white" ? 255 : opts.bgColor === "blue" ? 246 : 235;
        data[i] = bgR;
        data[i + 1] = bgG;
        data[i + 2] = bgB;
      }
    }

    // C. Brightness & Contrast Adjustments
    if (opts.brightness !== 1.0) {
      data[i] = Math.min(255, Math.max(0, data[i] * opts.brightness));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * opts.brightness));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * opts.brightness));
    }

    if (opts.contrast !== 1.0) {
      const factor = (259 * (opts.contrast * 255 + 255)) / (255 * (259 - opts.contrast * 255));
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
    }

    // D. Grayscale
    if (opts.grayscale) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // 4. Export to Blob / DataURL with Exact Target KB Quality Matcher
  let mimeType = "image/jpeg";
  const fmtUpper = opts.format.toUpperCase();
  if (fmtUpper === "PNG") mimeType = "image/png";
  else if (fmtUpper === "WEBP") mimeType = "image/webp";

  let finalQuality = opts.quality / 100;
  if (finalQuality <= 0 || finalQuality > 1) finalQuality = 0.9;

  // Target KB binary search
  let blob: Blob;
  if (opts.targetKb > 0 && mimeType !== "image/png") {
    let low = 0.05;
    let high = 0.98;
    let bestBlob: Blob | null = null;
    for (let step = 0; step < 8; step++) {
      const mid = (low + high) / 2;
      const testBlob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), mimeType, mid)
      );
      if (testBlob.size / 1024 <= opts.targetKb) {
        bestBlob = testBlob;
        low = mid;
      } else {
        high = mid;
      }
    }
    blob = bestBlob || (await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), mimeType, 0.1)));
  } else {
    blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), mimeType, finalQuality)
    );
  }

  // Handle Min KB Inflator (Safe ISO JPEG Comment Marker Insertion)
  if (opts.minKb > 0 && blob.size / 1024 < opts.minKb && mimeType === "image/jpeg") {
    const arrayBuf = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);
    const neededBytes = Math.ceil(opts.minKb * 1024) - bytes.length;
    if (neededBytes > 4) {
      // Find JPEG EOF 0xFF 0xD9
      let eoiIdx = -1;
      for (let j = bytes.length - 2; j >= 0; j--) {
        if (bytes[j] === 0xff && bytes[j + 1] === 0xd9) {
          eoiIdx = j;
          break;
        }
      }
      if (eoiIdx !== -1) {
        const commentHeader = new Uint8Array([0xff, 0xfe, Math.floor((neededBytes) / 256), (neededBytes) % 256]);
        const paddingPayload = new Uint8Array(neededBytes - 4);
        paddingPayload.fill(88); // 'X' ASCII
        
        const newBytes = new Uint8Array(bytes.length + neededBytes);
        newBytes.set(bytes.subarray(0, eoiIdx), 0);
        newBytes.set(commentHeader, eoiIdx);
        newBytes.set(paddingPayload, eoiIdx + 4);
        newBytes.set(bytes.subarray(eoiIdx), eoiIdx + neededBytes);
        
        blob = new Blob([newBytes], { type: mimeType });
      }
    }
  }

  const dataUrl = URL.createObjectURL(blob);
  const sizeKb = blob.size / 1024.0;

  return {
    dataUrl,
    blob,
    sizeKb,
    width: targetW,
    height: targetH,
  };
}
