import { useState } from "react";
import { Switch, Route, Redirect, useLocation } from "react-router-dom";
import { Box, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { usePaciente } from "./context/PacienteContext";
import Sidebar from "./components/Layout/Sidebar";
import Navbar from "./components/Layout/Navbar";
import BottomNav from "./components/Layout/BottomNav";
import Dashboard from "./pages/Dashboard";
import Alimentacao from "./pages/Alimentacao";
import ExercicioFisico from "./pages/ExercicioFisico";
import CheckinDiarios from "./pages/CheckinDiarios";
import Suplementos from "./pages/Suplementos";
import LivroDaVida from "./pages/LivroDaVida";
import Perfil from "./pages/Perfil";
import SignIn from "./pages/SignIn";

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { paciente, loading } = usePaciente();

  const isAuthPage = location.pathname.startsWith("/authentication");

  if (isAuthPage) {
    return (
      <Switch>
        <Route exact path="/authentication/sign-in" component={SignIn} />
        <Redirect to="/authentication/sign-in" />
      </Switch>
    );
  }

  // Aguardando resolução da sessão / dados do paciente.
  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Sem sessão válida → volta para o login.
  if (!paciente) {
    return <Redirect to="/authentication/sign-in" />;
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Fixed top header */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Floating sidebar — hidden on mobile */}
      {!isMobile && <Sidebar />}

      {/* Main content — offset by topbar + sidebar */}
      <Box
        component="main"
        className="h2-shell-main"
        sx={{
          pt: { xs: "56px", md: "64px" },
          pb: isMobile ? "80px" : 0,
          minHeight: "100vh",
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 2.5, md: 4 }, pb: 4, maxWidth: 1360, mx: "auto" }}>
          <Switch>
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/lifestyle/alimentacao" component={Alimentacao} />
            <Route exact path="/lifestyle/exercicio-fisico" component={ExercicioFisico} />
            <Route exact path="/lifestyle/suplementos-fitoterapicos" component={Suplementos} />
            <Route exact path="/lifestyle/livro-da-vida" component={LivroDaVida} />
            <Route exact path="/checkin-diarios" component={CheckinDiarios} />
            <Route exact path="/perfil" component={Perfil} />
            <Redirect from="/" to="/dashboard" />
            <Redirect from="*" to="/dashboard" />
          </Switch>
        </Box>
      </Box>

      {/* Mobile bottom nav */}
      {isMobile && <BottomNav />}
    </Box>
  );
}
