import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box, Card, Grid, Typography, CircularProgress, LinearProgress, Button,
} from "@mui/material";
import { IoMoon, IoFitness, IoWater, IoHeart, IoChevronForward, IoCheckmarkCircle } from "react-icons/io5";
import { usePaciente } from "../hooks/usePaciente";
import {
  buscarMetricasPaciente, buscarHistoricoCheckins, calcularAderenciaProtocolo, verificarCheckinHoje,
} from "../lib/checkins";
import { buscarHabitosVidaPaciente } from "../lib/alimentacao";

/* ───────── Animations CSS (injected once) ───────── */
const animationStyles = `
@keyframes waterFlow {
  0%   { d: path('M0,8 Q7,4 14,8 T28,8 T42,8 T56,8 L56,56 L0,56 Z'); }
  50%  { d: path('M0,8 Q7,12 14,8 T28,8 T42,8 T56,8 L56,56 L0,56 Z'); }
  100% { d: path('M0,8 Q7,4 14,8 T28,8 T42,8 T56,8 L56,56 L0,56 Z'); }
}
@keyframes waterShimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
@keyframes moonGlow {
  0%, 100% { filter: drop-shadow(0 0 6px rgba(27,66,102,0.3)); transform: scale(1); }
  50% { filter: drop-shadow(0 0 18px rgba(27,66,102,0.6)); transform: scale(1.08); }
}
@keyframes heartBeat {
  0%  { transform: scale(1); }
  10% { transform: scale(1.35); }
  20% { transform: scale(0.9); }
  30% { transform: scale(1.3); }
  40% { transform: scale(1); }
  100% { transform: scale(1); }
}
@keyframes heartGlow {
  0%  { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
  10% { box-shadow: 0 0 20px 6px rgba(239,68,68,0.4); }
  20% { box-shadow: 0 0 4px 1px rgba(239,68,68,0.1); }
  30% { box-shadow: 0 0 16px 5px rgba(239,68,68,0.35); }
  40% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
  100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
}
@keyframes fitnessBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes ringProgress {
  from { stroke-dashoffset: 440; }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

if (typeof document !== "undefined" && !document.getElementById("dash-anim")) {
  const style = document.createElement("style");
  style.id = "dash-anim";
  style.textContent = animationStyles;
  document.head.appendChild(style);
}

/* ───────── Helpers ───────── */
const periodos = [
  { label: "Hoje", value: 1 },
  { label: "7 dias", value: 7 },
  { label: "15 dias", value: 15 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
];

function avg(arr) {
  const valid = arr.filter((v) => v != null);
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

function pct(atual, meta) {
  if (!meta) return 0;
  return Math.min(100, Math.round((atual / meta) * 100));
}

/* ───────── Animated Icon Components ───────── */

function WaveIcon({ percentage, hovered }) {
  const sy = 8;
  const a = hovered ? 10 : 5;
  const dur1 = hovered ? "2s" : "3s";
  const dur2 = hovered ? "2.6s" : "4s";

  return (
    <Box sx={{
      width: 56, height: 56, borderRadius: "14px",
      position: "relative", overflow: "hidden", bgcolor: "#F0F7FF",
    }}>
      <svg width="56" height="56" viewBox="0 0 56 56" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8DCFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6BB8F5" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Solid fill — full height */}
        <rect x="0" y={sy + 5} width="56" height={56} fill="#E0F0FF" />

        {/* Back wave */}
        <path fill="rgba(130,200,255,0.5)">
          <animate attributeName="d" dur={dur2} repeatCount="indefinite" calcMode="spline"
            keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95" values={`
            M0,${sy+2} C14,${sy-a*0.5} 28,${sy+a*0.6} 42,${sy+1} C49,${sy-a*0.3} 56,${sy+a*0.4} 56,${sy+2} L56,56 L0,56 Z;
            M0,${sy+a*0.5} C14,${sy+a*0.7} 28,${sy-a*0.4} 42,${sy+a*0.6} C49,${sy+a*0.3} 56,${sy-a*0.2} 56,${sy+a*0.4} L56,56 L0,56 Z;
            M0,${sy+2} C14,${sy-a*0.5} 28,${sy+a*0.6} 42,${sy+1} C49,${sy-a*0.3} 56,${sy+a*0.4} 56,${sy+2} L56,56 L0,56 Z
          `} />
        </path>

        {/* Main wave */}
        <path fill="url(#wg)">
          <animate attributeName="d" dur={dur1} repeatCount="indefinite" calcMode="spline"
            keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95" values={`
            M0,${sy+3} C10,${sy-a} 20,${sy+a} 30,${sy+2} C40,${sy-a*0.7} 50,${sy+a*0.8} 56,${sy+1} L56,56 L0,56 Z;
            M0,${sy-a*0.3} C10,${sy+a*0.9} 20,${sy-a*0.6} 30,${sy+a*0.7} C40,${sy+a} 50,${sy-a*0.5} 56,${sy+a*0.4} L56,56 L0,56 Z;
            M0,${sy+3} C10,${sy-a} 20,${sy+a} 30,${sy+2} C40,${sy-a*0.7} 50,${sy+a*0.8} 56,${sy+1} L56,56 L0,56 Z
          `} />
        </path>

        {/* Shimmer reflections */}
        <ellipse cx="17" cy="28" rx="5" ry="2" fill="rgba(255,255,255,0.4)"
          style={{ animation: "waterShimmer 4s ease-in-out infinite" }} />
        <ellipse cx="38" cy="38" rx="3.5" ry="1.5" fill="rgba(255,255,255,0.3)"
          style={{ animation: "waterShimmer 4s ease-in-out 2s infinite" }} />
      </svg>

      <Box sx={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 2,
        transition: "transform 0.6s ease",
        transform: hovered ? "scale(1.08)" : "scale(1)",
      }}>
        <IoWater size={20} color="rgba(255,255,255,0.9)" style={{ filter: "drop-shadow(0 1px 4px rgba(59,143,228,0.5))" }} />
      </Box>
    </Box>
  );
}

function MoonIcon({ hovered }) {
  // Two circles: moon (visible) and shadow (covers part to make crescent).
  // Shadow slides right on hover to reveal full moon, then slides back.
  // Using unique ID per instance to avoid SVG conflicts.
  const [id] = useState(() => "mm" + Math.random().toString(36).slice(2, 6));
  return (
    <Box sx={{
      width: 56, height: 56, borderRadius: "14px", bgcolor: "#E8F0F6",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="28" height="28" viewBox="0 0 28 28">
        <defs>
          <mask id={id}>
            <rect width="28" height="28" fill="white" />
            <circle r="9" cy="11" fill="black">
              {hovered ? (
                <animate attributeName="cx" values="19;36;19" dur="3s" repeatCount="indefinite"
                  calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
              ) : (
                <set attributeName="cx" to="19" />
              )}
            </circle>
          </mask>
        </defs>
        <circle cx="14" cy="14" r="10" fill="#1B4266" mask={`url(#${id})`} />
      </svg>
    </Box>
  );
}

