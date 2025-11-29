import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render as rtlRender, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "@/app/page";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockUseSession = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Simple render function without providers since we're mocking them
const render = (ui: React.ReactElement) => rtlRender(ui);

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "Test User",
          email: "test@example.com",
          image: "https://example.com/avatar.png",
        },
      },
      status: "authenticated",
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the dashboard title", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ files: [] }),
    } as Response);

    render(<DashboardPage />);

    expect(screen.getByText("Nightscout Backup Dashboard")).toBeInTheDocument();
  });

  it("displays empty state when no backups exist", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ files: [] }),
    } as Response);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/no backups found yet/i)).toBeInTheDocument();
    });
  });

  it("displays backup files in table", async () => {
    const mockFiles = [
      {
        key: "backups/dexcom_20250101.tar.gz",
        lastModified: "2025-01-01T00:00:00Z",
        size: 1048576, // 1MB
      },
      {
        key: "backups/dexcom_20250102.tar.gz",
        lastModified: "2025-01-02T00:00:00Z",
        size: 2097152, // 2MB
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ files: mockFiles }),
    } as Response);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("dexcom_20250101.tar.gz")).toBeInTheDocument();
      expect(screen.getByText("dexcom_20250102.tar.gz")).toBeInTheDocument();
    });
  });

  it("shows error message when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it("creates backup when button is clicked", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ files: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Backup triggered." }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ files: [] }),
      } as Response);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/create backup/i)).toBeInTheDocument();
    });

    const createButton = screen.getByText(/create backup/i);
    const user = userEvent.setup();
    await user.click(createButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/backups/create", {
        method: "POST",
      });
    });
  });
});

