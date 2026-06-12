/**
 * Smoke test do pipeline de dados real (service_role). Roda: npm run smoke
 * Prova: conexão Supabase + buscarUltimaSolucao + os 4 adaptadores, contra um
 * paciente que tem solução de verdade.
 */
import { supabaseAdmin } from "@/lib";
import { buscarUltimaSolucao } from "@/services/paciente.service";
import {
  adaptRefeicao,
  adaptSuplementacao,
  adaptMentalidade,
  adaptTreinos,
} from "@/lib/adapters";

// Paciente de teste: arg da linha de comando ou default (Igor Sebastiao, ativo + dados).
const PACIENTE_COM_SOLUCAO = process.argv[2] || "bf90857e-3394-4db6-a778-990449ea2468";

async function main() {
  // 1. Conexão
  const ping = await supabaseAdmin.from("pacientes").select("id").limit(1);
  console.log("1) Conexão Supabase:", ping.error ? `ERRO: ${ping.error.message}` : "OK ✅");

  // 2. Solução + adaptadores
  const sol = (await buscarUltimaSolucao(PACIENTE_COM_SOLUCAO)) as any;
  if (!sol) {
    console.log("2) Sem solução para o paciente de teste");
    return;
  }
  console.log("2) itens_visiveis:", JSON.stringify(sol.itensVisiveis));

  const refeicao: any = adaptRefeicao(sol.refeicao);
  const refsComDados = refeicao ? ["ref_1", "ref_2", "ref_3", "ref_4"].filter((k) => refeicao[k]).length : 0;
  console.log("3) Alimentação:", refsComDados, "refeições com dados");

  const supl = adaptSuplementacao(sol.suplementacao);
  console.log("4) Suplementos por categoria:", {
    suplementos: supl.suplementos.length,
    fitoterapicos: supl.fitoterapicos.length,
    homeopatia: supl.homeopatia.length,
    florais_bach: supl.florais_bach.length,
  });
  const s0: any = supl.suplementos[0];
  if (s0) console.log("   → suplemento[0]:", { nome: s0.nome, dosagem: s0.dosagem, horario: s0.horario, data_inicio: s0.data_inicio, data_fim: s0.data_fim });

  const ment = adaptMentalidade(sol.mentalidade);
  console.log("5) Livro da Vida:", ment.padroes.length, "padrões | resumo:", String(ment.resumo_executivo).slice(0, 50) + "...");
  const p0: any = ment.padroes[0];
  if (p0) console.log("   → padrão[0]:", { nome: String(p0.nome).slice(0, 40), prioridade: p0.prioridade, manifestacoes: p0.manifestacoes.length, origens: p0.origens.length, orientacoes: p0.orientacoes.length });

  const treinos = adaptTreinos(sol.treinos);
  console.log("6) Exercício:", { status: treinos.status, exercicios: treinos.exercicios.length });

  console.log("\n✅ Pipeline de dados real OK — service_role lê e adaptadores entregam o shape do front.");
}

main()
  .catch((e) => {
    console.error("ERRO:", e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
