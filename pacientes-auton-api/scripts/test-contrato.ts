/**
 * Self-test do contrato: alimenta os adaptadores com os SHAPES que prometemos
 * ao sistema do médico (RESPOSTA_CONTRATO_MEDICO.md) e confere a saída.
 * Não toca no banco. Roda: npx tsx scripts/test-contrato.ts
 */
import { adaptTreinos, adaptMentalidade, adaptSuplementacao, adaptRefeicao } from "@/lib/adapters";

let falhas = 0;
const check = (nome: string, cond: boolean, extra?: unknown) => {
  console.log(`${cond ? "✅" : "❌"} ${nome}${extra !== undefined ? "  → " + JSON.stringify(extra) : ""}`);
  if (!cond) falhas++;
};

// ── Q1: treino prescrito com 2 treinos (A/B) num único exercicios[] ──
const treino = {
  status: "prescrito",
  exercicios: [
    { nome_treino: "Treino A", nome: "Supino reto", grupo_muscular: "Peitoral", series: 4, repeticoes: "10-12", descanso: "60s", observacoes: "cotovelo 45°" },
    { nome_treino: "Treino A", nome: "Crucifixo", grupo_muscular: "Peitoral", series: 3, repeticoes: "12", descanso: "45s", observacoes: "" },
    { nome_treino: "Treino B", nome: "Agachamento", grupo_muscular: "Pernas", series: 4, repeticoes: "10", descanso: "90s", observacoes: "" },
  ],
};
const t = adaptTreinos(treino);
check("treino.status passa", t.status === "prescrito", t.status);
check("treino.exercicios = 3", t.exercicios.length === 3);
check("exercicio[0].nome_treino preservado (p/ agrupar A/B)", t.exercicios[0].nome_treino === "Treino A");

// ── Q2: higiene_sono no shape canônico ──
const ment = {
  resumo_executivo: "Resumo ok",
  padrao_01: { padrao: "P1", prioridade: 1, manifestacoes_atuais: ["m1"], orientacoes_transformacao: [{ o_que_fazer: "x", como_fazer: "y" }] },
  higiene_sono: { horario_dormir: "22:30", horario_acordar: "06:30", duracao: "8h", orientacoes: ["Luz baixa", "Sem telas 21h"] },
};
const m = adaptMentalidade(ment);
check("higiene_sono.horario_dormir", m.higiene_sono?.horario_dormir === "22:30");
check("higiene_sono.duracao", m.higiene_sono?.duracao === "8h");
check("higiene_sono.orientacoes = 2", (m.higiene_sono?.orientacoes?.length ?? 0) === 2);
check("padrao[0].orientacoes mapeado", m.padroes[0]?.orientacoes?.[0] === "x — y", m.padroes[0]?.orientacoes);

// ── Aliases de higiene_sono (formato _recomendado) ──
const m2 = adaptMentalidade({ higiene_sono: { horario_dormir_recomendado: "23:00", horario_acordar_recomendado: "07:00", duracao_ideal_horas: 8, orientacoes: [] } });
check("higiene_sono aceita aliases _recomendado", m2.higiene_sono?.horario_dormir === "23:00" && m2.higiene_sono?.duracao === 8, m2.higiene_sono);

// ── Q-suplementos: array de objetos (formato ideal consolidado) ──
const supl = {
  suplementos: [{ nome: "Vitamina D3", objetivo: "Imunidade", dosagem: "2000 UI", horario: "08:00", data_inicio: "06/06/2026", data_fim: "06/09/2026" }],
  fitoterapicos: [], homeopatia: [], florais_bach: [],
};
const s = adaptSuplementacao(supl);
check("suplemento[0].nome", s.suplementos[0]?.nome === "Vitamina D3");
check("suplemento[0].data_inicio (nome que a tela lê)", s.suplementos[0]?.data_inicio === "06/06/2026", s.suplementos[0]);

// ── Alimentação: desembrulha [{content}] + ref_N (N variável) ──
const ref = adaptRefeicao([{ content: { ref_1: { principal: [{ alimento: "Ovos", gramas: "120g" }] }, ref_5: { principal: [] } } }]);
check("adaptRefeicao desembrulha content + suporta ref_N", !!ref && !!ref.ref_1 && !!ref.ref_5, ref ? Object.keys(ref) : null);

// ── Higiene do sono: prefere meta_* (recomendado) ──
const m3 = adaptMentalidade({
  higiene_sono: { horario_dormir: "01:00", meta_horario_dormir: "22:30", duracao_media: "5h", meta_duracao: "8h", horario_acordar: "06:00", orientacoes: ["x"] },
});
check("higiene_sono usa meta_horario_dormir (recomendado)", m3.higiene_sono?.horario_dormir === "22:30", m3.higiene_sono?.horario_dormir);
check("higiene_sono.duracao usa meta_duracao", m3.higiene_sono?.duracao === "8h", m3.higiene_sono?.duracao);

// ── Suplementação: categoria como string (legado) não quebra ──
const sLeg = adaptSuplementacao({ suplementos: "Magnésio 400mg: relaxa. Dosagem: 1x. Horário: noite." });
check("suplementação string-legado vira 1 item (não quebra)", sLeg.suplementos.length === 1 && !!sLeg.suplementos[0].nome, sLeg.suplementos[0]?.nome);

console.log(falhas === 0 ? "\n🎉 Todos os shapes prometidos passam pelos adaptadores." : `\n⚠️ ${falhas} falha(s).`);
process.exit(falhas === 0 ? 0 : 1);
