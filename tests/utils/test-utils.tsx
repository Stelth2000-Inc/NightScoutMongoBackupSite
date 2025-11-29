import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

// Mock NextAuth session
export const mockSession = {
  user: {
    name: "Test User",
    email: "test@example.com",
    image: "https://example.com/avatar.png",
    id: "123456789",
  },
  expires: "2025-12-31",
};

// Custom render function that includes providers
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={mockSession}>{children}</SessionProvider>
    </ThemeProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

