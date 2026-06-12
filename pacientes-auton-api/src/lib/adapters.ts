/**
 * Adaptadores: convertem os domínios JSONB de `solucao` (formato do sistema do
 * médico) para os shapes EXATOS que as telas do app do paciente já consomem.
 *
 * Observados no banco real (mtjgjvwpjwwmnebdholz):
 *  - refeicao:      { ref_1..ref_4: { principal:[{alimento,gramas,kcal,categoria}],
 *                                     substituicoes:{proteinas,carboidratos,gorduras,leguminosas} }, paciente }
 *  - suplementacao: { suplementos, fitoterapicos, homeopatia, florais_bach } — cada um é TEXTO semi-estruturado
 *  - mentalidade:   { padrao_01..padrao_10, resumo_executivo } (padrão = objeto rico)
 *  - treinos:       { status, mensagem, exercicios[], nome_treino, grupos_musculares, ... }
 *  - itens_visiveis:{ livro_vida, alimentacao, treinamentos, suplementacao } (booleans do médico)
 */

type Json = any;

/* ───────────────── Visibilidade (controlada pelo médico) ───────────────── */

/** Módulo é visível salvo se o médico marcou explicitamente como false. */
export function moduloVisivel(itensVisiveis: Json, chave: string): boolean {
  if (!itensVisiveis || typeof itensVisiveis !== "object") return true;
  return itensVisiveis[chave] !== false;
}

/* ───────────────── Alimentação ───────────────── */

/**
 * refeicao = objeto { ref_1..ref_N }. Tolera embrulho legado [{ content: {...} }]
 * ou { content: {...} } e devolve TODAS as refeições (posicional, N variável).
 */
export function adaptRefeicao(refeicao: Json) {
  let r = refeicao;
  if (Array.isArray(r)) r = r[0]?.content ?? r[0] ?? null;
  else if (r?.content && typeof r.content === "object" && Object.keys(r.content).some((k) => /^ref_\d+$/.test(k))) {
    r = r.content;
  }
  if (!r || typeof r !== "object") return null;

  const out: Record<string, Json> = {};
  for (const k of Object.keys(r)) {
    if (/^ref_\d+$/.test(k) && r[k]) out[k] = r[k];
  }
  return Object.keys(out).length ? out : null;
}

/* ───────────────── Suplementos ───────────────── */

/**
 * Cada categoria de suplementacao é um TEXTO com rótulos fixos. Extrai os campos
 * que a tela Suplementos lê (nome, objetivo, dosagem, horario, data_inicio,
 * data_fim, alertas_criticos); mantém o texto original em `descricao`.
 */
function parseSuplementoTexto(texto: string, categoria: string) {
  const t = (texto ?? "").trim();
  if (!t) return null;

  const between = (re: RegExp) => {
    const m = t.match(re);
    return m ? m[1].trim().replace(/[.;,\s]+$/, "") : "";
  };

  return {
    nome: (t.split(":")[0] ?? "").trim(),
    objetivo: between(/^[^:]*:\s*([\s\S]*?)(?:Dosagem:|Hor[áa]rio:|In[íi]cio:|T[ée]rmino:|$)/i),
    dosagem: between(/Dosagem:\s*([\s\S]*?)(?:Hor[áa]rio:|In[íi]cio:|T[ée]rmino:|$)/i),
    horario: between(/Hor[áa]rio:\s*([\s\S]*?)(?:In[íi]cio:|T[ée]rmino:|$)/i),
    data_inicio: between(/In[íi]cio:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i),
    data_fim: between(/T[ée]rmino:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i),
    categoria,
    alertas_criticos: "",
    descricao: t,
  };
}

/** Normaliza um item já estruturado para o shape que a tela lê (com aliases de campo). */
function normalizarItemSuplemento(it: Json, categoria: string) {
  if (!it || typeof it !== "object") {
    return { nome: String(it ?? ""), objetivo: "", dosagem: "", horario: "", data_inicio: "", data_fim: "", categoria, alertas_criticos: "", descricao: "" };
  }
  return {
    nome: it.nome ?? it.name ?? "",
    objetivo: it.objetivo ?? it.finalidade ?? "",
    dosagem: it.dosagem ?? it.dose ?? "",
    horario: it.horario ?? it.horarios ?? "",
    data_inicio: it.data_inicio ?? it.inicio ?? "",
    data_fim: it.data_fim ?? it.termino ?? it.fim ?? "",
    categoria: it.categoria ?? categoria,
    alertas_criticos: it.alertas_criticos ?? it.alertas ?? "",
    descricao: it.descricao ?? "",
  };
}

/**
 * Cada categoria pode vir como: array de objetos, objeto único, string JSON
 * (ex: '[{"nome":...}]') ou texto corrido com rótulos. Cobre todos os casos.
 */
function adaptCategoriaSuplemento(valor: Json, categoria: string) {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor.map((it) => normalizarItemSuplemento(it, categoria));
  if (typeof valor === "object") return [normalizarItemSuplemento(valor, categoria)];
  if (typeof valor === "string") {
    const t = valor.trim();
    if (!t) return [];
    if (t.startsWith("[") || t.startsWith("{")) {
      try {
        const parsed = JSON.parse(t);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.map((it) => normalizarItemSuplemento(it, categoria));
      } catch {
        /* não era JSON válido — cai pro parser de texto */
      }
    }
    const item = parseSuplementoTexto(t, categoria);
    return item ? [item] : [];
  }
  return [];
}

