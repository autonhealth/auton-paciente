import React, { useEffect, useState } from "react";
import { Box, Typography, Chip, Card, Grid, CircularProgress } from "@mui/material";
import { IoWarning, IoTime, IoCalendar, IoMedkit, IoLeaf, IoFlower, IoWater } from "react-icons/io5";
import { GiMedicines, GiHerbsBundle } from "react-icons/gi";
import { usePaciente } from "../hooks/usePaciente";
import { buscarSuplementacao } from "../lib/suplementacao";

const FILTROS = ["Todos", "Suplemento", "Fitoterápico", "Homeopatia", "Floral de Bach"];

const CAT_CONFIG = {
  "Suplemento":     { color: "#1B4266", bg: "#E8F0F6", icon: GiMedicines },
  "Fitoterápico":   { color: "#10B981", bg: "#ECFDF5", icon: GiHerbsBundle },
  "Homeopatia":     { color: "#9770F5", bg: "#F3EEFF", icon: IoWater },
  "Floral de Bach": { color: "#F59E0B", bg: "#FFFBEB", icon: IoFlower },
};

function SupplementCard({ item }) {
  const cfg = CAT_CONFIG[item.tipo] || CAT_CONFIG["Suplemento"];
  const Icon = cfg.icon;

  return (
    <Card sx={{
      border: "1px solid #C4D9E5", borderRadius: "16px", overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)", height: "100%",
      display: "flex", flexDirection: "column",
      transition: "transform 0.25s ease, box-shadow 0.25s ease",
      "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(27,66,102,0.1)" },
    }}>
      {/* Colored top bar */}
      <Box sx={{ height: 4, bgcolor: cfg.color }} />

      <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header: icon + name + badge */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: "12px", bgcolor: cfg.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, color: cfg.color,
          }}>
            <Icon size={22} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", mb: 0.3, wordBreak: "break-word" }}>
              {item.nome}
            </Typography>
            <Chip label={item.tipo} size="small" sx={{
              height: 20, fontSize: 10, fontWeight: 600,
              bgcolor: cfg.bg, color: cfg.color, mt: 0.3,
            }} />
          </Box>
        </Box>

        {/* Objetivo */}
        {item.objetivo && (
          <Typography sx={{ fontSize: 13, color: "#5B5B5B", mb: 2, lineHeight: 1.5 }}>
            {item.objetivo}
          </Typography>
        )}

        {/* Info pills */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2, mt: "auto" }}>
          {item.dosagem && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IoMedkit size={14} color="#7A7A7A" />
              <Typography sx={{ fontSize: 13, color: "#1A1A1A", fontWeight: 600 }}>
                {item.dosagem}
              </Typography>
            </Box>
          )}
          {item.horario && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IoTime size={14} color="#7A7A7A" />
              <Typography sx={{ fontSize: 13, color: "#5B5B5B" }}>
                {item.horario}
              </Typography>
            </Box>
          )}
          {(item.data_inicio || item.data_fim) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IoCalendar size={14} color="#7A7A7A" />
              <Typography sx={{ fontSize: 12, color: "#7A7A7A" }}>
                {item.data_inicio && new Date(item.data_inicio).toLocaleDateString("pt-BR")}
                {item.data_inicio && item.data_fim && " — "}
                {item.data_fim && new Date(item.data_fim).toLocaleDateString("pt-BR")}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Critical alert */}
        {item.alertas_criticos && (
          <Box sx={{
            bgcolor: "#FEE2E2", borderRadius: "10px", p: 1.2,
            display: "flex", alignItems: "center", gap: 1,
          }}>
            <IoWarning size={16} color="#EF4444" style={{ flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12, color: "#EF4444", fontWeight: 500 }}>
              {item.alertas_criticos}
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}

export default function Suplementos() {
  const { paciente } = usePaciente();
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("Todos");

  useEffect(() => {
    if (!paciente?.id) return;
    buscarSuplementacao(paciente.id).then((data) => {
      if (!data) { setLoading(false); return; }
      const all = [
        ...data.suplementos.map((s) => ({ ...s, tipo: "Suplemento" })),
        ...data.fitoterapicos.map((s) => ({ ...s, tipo: "Fitoterápico" })),
        ...data.homeopatia.map((s) => ({ ...s, tipo: "Homeopatia" })),
        ...data.florais_bach.map((s) => ({ ...s, tipo: "Floral de Bach" })),
      ];
      setItens(all);
      setLoading(false);
    });
  }, [paciente?.id]);

  const filtrados = filtro === "Todos" ? itens : itens.filter((i) => i.tipo === filtro);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#1B4266" }} />
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 700, color: "#1A1A1A", mb: 0.5 }}>
        Suplementação
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#7A7A7A", mb: 3 }}>
        {itens.length} item{itens.length !== 1 ? "s" : ""} prescrito{itens.length !== 1 ? "s" : ""}
      </Typography>

      {/* Filter tabs — segmented style */}
      <Box sx={{
        display: "flex", gap: 0.5, mb: 3, bgcolor: "#F0F6FA", borderRadius: "10px",
        p: 0.5, overflowX: "auto", WebkitOverflowScrolling: "touch",
      }}>
        {FILTROS.map((f) => {
          const active = filtro === f;
          const cfg = f !== "Todos" ? CAT_CONFIG[f] : null;
          return (
            <Box
              key={f}
              onClick={() => setFiltro(f)}
              sx={{
                px: { xs: 1.5, sm: 2 }, py: 0.8, borderRadius: "8px",
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                whiteSpace: "nowrap", flexShrink: 0, textAlign: "center",
                bgcolor: active ? "#fff" : "transparent",
                color: active ? (cfg?.color || "#1B4266") : "#7A7A7A",
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s ease",
                userSelect: "none",
              }}
            >
              {f}
            </Box>
          );
        })}
      </Box>

      {/* Cards grid */}
      {filtrados.length === 0 ? (
        <Card sx={{ border: "1px solid #C4D9E5", borderRadius: "16px", p: 4, textAlign: "center" }}>
          <Typography sx={{ fontSize: 15, color: "#5B5B5B" }}>Nenhum item encontrado</Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filtrados.map((item, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <SupplementCard item={item} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
