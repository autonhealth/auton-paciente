/** Paciente autenticado, resolvido SEMPRE a partir do JWT verificado (nunca do client). */
export type PacienteAutenticado = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  dataNascimento: string | null;
  cpf: string | null;
  genero: string | null;
  cidade: string | null;
  estado: string | null;
  fotoPerfil: string | null;
  usuarioAuth: string | null;
};
