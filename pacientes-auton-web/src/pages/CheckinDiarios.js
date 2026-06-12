import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Card, Grid, Typography, Button, Slider, CircularProgress, LinearProgress } from "@mui/material";
import { IoMoon, IoFitness, IoRestaurant, IoCheckmarkCircle, IoChevronForward } from "react-icons/io5";
import { usePaciente } from "../hooks/usePaciente";
import { verificarCheckinHoje, salvarCheckin } from "../lib/checkins";

const STEPS = [
  {
    key: "sono", label: "Sono", subtitle: "Como foi sua noite?",
    icon: IoMoon, accent: "#1B4266", bg: "#E8F0F6",
    fields: [
      { key: "qualidadeSono", label: "Qualidade do sono", min: 0, max: 10, step: 0.5 },
      { key: "horasDormidas", label: "Horas dormidas", min: 0, max: 12, step: 0.5, unit: "h" },
    ],
  },
  {
    key: "atividade", label: "Atividade Física", subtitle: "Como foi seu dia ativo?",
    icon: IoFitness, accent: "#10B981", bg: "#ECFDF5",
    fields: [
      { key: "tempoAtividade", label: "Tempo de atividade", min: 0, max: 5, step: 0.5, unit: "h" },
      { key: "intensidade", label: "Intensidade", min: 0, max: 100, step: 5, unit: "%" },
    ],
  },
  {
    key: "alimentacao", label: "Alimentação", subtitle: "Como foi sua nutrição?",
    icon: IoRestaurant, accent: "#F59E0B", bg: "#FFFBEB",
    fields: [
      { key: "refeicoesRealizadas", label: "Refeições realizadas", min: 0, max: 6, step: 1 },
      { key: "aguaConsumida", label: "Água consumida", min: 0, max: 4, step: 0.25, unit: "L" },
    ],
  },
];

