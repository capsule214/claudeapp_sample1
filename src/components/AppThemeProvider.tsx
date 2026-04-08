"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

interface ColorModeCtx {
  mode: "light" | "dark";
  toggle: () => void;
}

export const ColorModeContext = createContext<ColorModeCtx>({
  mode: "light",
  toggle: () => {},
});

export function useColorMode() {
  return useContext(ColorModeContext);
}

export default function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const colorMode = useMemo(
    () => ({ mode, toggle: () => setMode((m) => (m === "light" ? "dark" : "light")) }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: { main: "#3b82f6" },
                background: { default: "#f3f4f6", paper: "#ffffff" },
              }
            : {
                primary: { main: "#60a5fa" },
                background: { default: "#0f172a", paper: "#1e293b" },
              }),
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