export function adaptSuplementacao(suplementacao: Json) {
  const s = suplementacao ?? {};
  return {
    suplementos: adaptCategoriaSuplemento(s.suplementos, "Suplemento"),
    fitoterapicos: adaptCategoriaSuplemento(s.fitoterapicos, "Fitoterápico"),
    homeopatia: adaptCategoriaSuplemento(s.homeopatia, "Homeopatia"),
    florais_bach: adaptCategoriaSuplemento(s.florais_bach, "Floral de Bach"),
  };
}

/* ───────────────── Livro da Vida (mentalidade) ───────────────── */

const PRIORIDADE_LABEL: Record<number, string> = { 1: "alta", 2: "média", 3: "baixa" };

/** resumo_executivo vem como string, objeto {mensagem_personalizada} ou string com JSON embutido. */
function extrairResumo(re: Json): string {
  if (!re) return "";
  if (typeof re === "object") return re.mensagem_personalizada ?? re.texto ?? re.resumo ?? "";
  if (typeof re === "string") {
    const t = re.trim();
    const i = t.indexOf("{");
    if (i >= 0 && t.includes("mensagem_personalizada")) {
      try {
        const obj = JSON.parse(t.slice(i));
        return obj.mensagem_personalizada ?? obj.texto ?? obj.resumo ?? t;
      } catch {
        /* mantém a string original */
      }
    }
    return t;
  }
  return String(re);
}

function adaptPadrao(p: Json) {
  if (!p || typeof p !== "object") return null;

  // A tela lê padrao.origens (array de strings) — juntamos origem + conexões.
  const origens: string[] = [];
  if (p.origem_estimada && typeof p.origem_estimada === "object") {
    if (p.origem_estimada.periodo) origens.push(`Origem (${p.origem_estimada.periodo})`);
    if (p.origem_estimada.contexto_provavel) origens.push(String(p.origem_estimada.contexto_provavel));
  }
  if (p.conexoes_padroes && typeof p.conexoes_padroes === "object") {
    if (p.conexoes_padroes.explicacao) origens.push(String(p.conexoes_padroes.explicacao));
    for (const r of p.conexoes_padroes.raiz_de ?? []) origens.push(`Raiz de: ${r}`);
    for (const r of p.conexoes_padroes.relacionado_com ?? []) origens.push(`Relacionado com: ${r}`);
  }

  // A tela lê padrao.orientacoes (array de strings).
  const orientacoes = (p.orientacoes_transformacao ?? []).map((o: Json) =>
    typeof o === "string" ? o : [o?.o_que_fazer, o?.como_fazer].filter(Boolean).join(" — ")
  );

  return {
    nome: p.padrao ?? "",
    subtitulo: Array.isArray(p.categorias) ? p.categorias.join(", ") : "",
    prioridade: PRIORIDADE_LABEL[p.prioridade] ?? String(p.prioridade ?? ""),
    manifestacoes: Array.isArray(p.manifestacoes_atuais) ? p.manifestacoes_atuais : [],
    origens,
    orientacoes,
  };
}

export function adaptMentalidade(mentalidade: Json) {
  const m = mentalidade ?? {};
  const padroes = [];
  for (let i = 1; i <= 10; i++) {
    const adaptado = adaptPadrao(m[`padrao_${String(i).padStart(2, "0")}`]);
    if (adaptado) padroes.push(adaptado);
  }

  // higiene_sono: a tela mostra o horário/duração RECOMENDADOS — preferimos os
  // campos meta_* (alvo); caímos no padrão atual só se a meta não existir.
  const hs = m.higiene_sono;
  const higiene_sono =
    hs && typeof hs === "object"
      ? {
          horario_dormir: hs.meta_horario_dormir ?? hs.horario_dormir_recomendado ?? hs.horario_dormir ?? "",
          horario_acordar: hs.meta_horario_acordar ?? hs.horario_acordar_recomendado ?? hs.horario_acordar ?? "",
          duracao: hs.meta_duracao ?? hs.duracao ?? hs.duracao_media ?? hs.duracao_ideal_horas ?? hs.duracao_alvo ?? "",
          orientacoes: Array.isArray(hs.orientacoes) ? hs.orientacoes : [],
        }
      : null;

  return {
    resumo_executivo: extrairResumo(m.resumo_executivo),
    padroes,
    higiene_sono,
  };
}

/* ───────────────── Exercício (treinos) ───────────────── */

/**
 * `treinos` é um envelope com status. Quando não gerado (ex.: "aguardando_anamnese"),
 * exercicios vem null. O shape interno de cada exercício será confirmado quando
 * houver dado real — por ora mapeamos defensivamente.
 */
export function adaptTreinos(treinos: Json) {
  const t = treinos ?? {};
  const exercicios = Array.isArray(t.exercicios) ? t.exercicios : [];
  return {
    status: t.status ?? (exercicios.length ? "ok" : "vazio"),
    mensagem: t.mensagem ?? null,
    nome_treino: t.nome_treino ?? null,
    grupos_musculares: t.grupos_musculares ?? null,
    duracao_estimada: t.duracao_estimada ?? null,
    total_dias: t.total_dias ?? null,
    dia_atual: t.dia_atual ?? null,
    alertas_importantes: Array.isArray(t.alertas_importantes) ? t.alertas_importantes : [],
    exercicios,
  };
}
