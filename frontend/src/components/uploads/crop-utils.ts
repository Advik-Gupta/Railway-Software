import type { Area } from "react-easy-crop";

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

function getRadianAngle(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function rotatedSize(width: number, height: number, rotation: number) {
  const rad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  const rotRad = getRadianAngle(rotation);
  const { width: boxWidth, height: boxHeight } = rotatedSize(
    image.width,
    image.height,
    rotation,
  );

  canvas.width = boxWidth;
  canvas.height = boxHeight;

  ctx.translate(boxWidth / 2, boxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(0, 0, boxWidth, boxHeight);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(-pixelCrop.x - (boxWidth - image.width) / 2),
    Math.round(-pixelCrop.y - (boxHeight - image.height) / 2),
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Failed to produce cropped image"));
      else resolve(blob);
    }, "image/jpeg");
  });
}
