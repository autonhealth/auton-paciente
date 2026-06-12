import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import theme from "./theme";
import { PacienteProvider } from "./context/PacienteContext";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import "./styles/h2-tokens.css";
import "./styles/h2.css";
import "./globals.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PacienteProvider>
        <App />
      </PacienteProvider>
    </ThemeProvider>
  </BrowserRouter>
);

// PWA — registra o service worker em produção.
// Quando houver update disponível, força o novo SW e recarrega a página.
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    const waiting = registration.waiting;
    if (waiting) {
      waiting.postMessage({ type: "SKIP_WAITING" });
      waiting.addEventListener("statechange", (e) => {
        if (e.target.state === "activated") window.location.reload();
      });
    }
  },
});