export default function CheckinDiarios() {
  const { paciente } = usePaciente();
  const [jaFez, setJaFez] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [iniciado, setIniciado] = useState(false);
  const [step, setStep] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [valores, setValores] = useState({
    qualidadeSono: 5, horasDormidas: 7,
    tempoAtividade: 0.5, intensidade: 50,
    refeicoesRealizadas: 3, aguaConsumida: 2,
  });

  useEffect(() => {
    if (!paciente?.id) return;
    verificarCheckinHoje(paciente.id).then((done) => { setJaFez(done); setCarregando(false); });
  }, [paciente?.id]);

  const handleChange = (key, val) => setValores((p) => ({ ...p, [key]: val }));

  const handleSalvar = async () => {
    setSalvando(true);
    await salvarCheckin(paciente.id, {
      sono: { qualidade: valores.qualidadeSono, tempo: valores.horasDormidas },
      atividade: { tempo: valores.tempoAtividade, intensidade: valores.intensidade },
      alimentacao: { refeicoes: valores.refeicoesRealizadas, agua: valores.aguaConsumida },
    });
    setSalvando(false);
    setSucesso(true);
  };

  if (carregando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#1B4266" }} />
      </Box>
    );
  }

  if (jaFez || sucesso) {
    return (
      <Box className="fade-in" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Card sx={{ p: { xs: 3, sm: 5 }, border: "1px solid #C4D9E5", borderRadius: "20px", textAlign: "center", maxWidth: 420 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <IoCheckmarkCircle size={36} color="#10B981" />
          </Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#1A1A1A", mb: 1 }}>
            {sucesso ? "Check-in salvo!" : "Check-in já realizado!"}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#7A7A7A", mb: 3 }}>
            Suas métricas foram atualizadas.
          </Typography>
          <Button component={Link} to="/dashboard" variant="contained" sx={{
            bgcolor: "#1B4266", borderRadius: "10px", px: 4, py: 1.2, fontWeight: 600, "&:hover": { bgcolor: "#2D6293" },
          }}>
            Dashboard <IoChevronForward size={16} style={{ marginLeft: 4 }} />
          </Button>
        </Card>
      </Box>
    );
  }

  // Overview screen
  if (!iniciado) {
    return (
      <Box className="fade-in">
        <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 700, color: "#1A1A1A", mb: 0.5 }}>
          Check-in Diário
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#7A7A7A", mb: 3 }}>
          Registre como foi o seu dia em 3 etapas rápidas
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            return (
              <Card key={s.key} sx={{
                border: "1px solid #C4D9E5", borderRadius: "16px", overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(27,66,102,0.08)" },
              }}>
                <Box sx={{ height: 3, bgcolor: s.accent }} />
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: { xs: 2, sm: 2.5 } }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: "12px", bgcolor: s.bg,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <StepIcon size={24} color={s.accent} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
                      <Box sx={{
                        width: 20, height: 20, borderRadius: "6px",
                        bgcolor: s.accent, color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {i + 1}
                      </Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#1A1A1A" }}>
                        {s.label}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13, color: "#7A7A7A" }}>
                      {s.subtitle}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flexShrink: 0 }}>
                    {s.fields.map((f) => (
                      <Box key={f.key} sx={{ px: 1, py: 0.2, borderRadius: "5px", bgcolor: "#F0F6FA" }}>
                        <Typography sx={{ fontSize: 10, color: "#7A7A7A", fontWeight: 500, whiteSpace: "nowrap" }}>
                          {f.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>

        <Button fullWidth variant="contained" onClick={() => setIniciado(true)} sx={{
          bgcolor: "#1B4266", borderRadius: "12px", py: 1.5, fontSize: 15, fontWeight: 600,
          "&:hover": { bgcolor: "#2D6293" },
        }}>
          Iniciar Check-in
        </Button>
      </Box>
    );
  }

  const current = STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / 3) * 100;
  const isLast = step === 2;

  return (
    <Box className="fade-in">
      {/* Header */}
      <Typography sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 700, color: "#1A1A1A", mb: 0.5 }}>
        Check-in Diário
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#7A7A7A", mb: 3 }}>
        Etapa {step + 1} de 3 — {current.subtitle}
      </Typography>

      {/* Step indicator bar */}
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        {STEPS.map((s, i) => (
          <Box key={s.key} sx={{
            flex: 1, height: 4, borderRadius: 2,
            bgcolor: i <= step ? STEPS[i].accent : "#E6F1F6",
            transition: "background 0.4s ease",
          }} />
        ))}
      </Box>

      {/* Current step card */}
      <Card sx={{
        border: "1px solid #C4D9E5", borderRadius: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden", mb: 3,
      }}>
        <Box sx={{ height: 4, bgcolor: current.accent }} />
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          {/* Step title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: "12px", bgcolor: current.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={22} color={current.accent} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#1A1A1A" }}>
                {current.label}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#7A7A7A" }}>
                {current.subtitle}
              </Typography>
            </Box>
          </Box>

          {/* Fields */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {current.fields.map((field) => {
              const val = valores[field.key];
              return (
                <Box key={field.key}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#5B5B5B" }}>
                      {field.label}
                    </Typography>
                    <Box sx={{ px: 1.5, py: 0.5, borderRadius: "10px", bgcolor: current.bg }}>
                      <Typography sx={{ fontSize: 18, fontWeight: 700, color: current.accent }}>
                        {val}{field.unit ? ` ${field.unit}` : ""}
                      </Typography>
                    </Box>
                  </Box>
                  <Slider
                    value={val}
                    onChange={(_, v) => handleChange(field.key, v)}
                    min={field.min} max={field.max} step={field.step}
                    sx={{
                      color: current.accent, height: 8,
                      "& .MuiSlider-thumb": {
                        width: { xs: 24, sm: 20 }, height: { xs: 24, sm: 20 },
                        bgcolor: "#fff", border: `2.5px solid ${current.accent}`,
                        "&:hover": { boxShadow: `0 0 0 6px ${current.accent}20` },
                      },
                      "& .MuiSlider-track": { border: "none" },
                      "& .MuiSlider-rail": { bgcolor: "#E6F1F6", opacity: 1 },
                    }}
                  />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: -0.5 }}>
                    <Typography sx={{ fontSize: 11, color: "#C4D9E5" }}>{field.min}</Typography>
                    <Typography sx={{ fontSize: 11, color: "#C4D9E5" }}>{field.max}{field.unit || ""}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button
          variant="outlined"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          sx={{
            flex: 1, py: 1.3, borderRadius: "12px", fontWeight: 600,
            borderColor: "#C4D9E5", color: "#1B4266",
            "&:hover": { borderColor: "#1B4266", bgcolor: "#E8F0F6" },
            "&:disabled": { borderColor: "#E6F1F6", color: "#C4D9E5" },
          }}
        >
          Anterior
        </Button>
        <Button
          variant="contained"
          onClick={() => { if (!isLast) setStep((s) => s + 1); else handleSalvar(); }}
          disabled={salvando}
          sx={{
            flex: 2, py: 1.3, borderRadius: "12px", fontWeight: 600,
            bgcolor: isLast ? "#10B981" : "#1B4266",
            "&:hover": { bgcolor: isLast ? "#059669" : "#2D6293" },
          }}
        >
          {salvando ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : isLast ? "Finalizar Check-in" : "Próximo"}
        </Button>
      </Box>
    </Box>
  );
}
