import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

// Mock next-auth/jwt
vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

describe("proxy middleware", () => {
  const mockGetToken = vi.fn();
  
  beforeEach(async () => {
    vi.clearAllMocks();
    const jwt = await import("next-auth/jwt");
    vi.mocked(jwt.getToken).mockImplementation(mockGetToken);
    delete process.env.PLAYWRIGHT_TEST;
  });

  describe("test mode bypass", () => {
    it("bypasses authentication in test mode", async () => {
      process.env.PLAYWRIGHT_TEST = "true";
      const request = new NextRequest("http://localhost/api/backups/create", {
        method: "POST",
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(mockGetToken).not.toHaveBeenCalled();
    });
  });

  describe("API route protection", () => {
    it("allows POST to /api/backups/create when authenticated", async () => {
      mockGetToken.mockResolvedValue({ sub: "user123" });
      const request = new NextRequest("http://localhost/api/backups/create", {
        method: "POST",
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(mockGetToken).toHaveBeenCalled();
    });

    it("allows DELETE to /api/backups/delete when authenticated", async () => {
      mockGetToken.mockResolvedValue({ sub: "user123" });
      const request = new NextRequest("http://localhost/api/backups/delete?key=test", {
        method: "DELETE",
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it("allows GET to /api/backups/download when authenticated", async () => {
      mockGetToken.mockResolvedValue({ sub: "user123" });
      const request = new NextRequest("http://localhost/api/backups/download?key=test", {
        method: "GET",
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it("allows GET to /api/backups/list when authenticated", async () => {
      mockGetToken.mockResolvedValue({ sub: "user123" });
      const request = new NextRequest("http://localhost/api/backups/list", {
        method: "GET",
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it("allows GET to /api/pm2/status when authenticated", async () => {
      mockGetToken.mockResolvedValue({ sub: "user123" });
      const request = new NextRequest("http://localhost/api/pm2/status", {
        method: "GET",
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it("returns 401 when not authenticated for API routes", async () => {
      mockGetToken.mockResolvedValue(null);
      const request = new NextRequest("http://localhost/api/backups/create", {
        method: "POST",
      });

      const response = await proxy(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("allows auth routes without authentication", async () => {
      mockGetToken.mockResolvedValue(null);
      const request = new NextRequest("http://localhost/api/auth/signin", {
        method: "GET",
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(mockGetToken).not.toHaveBeenCalled();
    });
  });

  describe("method validation", () => {
    it("returns 405 for wrong method on /api/backups/create", async () => {
      const request = new NextRequest("http://localhost/api/backups/create", {
        method: "GET",
      });

      const response = await proxy(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toContain("Method Not Allowed");
      expect(data.error).toContain("POST");
      expect(response.headers.get("Allow")).toBe("POST");
    });

    it("returns 405 for wrong method on /api/backups/delete", async () => {
      const request = new NextRequest("http://localhost/api/backups/delete", {
        method: "POST",
      });

      const response = await proxy(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toContain("DELETE");
    });

    it("returns 405 for wrong method on /api/backups/download", async () => {
      const request = new NextRequest("http://localhost/api/backups/download", {
        method: "POST",
      });

      const response = await proxy(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toContain("GET");
    });

    it("returns 405 for wrong method on /api/backups/list", async () => {
      const request = new NextRequest("http://localhost/api/backups/list", {
        method: "POST",
      });

      const response = await proxy(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toContain("GET");
    });

    it("returns 405 for wrong method on /api/pm2/status", async () => {
      const request = new NextRequest("http://localhost/api/pm2/status", {
        method: "POST",
      });

      const response = await proxy(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toContain("GET");
    });
  });

  describe("non-API route protection", () => {
    it("redirects to sign-in when not authenticated for root path", async () => {
      mockGetToken.mockResolvedValue(null);
      const request = new NextRequest("http://localhost/");

      const response = await proxy(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/auth/signin");
      expect(location).toContain("callbackUrl");
    });

    it("allows access to /auth/signin without authentication", async () => {
      mockGetToken.mockResolvedValue(null);
      const request = new NextRequest("http://localhost/auth/signin");

      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it("allows access to /_next/static without authentication", async () => {
      mockGetToken.mockResolvedValue(null);
      const request = new NextRequest("http://localhost/_next/static/test.js");

      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it("allows access to /images/ without authentication", async () => {
      mockGetToken.mockResolvedValue(null);
      const request = new NextRequest("http://localhost/images/logo.png");

      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it("allows access to /favicon.ico without authentication", async () => {
      mockGetToken.mockResolvedValue(null);
      const request = new NextRequest("http://localhost/favicon.ico");

      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it("allows access to /robots.txt without authentication", async () => {
      mockGetToken.mockResolvedValue(null);
      const request = new NextRequest("http://localhost/robots.txt");

      const response = await proxy(request);

      expect(response.status).toBe(200);
    });

    it("allows authenticated access to non-API routes", async () => {
      mockGetToken.mockResolvedValue({ sub: "user123" });
      const request = new NextRequest("http://localhost/dashboard");

      const response = await proxy(request);

      expect(response.status).toBe(200);
    });
  });
});
