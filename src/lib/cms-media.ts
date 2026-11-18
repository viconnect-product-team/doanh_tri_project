export const CMS_MEDIA_BUCKET = "cms-media";
export const CMS_MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const CMS_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"];
/** Ten-year signed link so private-bucket photos render on the public site. */
export const CMS_MEDIA_LINK_SECONDS = 60 * 60 * 24 * 365 * 10;

export function validateCmsImage(file: { type: string; size: number }) {
  return CMS_MEDIA_TYPES.includes(file.type) && file.size > 0 && file.size <= CMS_MEDIA_MAX_BYTES;
}

export function cmsMediaPath(kind: string, fileName: string, id: string) {
  const ext = (fileName.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  return `${kind}/${id}.${ext}`;
}

/** Large photo for detail views; thumbnail for lists and phones. */
export const CMS_IMAGE_SIZES = { large: 1600, thumb: 640 } as const;

/** Scale to fit maxWidth, never upscaling. */
export function fitWidth(width: number, height: number, maxWidth: number) {
  if (width <= maxWidth) return { width, height };
  return { width: maxWidth, height: Math.round((height * maxWidth) / width) };
}
