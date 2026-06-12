import React, { useEffect, useState } from "react";
import { Box, Card, Grid, Typography, CircularProgress } from "@mui/material";
import { IoFlame, IoRestaurant, IoWater, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { usePaciente } from "../hooks/usePaciente";
import {
  buscarRefeicaoPaciente, processarDadosRefeicao, buscarMetaAguaPaciente,
} from "../lib/alimentacao";

const CAT_LABELS = {
  proteinas: "Proteínas",
  carboidratos: "Carboidratos",
  gorduras: "Gorduras",
  leguminosas: "Leguminosas",
};

const CAT_COLORS = {
  proteinas: { bg: "#FEE2E2", color: "#EF4444" },
  carboidratos: { bg: "#E8F0F6", color: "#1B4266" },
  gorduras: { bg: "#EBF4FF", color: "#4FA2FF" },
  leguminosas: { bg: "#ECFDF5", color: "#10B981" },
};

function FoodRow({ item, last }) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", py: 1.2, px: 0.5,
      borderBottom: last ? "none" : "1px solid #F0F6FA",
      gap: 1.5,
    }}>
      <Box sx={{
        width: 6, height: 6, borderRadius: "50%", bgcolor: "#1B4266", flexShrink: 0, mt: 0.3,
      }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#1A1A1A" }}>
          {item.alimento}
        </Typography>
        {item.quantidade && (
          <Typography sx={{ fontSize: 12, color: "#7A7A7A", mt: 0.2 }}>
            {item.quantidade}
          </Typography>
        )}
      </Box>
      {item.kcal > 0 && (
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#5B5B5B", flexShrink: 0 }}>
          {item.kcal} kcal
        </Typography>
      )}
    </Box>
  );
}

