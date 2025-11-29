import { vi } from "vitest";

// Mock next-auth
export const mockUseSession = vi.fn(() => ({
  data: null,
  status: "unauthenticated",
}));

export const mockSignIn = vi.fn();
export const mockSignOut = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  signIn: mockSignIn,
  signOut: mockSignOut,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next/navigation
export const mockUsePathname = vi.fn(() => "/");
export const mockUseRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => mockUseRouter(),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: vi.fn(),
    resolvedTheme: "dark",
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