function HeartIcon({ hovered }) {
  return (
    <Box sx={{
      width: 56, height: 56, borderRadius: "14px", bgcolor: "#FEE2E2",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "center",
        "@keyframes hb": {
          "0%":   { transform: "scale(1)" },
          "10%":  { transform: "scale(1.4)" },
          "20%":  { transform: "scale(0.85)" },
          "30%":  { transform: "scale(1.3)" },
          "45%":  { transform: "scale(1)" },
          "100%": { transform: "scale(1)" },
        },
        animation: hovered ? "hb 0.9s ease-in-out infinite" : "none",
      }}>
        <IoHeart size={28} color="#EF4444" />
      </Box>
    </Box>
  );
}

function FitnessIcon() {
  return (
    <Box sx={{ width: 56, height: 56, borderRadius: "14px", bgcolor: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <IoFitness size={24} color="#10B981" style={{ animation: "fitnessBounce 2s ease-in-out infinite" }} />
    </Box>
  );
}

/* ───────── Circular Score Ring (SVG) ───────── */
function ScoreRing({ value, max = 10, size = 200, label }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <Box sx={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E6F1F6" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#1B4266" strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out", animation: "ringProgress 1.2s ease-out" }}
        />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: size * 0.22, fontWeight: 700, color: "#1A1A1A", lineHeight: 1 }}>
          {typeof value === "number" ? value.toFixed(1) : value}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#7A7A7A", mt: 0.5 }}>de {max}</Typography>
        {label && <Typography sx={{ fontSize: 11, color: "#5B5B5B", mt: 0.3, fontWeight: 500 }}>{label}</Typography>}
      </Box>
    </Box>
  );
}