function MealCard({ meal, index }) {
  const [view, setView] = useState("principal");
  const [open, setOpen] = useState(index === 0);
  const items = view === "principal"
    ? (meal.refeicaoPrincipal?.itens || [])
    : null;

  const subCats = meal.substituicoesPorCategoria || {};
  const hasSubstitutions = Object.values(subCats).some(arr => arr && arr.length > 0);

  return (
    <Card sx={{
      border: "1px solid #C4D9E5", borderRadius: "16px", overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.3s ease",
      "&:hover": { boxShadow: "0 6px 20px rgba(27,66,102,0.08)" },
    }}>
      {/* Header — clickable to expand/collapse */}
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: "flex", alignItems: "center", p: { xs: 2, sm: 2.5 },
          cursor: "pointer", gap: 2,
          borderBottom: open ? "1px solid #F0F6FA" : "none",
        }}
      >
        {/* Meal number badge */}
        <Box sx={{
          width: 44, height: 44, borderRadius: "12px",
          background: "linear-gradient(135deg, #1B4266, #2D6293)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
            {index + 1}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: 14, sm: 15 }, fontWeight: 600, color: "#1A1A1A" }}>
            {meal.nome}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#7A7A7A" }}>
            {meal.refeicaoPrincipal?.itens?.length || 0} alimentos
          </Typography>
        </Box>

        {/* Kcal + chevron */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          {meal.totalKcal > 0 && (
            <Box sx={{ px: 1.2, py: 0.4, borderRadius: "8px", bgcolor: "#E8F0F6" }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1B4266" }}>
                {meal.totalKcal} kcal
              </Typography>
            </Box>
          )}
          {open ? <IoChevronUp size={16} color="#7A7A7A" /> : <IoChevronDown size={16} color="#7A7A7A" />}
        </Box>
      </Box>

      {/* Expandable content */}
      {open && (
        <Box sx={{ p: { xs: 2, sm: 2.5 }, pt: 1.5 }}>
          {/* View toggle */}
          <Box sx={{ display: "flex", gap: 0.5, mb: 2, bgcolor: "#F0F6FA", borderRadius: "10px", p: 0.5 }}>
            {[
              { key: "principal", label: "Principal" },
              ...(hasSubstitutions ? [{ key: "substituicoes", label: "Substituições" }] : []),
            ].map((v) => (
              <Box
                key={v.key}
                onClick={() => setView(v.key)}
                sx={{
                  flex: 1, textAlign: "center",
                  py: 0.8, borderRadius: "8px", cursor: "pointer",
                  fontSize: 13, fontWeight: 600,
                  bgcolor: view === v.key ? "#fff" : "transparent",
                  color: view === v.key ? "#1A1A1A" : "#7A7A7A",
                  boxShadow: view === v.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.2s ease",
                  userSelect: "none",
                }}
              >
                {v.label}
              </Box>
            ))}
          </Box>

          {/* Food list */}
          {view === "principal" && items && (
            <Box>
              {items.map((item, i) => (
                <FoodRow key={i} item={item} last={i === items.length - 1} />
              ))}
              {items.length === 0 && (
                <Typography sx={{ fontSize: 13, color: "#7A7A7A", py: 2, textAlign: "center" }}>
                  Nenhum alimento cadastrado
                </Typography>
              )}
            </Box>
          )}

          {/* Substitutions by category */}
          {view === "substituicoes" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {Object.entries(subCats).map(([catKey, catItems]) => {
                if (!catItems || catItems.length === 0) return null;
                const catStyle = CAT_COLORS[catKey] || { bg: "#F0F6FA", color: "#5B5B5B" };
                return (
                  <Box key={catKey}>
                    {/* Category label */}
                    <Box sx={{
                      display: "inline-flex", px: 1.2, py: 0.3, borderRadius: "6px",
                      bgcolor: catStyle.bg, mb: 1,
                    }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 600, color: catStyle.color, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {CAT_LABELS[catKey] || catKey}
                      </Typography>
                    </Box>
                    {/* Items */}
                    {catItems.map((item, i) => (
                      <FoodRow key={i} item={item} last={i === catItems.length - 1} />
                    ))}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      )}
    </Card>
  );
}

export default function Alimentacao() {
  const { paciente } = usePaciente();
  const [dados, setDados] = useState(null);
  const [metaAgua, setMetaAgua] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paciente?.id) return;
    Promise.all([
      buscarRefeicaoPaciente(paciente.id),
      buscarMetaAguaPaciente(paciente.id),
    ]).then(([refeicaoData, metaAguaData]) => {
      setDados(processarDadosRefeicao(refeicaoData));
      setMetaAgua(metaAguaData);
      setLoading(false);
    });
  }, [paciente?.id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#1B4266" }} />
      </Box>
    );
  }

  const totalKcal = dados?.totalCalorias || 0;
  const numRefeicoes = dados?.refeicoes?.length || 0;
  const aguaDisplay = metaAgua ? (metaAgua >= 1000 ? `${(metaAgua / 1000).toFixed(1)} L` : `${metaAgua} ml`) : "—";

  return (
    <Box className="fade-in">
      {/* Page title */}
      <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 700, color: "#1A1A1A", mb: 0.5 }}>
        Plano Alimentar
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#7A7A7A", mb: 3 }}>
        Seu plano nutricional personalizado
      </Typography>

      {/* Summary KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { icon: <IoFlame size={22} />, value: totalKcal > 0 ? totalKcal : "—", label: "Calorias", sub: "kcal diárias", color: "#F59E0B", bg: "#FFFBEB", border: "#F59E0B" },
          { icon: <IoRestaurant size={22} />, value: numRefeicoes, label: "Refeições", sub: "por dia", color: "#10B981", bg: "#ECFDF5", border: "#10B981" },
          { icon: <IoWater size={22} />, value: aguaDisplay, label: "Hidratação", sub: "meta diária", color: "#4FA2FF", bg: "#EBF4FF", border: "#4FA2FF" },
        ].map((item, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Card sx={{
              border: "1px solid #C4D9E5", borderRadius: "14px", p: { xs: 2, sm: 2.5 },
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              borderTop: `3px solid ${item.border}`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(27,66,102,0.08)" },
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: "12px", bgcolor: item.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: item.color, flexShrink: 0,
                }}>
                  {item.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 12, color: "#7A7A7A", fontWeight: 500, mb: 0.3 }}>
                    {item.label}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                    <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 700, color: "#1A1A1A", lineHeight: 1 }}>
                      {item.value}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#7A7A7A" }}>
                      {item.sub}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Meal cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {dados?.refeicoes?.length > 0 ? (
          dados.refeicoes.map((meal, idx) => (
            <MealCard key={idx} meal={meal} index={idx} />
          ))
        ) : (
          <Card sx={{ border: "1px solid #C4D9E5", borderRadius: "16px", p: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: 15, color: "#5B5B5B" }}>
              Nenhum plano alimentar cadastrado
            </Typography>
          </Card>
        )}
      </Box>
    </Box>
  );
}
