// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ set: mockCookieSet })),
}));

beforeEach(() => {
  mockCookieSet.mockClear();
});

async function callCreateSession() {
  const { createSession } = await import("../auth");
  await createSession("user-123", "test@example.com");
  return mockCookieSet.mock.calls[0];
}

test("createSession sets cookie with name auth-token", async () => {
  const [name] = await callCreateSession();
  expect(name).toBe("auth-token");
});

test("createSession sets httpOnly: true", async () => {
  const [, , options] = await callCreateSession();
  expect(options.httpOnly).toBe(true);
});

test("createSession sets sameSite: lax", async () => {
  const [, , options] = await callCreateSession();
  expect(options.sameSite).toBe("lax");
});

test("createSession sets secure: false in non-production", async () => {
  const [, , options] = await callCreateSession();
  expect(options.secure).toBe(false);
});

test("createSession sets expiry ~7 days from now", async () => {
  const before = Date.now();
  const [, , options] = await callCreateSession();
  const after = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const expiryMs = options.expires.getTime();
  expect(expiryMs).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expiryMs).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("createSession token is a valid JWT with userId and email", async () => {
  const [, token] = await callCreateSession();
  const secret = new TextEncoder().encode("development-secret-key");
  const { payload } = await jwtVerify(token, secret);
  expect(payload.userId).toBe("user-123");
  expect(payload.email).toBe("test@example.com");
});