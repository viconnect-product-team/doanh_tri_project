import { describe, expect, it } from "vitest";
import { cmsMediaPath, validateCmsImage } from "./cms-media";
describe("cms media", () => {
  it("accepts images up to 10MB", () => expect(validateCmsImage({ type: "image/png", size: 10 * 1024 * 1024 })).toBe(true));
  it("rejects files over 10MB", () => expect(validateCmsImage({ type: "image/png", size: 10 * 1024 * 1024 + 1 })).toBe(false));
  it("rejects non-images", () => expect(validateCmsImage({ type: "application/pdf", size: 10 })).toBe(false));
  it("builds a path by content type", () => expect(cmsMediaPath("posts", "Ảnh.JPG", "abc")).toBe("posts/abc.jpg"));
});
import { CMS_IMAGE_SIZES, fitWidth } from "./cms-media";
describe("image sizes", () => {
  it("thumbnail is 640px wide", () => expect(fitWidth(3200, 2400, CMS_IMAGE_SIZES.thumb)).toEqual({ width: 640, height: 480 }));
  it("large is 1600px wide", () => expect(fitWidth(4000, 3000, CMS_IMAGE_SIZES.large)).toEqual({ width: 1600, height: 1200 }));
  it("never upscales small photos", () => expect(fitWidth(500, 300, CMS_IMAGE_SIZES.large)).toEqual({ width: 500, height: 300 }));
});
