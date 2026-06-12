import { createTheme } from "@mui/material/styles";

/**
 * MUI theme alinhado aos tokens h2 (src/styles/h2-tokens.css).
 * Mantém compat com codebase legado (palette.categories, MUI Card hover).
 */
const theme = createTheme({
  palette: {
    primary: { main: "#1e3a5f", light: "#2d4a6f", dark: "#15304f", contrastText: "#ffffff" },
    secondary: { main: "#4765eb", light: "#8d9eeb", dark: "#3550c4" },
    success: { main: "#10b981", light: "rgba(16,185,129,0.10)" },
    error: { main: "#ef4444", light: "rgba(239,68,68,0.10)" },
    warning: { main: "#f59e0b", light: "rgba(245,158,11,0.10)" },
    info: { main: "#4765eb", light: "rgba(71,101,235,0.10)" },
    background: { default: "#fafafa", paper: "#ffffff" },
    text: { primary: "#1f1d2a", secondary: "#5b5875", disabled: "#7a788f" },
    divider: "rgba(31,29,42,0.10)",
    accent: { main: "#ff6418", light: "rgba(255,100,24,0.10)" },
    categories: {
      sleep: { main: "#1e3a5f", light: "rgba(30,58,95,0.10)" },
      exercise: { main: "#10b981", light: "rgba(16,185,129,0.10)" },
      nutrition: { main: "#f59e0b", light: "rgba(245,158,11,0.10)" },
      supplements: { main: "#9770F5", light: "rgba(151,112,245,0.10)" },
      mental: { main: "#21E6D6", light: "rgba(33,230,214,0.10)" },
      hydration: { main: "#4FA2FF", light: "rgba(79,162,255,0.10)" },
    },
  },
  typography: {
    fontFamily: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontWeightSemiBold: 600,
    h1: { fontSize: "2.125rem", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.015em" },
    h3: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.35 },
    h5: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.5 },
    caption: { fontSize: "0.75rem", lineHeight: 1.4, color: "#7a788f" },
    button: { fontSize: "0.875rem", fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 16 },
  shadows: [
    "none",
    "0 1px 2px rgba(31,29,42,0.04)",
    "0 1px 3px rgba(31,29,42,0.04), 0 1px 2px rgba(31,29,42,0.04)",
    "0 1px 2px rgba(31,29,42,0.04), 0 1px 3px rgba(31,29,42,0.04)",
    "0 4px 16px rgba(31,29,42,0.06), 0 1px 2px rgba(31,29,42,0.04)",
    "0 12px 32px rgba(31,29,42,0.10), 0 4px 8px rgba(31,29,42,0.04)",
    ...Array(19).fill("0 4px 16px rgba(31,29,42,0.06), 0 1px 2px rgba(31,29,42,0.04)"),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: "#fafafa", color: "#1f1d2a" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "#ffffff",
          border: "1px solid rgba(31,29,42,0.10)",
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(31,29,42,0.04), 0 1px 3px rgba(31,29,42,0.04)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s cubic-bezier(0.4,0,0.2,1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 16px rgba(31,29,42,0.06), 0 1px 2px rgba(31,29,42,0.04)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 24px",
          transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
        },
        containedPrimary: {
          background: "#1e3a5f",
          "&:hover": { background: "#2d4a6f" },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#ffffff",
            borderRadius: 10,
            "& fieldset": { borderColor: "rgba(31,29,42,0.10)" },
            "&:hover fieldset": { borderColor: "rgba(31,29,42,0.18)" },
            "&.Mui-focused fieldset": { borderColor: "#1e3a5f" },
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { height: 6 },
        thumb: {
          width: 20, height: 20,
          backgroundColor: "#fff",
          border: "2px solid currentColor",
          "&:hover": { boxShadow: "0 0 0 6px rgba(30,58,95,0.15)" },
        },
        track: { borderRadius: 3 },
        rail: { backgroundColor: "rgba(31,29,42,0.10)", opacity: 1 },
      },
    },
  },
});

export default theme;
