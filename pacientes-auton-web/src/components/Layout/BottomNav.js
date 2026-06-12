import { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { IoHome, IoHeart, IoBook, IoPerson, IoRestaurant, IoFitness, IoLeaf, IoClose } from "react-icons/io5";
import { GiSelfLove } from "react-icons/gi";
import { usePaciente } from "../../hooks/usePaciente";

const LIFESTYLE_ITEMS = [
  { label: "Livro da Vida", path: "/lifestyle/livro-da-vida", icon: GiSelfLove, visKey: "livro_vida" },
  { label: "Alimentação", path: "/lifestyle/alimentacao", icon: IoRestaurant, visKey: "alimentacao" },
  { label: "Exercício", path: "/lifestyle/exercicio-fisico", icon: IoFitness, visKey: "treinamentos" },
  { label: "Suplementos", path: "/lifestyle/suplementos-fitoterapicos", icon: IoLeaf, visKey: "suplementacao" },
];

const ACTIVE = "var(--h2-primary)";
const MUTED = "var(--h2-text-muted)";

export default function BottomNav() {
  const { pathname } = useLocation();
  const history = useHistory();
  const { visibilidade } = usePaciente();
  const [menuOpen, setMenuOpen] = useState(false);

  // Itens de estilo de vida que o médico não ocultou (itens_visiveis).
  const lifestyleItems = LIFESTYLE_ITEMS.filter((c) => visibilidade?.[c.visKey] !== false);

  const lifestyleActive = pathname.startsWith("/lifestyle");

  const handleTabClick = (path, isLifestyle) => {
    if (isLifestyle) {
      setMenuOpen(!menuOpen);
    } else {
      setMenuOpen(false);
      history.push(path);
    }
  };

  const handleSubItemClick = (path) => {
    setMenuOpen(false);
    history.push(path);
  };

  const tabSx = (active) => ({
    display: "flex", flexDirection: "column", alignItems: "center", gap: 0.3,
    cursor: "pointer", flex: 1, py: 1,
    color: active ? ACTIVE : MUTED,
    transition: "color var(--h2-transition-fast)",
  });

  const labelSx = (active) => ({
    fontSize: "0.625rem",
    fontWeight: active ? 600 : 500,
    color: active ? ACTIVE : MUTED,
  });

  return (
    <>
      {/* Lifestyle submenu popup */}
      {menuOpen && (
        <>
          <Box
            onClick={() => setMenuOpen(false)}
            sx={{
              position: "fixed", inset: 0, zIndex: 1299,
              bgcolor: "rgba(31,29,42,0.4)",
              animation: "h2-fade-in 0.2s ease-out",
            }}
          />
          <Box sx={{
            position: "fixed", bottom: 64, left: 0, right: 0, zIndex: 1301,
            bgcolor: "var(--h2-surface)",
            borderTop: "1px solid var(--h2-border)",
            borderRadius: "var(--h2-radius) var(--h2-radius) 0 0",
            boxShadow: "var(--h2-shadow-lg)",
            animation: "h2-fade-slide-up 0.25s var(--h2-ease)",
            p: 2,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "var(--h2-text)" }}>
                Estilo de Vida
              </Typography>
              <Box
                onClick={() => setMenuOpen(false)}
                sx={{
                  width: 32, height: 32, borderRadius: "10px",
                  bgcolor: "var(--h2-bg-tinted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <IoClose size={16} color="var(--h2-text-muted)" />
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {lifestyleItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.path;
                return (
                  <Box
                    key={item.path}
                    onClick={() => handleSubItemClick(item.path)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.5,
                      px: 1.5, py: 1.2, borderRadius: "10px",
                      bgcolor: active ? "rgba(71,101,235,0.10)" : "transparent",
                      cursor: "pointer",
                      transition: "background var(--h2-transition-fast)",
                      "&:active": { bgcolor: "rgba(71,101,235,0.16)" },
                    }}
                  >
                    <Box sx={{
                      width: 36, height: 36, borderRadius: "10px",
                      bgcolor: active ? "var(--h2-primary)" : "var(--h2-bg-tinted)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={16} color={active ? "#fff" : "var(--h2-text-muted)"} />
                    </Box>
                    <Typography sx={{
                      fontSize: 14,
                      fontWeight: active ? 600 : 500,
                      color: active ? "var(--h2-primary)" : "var(--h2-text)",
                    }}>
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </>
      )}

      {/* Bottom bar */}
      <Box
        sx={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1300,
          display: "flex", justifyContent: "space-around", alignItems: "center",
          height: 64,
          bgcolor: "var(--h2-surface)",
          borderTop: "1px solid var(--h2-border)",
          boxShadow: "0 -2px 12px rgba(31,29,42,0.05)",
        }}
      >
        <Box onClick={() => handleTabClick("/dashboard")} sx={tabSx(pathname === "/dashboard")}>
          <IoHome size={20} />
          <Typography sx={labelSx(pathname === "/dashboard")}>Início</Typography>
        </Box>

        {lifestyleItems.length > 0 && (
          <Box onClick={() => handleTabClick(null, true)} sx={tabSx(lifestyleActive || menuOpen)}>
            <IoHeart size={20} />
            <Typography sx={labelSx(lifestyleActive || menuOpen)}>Lifestyle</Typography>
          </Box>
        )}

        <Box onClick={() => handleTabClick("/checkin-diarios")} sx={tabSx(pathname === "/checkin-diarios")}>
          <IoBook size={20} />
          <Typography sx={labelSx(pathname === "/checkin-diarios")}>Check-in</Typography>
        </Box>

        <Box onClick={() => handleTabClick("/perfil")} sx={tabSx(pathname === "/perfil")}>
          <IoPerson size={20} />
          <Typography sx={labelSx(pathname === "/perfil")}>Perfil</Typography>
        </Box>
      </Box>
    </>
  );
}
