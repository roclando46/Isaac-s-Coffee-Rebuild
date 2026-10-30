import { beforeAll, describe, expect, it } from "vitest";
import { makeToken, readToken } from "@/lib/tokens";

beforeAll(() => {
  process.env.APP_SECRET = "x".repeat(40);
});

describe("tokens", () => {
  it("round-trips", () => {
    expect(readToken("unsub", makeToken("unsub", "a@b.co", 30))).toBe("a@b.co");
  });
  it("rejects the wrong purpose, tampering and expiry", () => {
    const t = makeToken("unsub", "a@b.co", 30);
    expect(readToken("admin", t)).toBeNull();
    expect(readToken("unsub", t.slice(0, -2) + "zz")).toBeNull();
    expect(readToken("unsub", makeToken("unsub", "a@b.co", -1))).toBeNull();
    expect(readToken("unsub", "junk")).toBeNull();
  });
});