/* ───────── Metric Card ───────── */
function MetricCard({ iconRender, title, value, subtitle, percentage, hidePercentage, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const color = percentage >= 100 ? "#10B981" : percentage >= 70 ? "#F59E0B" : "#EF4444";
  const bg = percentage >= 100 ? "#ECFDF5" : percentage >= 70 ? "#FFFBEB" : "#FEE2E2";

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        p: { xs: 1.25, md: 2.5 },
        height: "100%",
        animation: `fadeSlideUp 0.5s ease-out ${delay}s both`,
        cursor: "default",
      }}
    >
      {/* Desktop: horizontal (icon | content | chip) */}
      <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2 }}>
        {iconRender(hovered)}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, color: "var(--h2-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: "var(--h2-text)" }}>{value}</Typography>
          {subtitle && <Typography sx={{ fontSize: 11, color: "var(--h2-text-muted)", mt: 0.3 }}>{subtitle}</Typography>}
        </Box>
        {!hidePercentage && (
          <Box sx={{ px: 1.2, py: 0.4, borderRadius: "8px", bgcolor: bg, flexShrink: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color }}>{percentage}%</Typography>
          </Box>
        )}
      </Box>

      {/* Mobile: vertical compacto, rows fixas para alinhamento entre cards */}
      <Box sx={{
        display: { xs: "grid", md: "none" },
        gridTemplateRows: "44px 28px 22px 22px",
        justifyItems: "center",
        alignItems: "center",
        textAlign: "center",
        gap: 0.5,
        height: "100%",
      }}>
        <Box sx={{ transform: "scale(0.72)", transformOrigin: "center" }}>
          {iconRender(hovered)}
        </Box>
        <Typography sx={{
          fontSize: 9.5, color: "var(--h2-text-muted)", fontWeight: 600,
          textTransform: "uppercase", letterSpacing: 0.4, lineHeight: 1.15,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "var(--h2-text)", lineHeight: 1 }}>
          {value}
        </Typography>
        <Box sx={{ minHeight: 20, display: "inline-flex", alignItems: "center" }}>
          {!hidePercentage ? (
            <Box sx={{ px: 0.9, py: 0.2, borderRadius: "6px", bgcolor: bg }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 700, color }}>{percentage}%</Typography>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Card>
  );
}

