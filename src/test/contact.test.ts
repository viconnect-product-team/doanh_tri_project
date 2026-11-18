import { describe, expect, it } from "vitest";
import { contactMessageSchema } from "../lib/contact";
const input = { full_name: "Nguyen Van A", email: "test@example.com", department: "training", message: "Tư vấn khóa học" };
describe("contact messages", () => {
  it("accepts a message addressed to a known department", () => {
    expect(contactMessageSchema.parse(input).department).toBe("training");
  });
  it("rejects unknown departments", () => {
    expect(contactMessageSchema.safeParse({ ...input, department: "unknown" }).success).toBe(false);
  });
  it("requires a nonempty message and valid email", () => {
    expect(contactMessageSchema.safeParse({ ...input, message: " " }).success).toBe(false);
    expect(contactMessageSchema.safeParse({ ...input, email: "invalid" }).success).toBe(false);
  });
});