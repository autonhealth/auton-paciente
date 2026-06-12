import React, { useEffect, useState } from "react";
import {
  Box, Typography, Card, Grid, CircularProgress, Chip, Collapse, Divider, IconButton,
} from "@mui/material";
import { IoBook, IoChevronDown, IoCheckmarkCircle, IoMoon, IoSunny, IoTime } from "react-icons/io5";
import { usePaciente } from "../hooks/usePaciente";
import { buscarLivroDaVida } from "../lib/livro-da-vida";

const PRIORITY_COLORS = { alta: "#EF4444", "média": "#F59E0B", baixa: "#10B981" };

export default function LivroDaVida() {
  const { paciente } = usePaciente();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!paciente?.id) return;
    buscarLivroDaVida(paciente.id).then((data) => {
      setDados(data);
      setLoading(false);
    });
  }, [paciente?.id]);

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#21E6D6" }} />
      </Box>
    );
  }

  if (!dados) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography sx={{ color: "#5B5B5B" }}>Nenhum dado encontrado.</Typography>
      </Box>
    );
  }

  return (
    <Box className="fade-in" sx={{ fontFamily: "Inter, sans-serif", p: { xs: 1.5, sm: 3 }, backgroundColor: "#EBF3F6", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: "#1A1A1A", mb: 3, fontSize: { xs: "1.4rem", md: "2.125rem" } }}>
        Livro da Vida
      </Typography>

      {/* Executive Summary */}
      {dados.resumo_executivo && (
        <Card
          sx={{
            backgroundColor: "#E6FFFE",
            border: "1px solid #21E6D6",
            borderRadius: "16px",
            p: { xs: 2, sm: 3 },
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <IoBook style={{ color: "#21E6D6", fontSize: "1.5rem" }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1A1A1A", fontSize: { xs: "1rem", md: "1.5rem" } }}>
              Resumo Executivo
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: "#1A1A1A", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {dados.resumo_executivo}
          </Typography>
        </Card>
      )}

      {/* Patterns */}
      {dados.padroes && dados.padroes.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1A1A1A", mb: 2, fontSize: "1.4rem" }}>
            Padrões Identificados
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {dados.padroes.map((padrao, idx) => {
              const isExpanded = expandedId === idx;
              const priorityColor = PRIORITY_COLORS[padrao.prioridade?.toLowerCase()] || "#F59E0B";
              return (
                <Card
                  key={idx}
                  sx={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #C4D9E5",
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                >
                  {/* Header */}
                  <Box
                    onClick={() => toggleExpand(idx)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2.5,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#F8FBFC" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, flexWrap: "wrap" }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: "#1A1A1A", fontSize: "1rem", wordBreak: "break-word" }}>
                        {padrao.nome}
                      </Typography>
                      {padrao.prioridade && (
                        <Chip
                          label={padrao.prioridade}
                          size="small"
                          sx={{
                            backgroundColor: priorityColor,
                            color: "#FFFFFF",
                            fontWeight: 600,
                            fontFamily: "Inter, sans-serif",
                            fontSize: "0.7rem",
                          }}
                        />
                      )}
                    </Box>
                    <IconButton size="small">
                      <IoChevronDown
                        style={{
                          color: "#5B5B5B",
                          transition: "transform 0.3s",
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </IconButton>
                  </Box>

                  {/* Expanded Content */}
                  <Collapse in={isExpanded}>
                    <Box sx={{ px: 2.5, pb: 2.5 }}>
                      {/* Manifestações */}
                      {padrao.manifestacoes && padrao.manifestacoes.length > 0 && (
                        <>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1A1A1A", mb: 1 }}>
                            Manifestações
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            {padrao.manifestacoes.map((m, i) => (
                              <Typography key={i} variant="body2" sx={{ color: "#5B5B5B", mb: 0.3 }}>
                                • {m}
                              </Typography>
                            ))}
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                        </>
                      )}

                      {/* Origens e Conexões */}
                      {padrao.origens && padrao.origens.length > 0 && (
                        <>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1A1A1A", mb: 1 }}>
                            Origens e Conexões
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            {padrao.origens.map((o, i) => (
                              <Typography key={i} variant="body2" sx={{ color: "#5B5B5B", mb: 0.3 }}>
                                • {o}
                              </Typography>
                            ))}
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                        </>
                      )}

                      {/* Orientações de Transformação */}
                      {padrao.orientacoes && padrao.orientacoes.length > 0 && (
                        <>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1A1A1A", mb: 1 }}>
                            Orientações de Transformação
                          </Typography>
                          <Box>
                            {padrao.orientacoes.map((o, i) => (
                              <Typography key={i} variant="body2" sx={{ color: "#5B5B5B", mb: 0.3 }}>
                                {i + 1}. {o}
                              </Typography>
                            ))}
                          </Box>
                        </>
                      )}
                    </Box>
                  </Collapse>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Sleep Hygiene */}
      {dados.higiene_sono && (
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1A1A1A", mb: 2, fontSize: "1.4rem" }}>
            Higiene do Sono
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { icon: <IoMoon style={{ color: "#1B4266", fontSize: "2rem" }} />, value: dados.higiene_sono.horario_dormir, label: "Dormir" },
              { icon: <IoSunny style={{ color: "#1B4266", fontSize: "2rem" }} />, value: dados.higiene_sono.horario_acordar, label: "Acordar" },
              { icon: <IoTime style={{ color: "#1B4266", fontSize: "2rem" }} />, value: dados.higiene_sono.duracao, label: "Duração" },
            ].map((card, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card
                  sx={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #C4D9E5",
                    borderRadius: "16px",
                    p: 3,
                    textAlign: "center",
                  }}
                >
                  {card.icon}
                  <Typography variant="h3" sx={{ fontWeight: 700, color: "#1B4266", my: 1, fontSize: { xs: "1.4rem", md: "1.8rem" } }}>
                    {card.value || "—"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#5B5B5B" }}>
                    {card.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Orientações */}
          {dados.higiene_sono.orientacoes && dados.higiene_sono.orientacoes.length > 0 && (
            <Card
              sx={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #C4D9E5",
                borderRadius: "16px",
                p: 2.5,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1A1A1A", mb: 1.5 }}>
                Orientações
              </Typography>
              {dados.higiene_sono.orientacoes.map((o, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 0.8 }}>
                  <IoCheckmarkCircle style={{ color: "#10B981", fontSize: "1.2rem", marginTop: 2, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: "#5B5B5B" }}>
                    {o}
                  </Typography>
                </Box>
              ))}
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
}
