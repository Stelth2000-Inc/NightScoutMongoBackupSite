import { describe, it, expect, vi, beforeEach } from "vitest";
import { render as rtlRender, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/theme-toggle";

const mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: mockSetTheme,
    resolvedTheme: "dark",
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Simple render function without providers since we're mocking them
const render = (ui: React.ReactElement) => rtlRender(ui);

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all theme options", () => {
    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: "Light" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dark" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "System" })).toBeInTheDocument();
  });

  it("highlights the current theme", () => {
    render(<ThemeToggle />);

    const darkButton = screen.getByRole("button", { name: "Dark" });
    expect(darkButton).toHaveClass("bg-slate-100");
  });

  it("calls setTheme when clicking a theme button", async () => {
    const user = userEvent.setup();

    render(<ThemeToggle />);

    const lightButton = screen.getByRole("button", { name: "Light" });
    await user.click(lightButton);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});