/* ───────── Dimension Mini Card ───────── */
function DimensionCard({ label, value, color, icon }) {
  const pct = Math.min(100, (value / 10) * 100);
  const rating = value >= 8 ? "Ótimo" : value >= 6 ? "Bom" : value >= 4 ? "Regular" : "Baixo";
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 2,
      p: 2, borderRadius: "12px", bgcolor: "#fff",
      border: "1px solid rgba(196,217,229,0.5)",
      transition: "background 0.2s",
      "&:hover": { bgcolor: "#F8FAFC" },
      height: "100%",
    }}>
      {/* Icon */}
      <Box sx={{
        width: 40, height: 40, borderRadius: "10px", bgcolor: `${color}12`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {icon}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.8 }}>
          <Typography sx={{ fontSize: 12, color: "#5B5B5B", fontWeight: 500 }}>
            {label}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1A1A1A", lineHeight: 1 }}>
              {typeof value === "number" ? value.toFixed(1) : value}
            </Typography>
            <Typography sx={{ fontSize: 10, color: "#7A7A7A" }}>/10</Typography>
          </Box>
        </Box>
        {/* Progress bar */}
        <Box sx={{ width: "100%", height: 4, borderRadius: 2, bgcolor: "#EBF3F6", overflow: "hidden" }}>
          <Box sx={{
            width: `${pct}%`, height: "100%", borderRadius: 2, bgcolor: color,
            transition: "width 1s ease",
          }} />
        </Box>
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════════ */
export default function Dashboard() {
  const { paciente } = usePaciente();
  const [metricas, setMetricas] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [habitos, setHabitos] = useState(null);
  const [periodo, setPeriodo] = useState(7);
  const [loading, setLoading] = useState(true);
  const [checkinDone, setCheckinDone] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!paciente?.id) return;
    verificarCheckinHoje(paciente.id).then(setCheckinDone);
  }, [paciente?.id]);

  useEffect(() => {
    if (!paciente?.id) return;
    setLoading(true);
    Promise.all([
      buscarMetricasPaciente(paciente.id),
      buscarHistoricoCheckins(paciente.id, periodo),
      buscarHabitosVidaPaciente(paciente.id),
    ]).then(([m, h, hab]) => {
      setMetricas(m);
      setHistorico(h);
      setHabitos(hab);
      setLoading(false);
    });
  }, [paciente?.id, periodo]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "var(--h2-primary)" }} />
      </Box>
    );
  }

  const firstName = paciente?.name?.split(" ")[0] || "Paciente";
  const checkins = historico || [];
  const hasData = checkins.length > 0;

  const sonoMedia = avg(checkins.map((c) => c.sono_tempo_horas));
  const exercicioMin = Math.round(avg(checkins.map((c) => c.atividade_tempo_horas)) * 60);
  const hidratacaoMedia = avg(checkins.map((c) => c.alimentacao_agua_litros));

  const sonoMeta = habitos?.sonoDuracaoHoras || 8;
  const exercicioMeta = habitos?.exercicioDuracaoMin || 60;
  const hidratacaoMeta = habitos?.metaAguaMl ? habitos.metaAguaMl / 1000 : 2.5;

  const sonoPerc = pct(sonoMedia, sonoMeta);
  const exercicioPerc = pct(exercicioMin, exercicioMeta);
  const hidratacaoPerc = pct(hidratacaoMedia, hidratacaoMeta);

  const sonoH = Math.floor(sonoMedia);
  const sonoMin = Math.round((sonoMedia - sonoH) * 60);

  // Biological age
  const calcAge = (d) => {
    if (!d) return null;
    const b = new Date(d), t = new Date();
    let age = t.getFullYear() - b.getFullYear();
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) age--;
    return age;
  };
  const idadeBio = metricas?.idade_biologica || null;
  const idadeReal = calcAge(paciente?.birth_date);
  const idadeExibir = idadeBio || idadeReal;

  // Calculate dimension scores from filtered check-ins (responds to period filter)
  const calcDimensions = (cks) => {
    if (!cks || cks.length === 0) return { sono: 0, atividade: 0, alimentacao: 0, geral: 0 };
    const sonoScores = cks.map(c => c.sono_qualidade * 0.7 + (c.sono_tempo_horas / 8 * 10) * 0.3);
    const atividadeScores = cks.map(c => (c.atividade_tempo_horas / 1.5 * 10 * 0.5) + (c.atividade_intensidade / 10 * 0.5));
    const alimentacaoScores = cks.map(c => (c.alimentacao_refeicoes / 4 * 10 * 0.5) + (c.alimentacao_agua_litros / 2.5 * 10 * 0.5));
    const clamp = v => Math.min(10, Math.max(0, v));
    const s = clamp(avg(sonoScores));
    const a = clamp(avg(atividadeScores));
    const al = clamp(avg(alimentacaoScores));
    return { sono: s, atividade: a, alimentacao: al, geral: clamp((s + a + al) / 3) };
  };
  const dims = calcDimensions(checkins);
  const eqGeral = dims.geral;
  const eqSono = dims.sono;
  const eqAtividade = dims.atividade;
  const eqAlimentacao = dims.alimentacao;

  const aderencia = calcularAderenciaProtocolo(checkins, periodo);

  if (!hasData && !metricas) {
    return (
      <div className="h2-root">
        <div className="h2-greeting">
          <h1 className="h2-greeting__title">Olá, {firstName}</h1>
        </div>
        <div className="h2-card h2-fade-in" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <HeartIcon />
          </Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "var(--h2-text)", mb: 1 }}>
            Realize seu primeiro check-in
          </Typography>
          <Typography sx={{ fontSize: 14, color: "var(--h2-text-muted)", mb: 3, maxWidth: 360, mx: "auto" }}>
            Complete seu check-in diário para começar a acompanhar suas métricas de saúde.
          </Typography>
          <Button component={Link} to="/checkin-diarios" variant="contained" color="primary">
            Fazer Check-in <IoChevronForward size={16} style={{ marginLeft: 4 }} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h2-root">
      {/* ─── Greeting bar + period pills ─── */}
      <div className="h2-greeting h2-fade-in">
        <div className="h2-greeting__heading">
          <h1 className="h2-greeting__title">Olá, {firstName}</h1>
          <div className="h2-greeting__sub">
            Visão geral · {periodos.find((p) => p.value === periodo)?.label || ""}
          </div>
        </div>
        <div className="h2-pills" role="tablist" aria-label="Filtro de período">
          {periodos.map((p) => (
            <button
              key={p.value}
              type="button"
              role="tab"
              aria-selected={periodo === p.value}
              className={`h2-pill ${periodo === p.value ? "is-active" : ""}`}
              onClick={() => setPeriodo(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h2-grid">
        {/* ─── Row 1: 3 Metric Cards (sub-grid 3-up, não colapsa no mobile) ─── */}
        <div className="h2-col-12">
          <div className="h2-metrics-row">
            <MetricCard
              iconRender={(h) => <MoonIcon hovered={h} />}
              title="Qualidade do Sono"
              value={`${sonoH}h${sonoMin > 0 ? `:${String(sonoMin).padStart(2, "0")}min` : ""}`}
              subtitle={`Meta: ${sonoMeta}h por noite`}
              percentage={sonoPerc}
              delay={0}
            />
            <MetricCard
              iconRender={(h) => <HeartIcon hovered={h} />}
              title="Idade Biológica"
              value={idadeExibir ? `${idadeExibir} anos` : "—"}
              subtitle={idadeBio ? "Idade biológica ajustada" : "Idade cronológica"}
              hidePercentage
              delay={0.08}
            />
            <MetricCard
              iconRender={(h) => <WaveIcon percentage={hidratacaoPerc} hovered={h} />}
              title="Hidratação"
              value={`${hidratacaoMedia.toFixed(1)} L`}
              subtitle={`Meta: ${hidratacaoMeta.toFixed(1)} L/dia`}
              percentage={hidratacaoPerc}
              delay={0.16}
            />
          </div>
        </div>

      {/* ── Mobile-only: Check-in button ── */}
      <Box className="h2-col-12" sx={{ display: { xs: "block", md: "none" }, position: "relative" }}>
        <Card
          component={checkinDone ? "div" : Link}
          to={checkinDone ? undefined : "/checkin-diarios"}
          onClick={checkinDone ? () => { setShowTooltip(true); setTimeout(() => setShowTooltip(false), 2500); } : undefined}
          sx={{
            display: "flex", alignItems: "center", gap: 1.5,
            border: "none", borderRadius: "var(--h2-radius)", p: 2,
            textDecoration: "none", cursor: "pointer",
            background: checkinDone
              ? "linear-gradient(135deg, #A0AEC0, #B8C4CE)"
              : "linear-gradient(135deg, var(--h2-primary), var(--h2-primary-hover))",
            boxShadow: "var(--h2-shadow-action)",
            transition: "transform var(--h2-transition-fast)",
            "&:hover": { transform: checkinDone ? "none" : "translateY(-2px)" },
          }}
        >
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {checkinDone
              ? <IoCheckmarkCircle size={18} color="rgba(255,255,255,0.7)" />
              : <IoHeart size={18} color="#fff" />
            }
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: checkinDone ? "rgba(255,255,255,0.7)" : "#fff", flex: 1 }}>
            {checkinDone ? "Check-in realizado" : "Fazer Check-in"}
          </Typography>
          {!checkinDone && <IoChevronForward size={16} color="rgba(255,255,255,0.6)" />}
        </Card>

        {/* Tooltip balloon */}
        {showTooltip && (
          <Box sx={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            mt: 1, px: 2, py: 1, borderRadius: "10px",
            bgcolor: "var(--h2-text)", color: "#fff", fontSize: 13, fontWeight: 500,
            whiteSpace: "nowrap", zIndex: 10,
            animation: "h2-fade-slide-up 0.25s var(--h2-ease)",
            "&::before": {
              content: '""', position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
              borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
              borderBottom: "6px solid var(--h2-text)",
            },
          }}>
            Voc\u00ea j\u00e1 realizou o check-in de hoje
          </Box>
        )}
      </Box>

      {/* ── Row 2: Equilíbrio + Dimensões + Aderência ── */}
        <div className="h2-col-4">
          <Card sx={{
            p: 3, height: "100%", display: "flex", flexDirection: "column",
            animation: "h2-fade-slide-up 0.5s var(--h2-ease) 0.2s both",
          }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#7A7A7A", textTransform: "uppercase", letterSpacing: 1 }}>
                Equilíbrio Geral
              </Typography>
              <Box sx={{
                px: 1.2, py: 0.3, borderRadius: "8px",
                bgcolor: eqGeral >= 7 ? "#ECFDF5" : eqGeral >= 5 ? "#FFFBEB" : "#FEE2E2",
              }}>
                <Typography sx={{
                  fontSize: 12, fontWeight: 700,
                  color: eqGeral >= 7 ? "#10B981" : eqGeral >= 5 ? "#F59E0B" : "#EF4444",
                }}>
                  {eqGeral >= 7 ? "Bom" : eqGeral >= 5 ? "Regular" : "Baixo"}
                </Typography>
              </Box>
            </Box>

            {/* Score + Ring centered */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, gap: 3 }}>
              {/* Left: big number */}
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: { xs: 36, md: 48 }, fontWeight: 700, color: "#1A1A1A", lineHeight: 1 }}>
                  {eqGeral.toFixed(1)}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#7A7A7A", mt: 0.3 }}>de 10</Typography>
              </Box>

              {/* Right: gauge arc */}
              <Box sx={{ position: "relative", width: 100, height: 100 }}>
                <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#E6F1F6" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={eqGeral >= 7 ? "#10B981" : eqGeral >= 5 ? "#F59E0B" : "#EF4444"}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - eqGeral / 10)}
                    style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                  />
                </svg>
                {/* Center value */}
                <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: eqGeral >= 7 ? "#10B981" : eqGeral >= 5 ? "#F59E0B" : "#EF4444" }}>
                    {(eqGeral * 10).toFixed(0)}%
                  </Typography>
                </Box>
              </Box>
            </Box>

          </Card>
        </div>

        {/* Dimensões — 3 mini cards */}
        <div className="h2-col-4">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "100%" }}>
            <Box sx={{ flex: 1, animation: "h2-fade-slide-up 0.5s var(--h2-ease) 0.25s both" }}>
              <DimensionCard label="Sono" value={eqSono} color="var(--h2-primary)"
                icon={<IoMoon size={16} color="var(--h2-primary)" />} />
            </Box>
            <Box sx={{ flex: 1, animation: "h2-fade-slide-up 0.5s var(--h2-ease) 0.3s both" }}>
              <DimensionCard label="Atividade Física" value={eqAtividade} color="var(--h2-success)"
                icon={<IoFitness size={16} color="var(--h2-success)" />} />
            </Box>
            <Box sx={{ flex: 1, animation: "h2-fade-slide-up 0.5s var(--h2-ease) 0.35s both" }}>
              <DimensionCard label="Alimentação" value={eqAlimentacao} color="var(--h2-warning)"
                icon={<IoWater size={16} color="var(--h2-warning)" />} />
            </Box>
          </Box>
        </div>

        {/* Aderência ao Protocolo */}
        <div className="h2-col-4">
          <Card sx={{
            borderRadius: "var(--h2-radius)", p: 3, height: "100%", display: "flex", flexDirection: "column",
            animation: "h2-fade-slide-up 0.5s var(--h2-ease) 0.3s both",
            background: "linear-gradient(145deg, #15304f 0%, #1e3a5f 40%, #2d4a6f 100%)",
            border: "none", boxShadow: "var(--h2-shadow-lg)",
          }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 1.2 }}>
                Aderência ao Protocolo
              </Typography>
              <Box sx={{ px: 1.4, py: 0.4, borderRadius: "10px", bgcolor: aderencia.percentual >= 80 ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.12)" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: aderencia.percentual >= 80 ? "#34D399" : "#fff" }}>
                  {aderencia.percentual}%
                </Typography>
              </Box>
            </Box>

            {/* Big number + label */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8 }}>
                <Typography sx={{ fontSize: { xs: 32, md: 42 }, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                  {aderencia.realizado}
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>
                  / {aderencia.meta} dias
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)", mt: 0.5 }}>
                check-ins realizados no período
              </Typography>
            </Box>

            {/* Days grid */}
            <Box sx={{ display: "flex", gap: "5px", flexWrap: "wrap", mb: 2, overflow: "hidden" }}>
              {Array.from({ length: aderencia.meta }, (_, i) => {
                const filled = i < aderencia.realizado;
                return (
                  <Box key={i} sx={{
                    width: { xs: 24, md: 30 }, height: { xs: 24, md: 30 }, borderRadius: "8px",
                    bgcolor: filled ? "rgba(16,185,129,0.85)" : "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "transform 0.2s ease",
                    "&:hover": { transform: "scale(1.12)" },
                  }}>
                    {filled && (
                      <svg width="13" height="13" viewBox="0 0 12 12">
                        <path d="M2 6 L5 9 L10 3" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Bottom: progress bar + mini chart */}
            <Box sx={{ mt: "auto" }}>
              {/* Progress bar */}
              <Box sx={{ width: "100%", height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.1)", mb: 1.5, overflow: "hidden" }}>
                <Box sx={{
                  width: `${aderencia.percentual}%`, height: "100%", borderRadius: 2,
                  background: "linear-gradient(90deg, #10B981, #34D399)",
                  transition: "width 1s ease",
                }} />
              </Box>

              {/* Stats row */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Realizados
                    </Typography>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#34D399" }}>
                      {aderencia.realizado}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Pendentes
                    </Typography>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                      {aderencia.meta - aderencia.realizado}
                    </Typography>
                  </Box>
                </Box>

                {/* Mini bar chart */}
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: "3px", height: 32 }}>
                  {Array.from({ length: aderencia.meta }, (_, i) => {
                    const filled = i < aderencia.realizado;
                    const h = filled ? 14 + ((i * 7 + 3) % 18) : 5;
                    return (
                      <Box key={i} sx={{
                        width: 5, borderRadius: "2.5px", height: h,
                        bgcolor: filled ? "rgba(16,185,129,0.7)" : "rgba(255,255,255,0.1)",
                      }} />
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Card>
        </div>

      {/* ── Row 3: Quick links (col-12 wrapper, inner 3-col layout) ── */}
      <div className="h2-col-12" style={{ animation: "h2-fade-slide-up 0.5s var(--h2-ease) 0.4s both" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {[
            { label: "Fazer Check-in", path: "/checkin-diarios", chip: "h2-icon-chip--navy",   icon: <IoHeart size={18} />, desktopOnly: true },
            { label: "Plano Alimentar", path: "/lifestyle/alimentacao", chip: "h2-icon-chip--orange", icon: <IoWater size={18} /> },
            { label: "Exercícios",      path: "/lifestyle/exercicio-fisico", chip: "h2-icon-chip--mint", icon: <IoFitness size={18} /> },
          ].map((link) => (
            <Card
              key={link.path}
              component={Link}
              to={link.path}
              sx={{
                p: 2, display: link.desktopOnly ? { xs: "none", md: "flex" } : "flex",
                alignItems: "center", gap: 1.5,
                textDecoration: "none", cursor: "pointer",
              }}
            >
              <span className={`h2-icon-chip ${link.chip}`}>{link.icon}</span>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "var(--h2-text)", flex: 1 }}>
                {link.label}
              </Typography>
              <IoChevronForward size={16} color="var(--h2-text-muted)" />
            </Card>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
