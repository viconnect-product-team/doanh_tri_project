import { describe, expect, it } from "vitest";
import { parseEventCapacity } from "@/lib/event-capacity";

describe("event capacity", () => {
  it("stores the entered total seats", () => {
    expect(parseEventCapacity("30")).toBe(30);
  });
  it("leaves unspecified capacity empty", () => {
    expect(parseEventCapacity("")).toBeNull();
  });
  it("rejects nonpositive or fractional seat counts", () => {
    for (const value of ["0", "-1", "1.5", "abc"]) expect(() => parseEventCapacity(value)).toThrow();
  });
});