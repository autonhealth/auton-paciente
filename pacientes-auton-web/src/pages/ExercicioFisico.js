import React, { useEffect, useState } from "react";
import { Box, Card, Grid, Typography, Chip, CircularProgress } from "@mui/material";
import { IoChevronDown, IoChevronUp, IoFitness } from "react-icons/io5";
import { usePaciente } from "../hooks/usePaciente";
import { buscarExerciciosAgrupados } from "../lib/exercicios";

function ExerciseItem({ ex, index, total }) {
  return (
    <Card sx={{
      border: "1px solid #E6F1F6", borderRadius: "12px", p: 2,
      boxShadow: "none", bgcolor: "#FAFCFD",
      transition: "border-color 0.2s",
      "&:hover": { borderColor: "#1B4266" },
    }}>
      {/* Top row: number + name + muscle */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Box sx={{
          width: 28, height: 28, borderRadius: "8px",
          background: "linear-gradient(135deg, #1B4266, #2D6293)",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>
          {String(index + 1).padStart(2, "0")}
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", flex: 1 }}>
          {ex.nome}
        </Typography>
        {ex.grupoMuscular && (
          <Chip label={ex.grupoMuscular} size="small" sx={{
            height: 22, fontSize: 10, fontWeight: 600, bgcolor: "#E8F0F6", color: "#1B4266",
          }} />
        )}
      </Box>

      {/* Stats grid */}
      <Grid container spacing={1}>
        {[
          { label: "Séries", value: ex.series },
          { label: "Repetições", value: ex.repeticoes },
          { label: "Descanso", value: ex.descanso },
        ].map((s) => (
          <Grid item xs={4} key={s.label}>
            <Box sx={{
              bgcolor: "#fff", border: "1px solid #E6F1F6", borderRadius: "8px",
              py: 0.8, px: 1, textAlign: "center",
            }}>
              <Typography sx={{ fontSize: 10, color: "#7A7A7A", fontWeight: 500, mb: 0.2 }}>{s.label}</Typography>
              <Typography sx={{ fontSize: 14, color: "#1A1A1A", fontWeight: 700 }}>{s.value}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Observations */}
      {ex.observacoes && (
        <Box sx={{ mt: 1.2, px: 1, py: 0.6, bgcolor: "#E8F0F6", borderRadius: "6px", display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontSize: 11, color: "#1B4266", fontWeight: 600 }}>Obs:</Typography>
          <Typography sx={{ fontSize: 12, color: "#5B5B5B" }}>{ex.observacoes}</Typography>
        </Box>
      )}
    </Card>
  );
}

function WorkoutCard({ name, items, letter, expanded, onToggle }) {
  return (
    <Card sx={{
      border: "1px solid #C4D9E5", borderRadius: "16px", overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.3s ease",
      "&:hover": { boxShadow: "0 6px 20px rgba(27,66,102,0.08)" },
    }}>
      {/* Header */}
      <Box
        onClick={onToggle}
        sx={{
          display: "flex", alignItems: "center", p: { xs: 2, sm: 2.5 },
          cursor: "pointer", gap: 2,
          borderBottom: expanded ? "1px solid #F0F6FA" : "none",
          transition: "background 0.2s",
          "&:hover": { bgcolor: "#FAFCFD" },
        }}
      >
        {/* Letter badge */}
        <Box sx={{
          width: 46, height: 46, borderRadius: "12px",
          background: "linear-gradient(135deg, #1B4266, #2D6293)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
            {letter}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: 14, sm: 16 }, fontWeight: 600, color: "#1A1A1A" }}>
            {name}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#7A7A7A" }}>
            {items.length} exercício{items.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* Count badge + chevron */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <Box sx={{ px: 1, py: 0.3, borderRadius: "8px", bgcolor: "#E8F0F6" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1B4266" }}>
              {items.length}
            </Typography>
          </Box>
          {expanded
            ? <IoChevronUp size={18} color="#7A7A7A" />
            : <IoChevronDown size={18} color="#7A7A7A" />
          }
        </Box>
      </Box>

      {/* Expandable exercises grid */}
      {expanded && (
        <Box sx={{ px: { xs: 1.5, sm: 2.5 }, pb: 2, pt: 1 }}>
          <Grid container spacing={1.5}>
            {items.map((ex, idx) => (
              <Grid item xs={12} sm={6} key={ex.id || idx}>
                <ExerciseItem ex={ex} index={idx} total={items.length} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Card>
  );
}

export default function ExercicioFisico() {
  const { paciente } = usePaciente();
  const [exercicios, setExercicios] = useState({});
  const [loading, setLoading] = useState(true);
  const [openKey, setOpenKey] = useState(null);

  useEffect(() => {
    if (!paciente?.id) return;
    buscarExerciciosAgrupados(paciente.id).then((data) => {
      setExercicios(data);
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

  const entries = Object.entries(exercicios);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  if (entries.length === 0) {
    return (
      <Box className="fade-in">
        <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 700, color: "#1A1A1A", mb: 3 }}>
          Exercício Físico
        </Typography>
        <Card sx={{ border: "1px solid #C4D9E5", borderRadius: "16px", p: 4, textAlign: "center" }}>
          <IoFitness size={32} color="#C4D9E5" />
          <Typography sx={{ fontSize: 15, color: "#5B5B5B", mt: 2 }}>
            Nenhum exercício prescrito
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 700, color: "#1A1A1A", mb: 0.5 }}>
        Exercício Físico
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#7A7A7A", mb: 3 }}>
        {entries.length} treino{entries.length !== 1 ? "s" : ""} prescritos
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {entries.map(([name, items], idx) => (
          <WorkoutCard
            key={name}
            name={name}
            items={items}
            letter={letters[idx] || String(idx + 1)}
            expanded={openKey === name}
            onToggle={() => setOpenKey(openKey === name ? null : name)}
          />
        ))}
      </Box>
    </Box>
  );
}
