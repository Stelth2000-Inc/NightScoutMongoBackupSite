import { describe, it, expect, vi, beforeEach } from "vitest";
import { render as rtlRender, screen } from "@testing-library/react";
import { Footer } from "@/components/footer";

// Mock package.json - the component imports ../package.json from components/footer.tsx
// From tests/unit/components/, we need to go up to root: ../../../
vi.mock("../../../package.json", () => ({
  default: {
    version: "2.0.7",
  },
}));

// Simple render function
const render = (ui: React.ReactElement) => rtlRender(ui);

describe("Footer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the footer element", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("displays the copyright text with current year", () => {
    const currentYear = new Date().getFullYear();
    render(<Footer />);

    expect(
      screen.getByText(`© ${currentYear} Nightscout Backup Dashboard`)
    ).toBeInTheDocument();
  });

  it("displays the version number", () => {
    render(<Footer />);

    expect(screen.getByText(/v2\.0\.7/)).toBeInTheDocument();
  });

  it("has the correct footer structure", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer.tagName).toBe("FOOTER");
  });

  it("has the correct CSS classes for styling", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass(
      "border-t",
      "bg-white/80",
      "px-4",
      "py-3",
      "backdrop-blur"
    );
  });

  it("has dark mode classes", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("dark:border-slate-800", "dark:bg-slate-950/80");
  });

  it("displays copyright in center and version on right", () => {
    render(<Footer />);

    const copyright = screen.getByText(/© \d{4} Nightscout Backup Dashboard/);
    const version = screen.getByText(/v\d+\.\d+\.\d+/);

    expect(copyright).toBeInTheDocument();
    expect(version).toBeInTheDocument();

    // Check that copyright has center alignment class
    expect(copyright).toHaveClass("text-center");
    // Check that version has right alignment class
    expect(version).toHaveClass("text-right");
  });
});

