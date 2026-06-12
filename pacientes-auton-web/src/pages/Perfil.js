import React, { useState } from "react";
import {
  Box, Typography, Card, Grid, TextField, Button, CircularProgress, Alert, IconButton,
} from "@mui/material";
import { IoPerson, IoLockClosed, IoCreate } from "react-icons/io5";
import { usePaciente } from "../hooks/usePaciente";
import { supabase } from "../lib/supabase-client";

function formatPhone(value) {
  const d = String(value).replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("pt-BR");
}

const fieldBoxSx = {
  backgroundColor: "#F0F6FA",
  borderRadius: "10px",
  p: 2,
  mb: 1.5,
};

export default function Perfil() {
  const { paciente } = usePaciente();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nome: paciente?.nome || "",
    telefone: paciente?.telefone || "",
    data_nascimento: paciente?.data_nascimento || "",
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaLoading, setSenhaLoading] = useState(false);
  const [senhaMsg, setSenhaMsg] = useState(null);

  const handleEdit = () => {
    setForm({
      nome: paciente?.nome || "",
      telefone: paciente?.telefone || "",
      data_nascimento: paciente?.data_nascimento || "",
    });
    setEditMode(true);
    setSaveMsg(null);
  };

  const handleCancel = () => {
    setEditMode(false);
    setSaveMsg(null);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveMsg(null);
    try {
      // Mock save
      await new Promise((r) => setTimeout(r, 800));
      setSaveMsg({ type: "success", text: "Dados atualizados com sucesso!" });
      setEditMode(false);
    } catch {
      setSaveMsg({ type: "error", text: "Erro ao salvar dados." });
    }
    setSaveLoading(false);
  };

  const handleChangePassword = async () => {
    setSenhaMsg(null);
    if (senha.length < 6) {
      setSenhaMsg({ type: "error", text: "A senha deve ter no mínimo 6 caracteres." });
      return;
    }
    if (senha !== confirmarSenha) {
      setSenhaMsg({ type: "error", text: "As senhas não coincidem." });
      return;
    }
    setSenhaLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      setSenhaMsg({ type: "success", text: "Senha alterada com sucesso!" });
      setSenha("");
      setConfirmarSenha("");
    } catch {
      setSenhaMsg({ type: "error", text: "Erro ao alterar senha." });
    }
    setSenhaLoading(false);
  };

  return (
    <Box className="fade-in" sx={{ fontFamily: "Inter, sans-serif" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: "#1A1A1A", mb: 3, fontSize: { xs: "1.4rem", md: "2.125rem" } }}>
        Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* Card 1: Dados Pessoais */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: "#FFFFFF", border: "1px solid #C4D9E5", borderRadius: "16px", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <IoPerson style={{ color: "#1B4266", fontSize: "1.5rem" }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#1A1A1A", fontSize: "1.3rem" }}>
                Meu Perfil
              </Typography>
            </Box>

            {saveMsg && (
              <Alert severity={saveMsg.type} sx={{ mb: 2 }}>
                {saveMsg.text}
              </Alert>
            )}

            {!editMode ? (
              <>
                <Box sx={fieldBoxSx}>
                  <Typography variant="caption" sx={{ color: "#7A7A7A" }}>Nome</Typography>
                  <Typography variant="body1" sx={{ color: "#1A1A1A" }}>{paciente?.nome || "—"}</Typography>
                </Box>
                <Box sx={fieldBoxSx}>
                  <Typography variant="caption" sx={{ color: "#7A7A7A" }}>Email</Typography>
                  <Typography variant="body1" sx={{ color: "#1A1A1A" }}>{paciente?.email || "—"}</Typography>
                </Box>
                <Box sx={fieldBoxSx}>
                  <Typography variant="caption" sx={{ color: "#7A7A7A" }}>Telefone</Typography>
                  <Typography variant="body1" sx={{ color: "#1A1A1A" }}>
                    {paciente?.telefone ? formatPhone(paciente.telefone) : "—"}
                  </Typography>
                </Box>
                <Box sx={fieldBoxSx}>
                  <Typography variant="caption" sx={{ color: "#7A7A7A" }}>Data de Nascimento</Typography>
                  <Typography variant="body1" sx={{ color: "#1A1A1A" }}>
                    {formatDate(paciente?.data_nascimento)}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<IoCreate />}
                  onClick={handleEdit}
                  sx={{
                    mt: 1,
                    borderColor: "#1B4266",
                    color: "#1B4266",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "10px",
                  }}
                >
                  Editar
                </Button>
              </>
            ) : (
              <>
                <TextField
                  label="Nome"
                  fullWidth
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Telefone"
                  fullWidth
                  value={formatPhone(form.telefone)}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value.replace(/\D/g, "") })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Data de Nascimento"
                  fullWidth
                  type="date"
                  value={form.data_nascimento}
                  onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSave}
                    disabled={saveLoading}
                    sx={{
                      backgroundColor: "#1B4266",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: "10px",
                      py: 1.3,
                      "&:hover": { backgroundColor: "#153550" },
                    }}
                  >
                    {saveLoading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Salvar"}
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleCancel}
                    sx={{
                      borderColor: "#C4D9E5",
                      color: "#5B5B5B",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: "10px",
                      py: 1.3,
                    }}
                  >
                    Cancelar
                  </Button>
                </Box>
              </>
            )}
          </Card>
        </Grid>

        {/* Card 2: Segurança */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: "#FFFFFF", border: "1px solid #C4D9E5", borderRadius: "16px", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <IoLockClosed style={{ color: "#1B4266", fontSize: "1.5rem" }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#1A1A1A", fontSize: "1.3rem" }}>
                Alterar Senha
              </Typography>
            </Box>

            {senhaMsg && (
              <Alert severity={senhaMsg.type} sx={{ mb: 2 }}>
                {senhaMsg.text}
              </Alert>
            )}

            <TextField
              label="Nova senha"
              type="password"
              fullWidth
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Confirmar nova senha"
              type="password"
              fullWidth
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleChangePassword}
              disabled={senhaLoading}
              sx={{
                backgroundColor: "#1B4266",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "10px",
                py: 1.5,
                "&:hover": { backgroundColor: "#153550" },
              }}
            >
              {senhaLoading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Alterar Senha"}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
