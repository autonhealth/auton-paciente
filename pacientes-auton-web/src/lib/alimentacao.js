import { apiGet } from './api';

// Defaults sensatos quando o médico ainda não definiu meta (null = sem meta, nunca 0)
const META_DEFAULTS = { metaAguaMl: 2400, exercicioDuracaoMin: 60, sonoDuracaoHoras: 8 };

function parseMetaAgua(data) {
  if (!data || (data.pilar1_hidratacao_agua_ml_dia != null && data.pilar1_hidratacao_agua_ml_dia === '')) {
    return null;
  }
  const raw = data.pilar1_hidratacao_agua_ml_dia;
  if (raw == null) return null;
  const valor = parseFloat(raw);
  if (Number.isNaN(valor) || valor < 0) return null;
  return valor;
}

export async function buscarHabitosVidaPaciente(pacienteId) {
  // Metas reais de diagnostico.habitos_vida.meta_* (via API). null = sem meta → default.
  try {
    const m = await apiGet('/v1/metas');
    return {
      metaAguaMl: m.meta_agua_ml ?? META_DEFAULTS.metaAguaMl,
      exercicioDuracaoMin: m.meta_exercicio_min ?? META_DEFAULTS.exercicioDuracaoMin,
      sonoDuracaoHoras: m.meta_sono_horas ?? META_DEFAULTS.sonoDuracaoHoras,
    };
  } catch (e) {
    return { ...META_DEFAULTS };
  }
}

export async function buscarMetaAguaPaciente(pacienteId) {
  const h = await buscarHabitosVidaPaciente(pacienteId);
  return h.metaAguaMl;
}

export async function buscarRefeicaoPaciente(pacienteId) {
  // Fonte: solucao.refeicao (via API). Retorna { ref_1..ref_4 } ou null.
  // processarDadosRefeicao() trata null e os nomes ref_1..ref_4.
  const { refeicao } = await apiGet('/v1/alimentacao');
  return refeicao;
}

export async function buscarAlimentacaoPaciente(pacienteId, tentativas = 1) {
  return [];
}

function parseItem(item) {
  if (typeof item === 'string') return { alimento: item, quantidade: '', kcal: 0, categoria: '', observacao: '' };
  if (!item || typeof item !== 'object') return null;
  // gramas pode ser número (100) OU string com unidade ("120g")
  let quantidade = item.quantidade || item.porcao || '';
  if (!quantidade && item.gramas != null && item.gramas !== '') {
    if (typeof item.gramas === 'string') {
      quantidade = item.gramas;
    } else {
      const n = Number(item.gramas);
      quantidade = Number.isNaN(n) ? '' : `${Math.round(n)}g`;
    }
  }
  return {
    alimento: item.alimento || item.nome || item.descricao || '—',
    quantidade,
    kcal: Number(item.kcal) || Number(item.calorias) || 0,
    categoria: item.categoria || '',
    observacao: item.observacao || item.observacoes || '',
  };
}

function parseRefeicaoJsonb(jsonb, nomeRefeicao) {
  if (!jsonb) return null;

  if (typeof jsonb === 'string') {
    try {
      jsonb = JSON.parse(jsonb);
    } catch (e) {
      console.warn('Erro ao parsear refeição JSON:', e);
      return null;
    }
  }

  if (typeof jsonb !== 'object') return null;

  const parseItens = (src) => {
    if (!src) return [];
    if (Array.isArray(src)) {
      return src.map((item) => parseItem(item)).filter(Boolean);
    }
    if (src.itens && Array.isArray(src.itens)) return parseItens(src.itens);
    if (src.alimento) return [parseItem(src)].filter(Boolean);
    return [];
  };

  const principal = jsonb.principal || jsonb.refeicao_principal || jsonb.refeicaoPrincipal;
  const substituicoesRaw = jsonb.substituicoes || jsonb.substituições || jsonb.substituicoes_lista || [];

  const itensPrincipal = principal ? parseItens(principal) : [];

  const ordemCategorias = ['proteinas', 'carboidratos', 'gorduras', 'leguminosas'];
  const substituicoesPorCategoria = {};

  if (substituicoesRaw && typeof substituicoesRaw === 'object' && !Array.isArray(substituicoesRaw)) {
    ordemCategorias.forEach((cat) => {
      const arr = substituicoesRaw[cat];
      substituicoesPorCategoria[cat] = Array.isArray(arr) ? arr.map(parseItem).filter(Boolean) : [];
    });
  }

  const totalKcalPrincipal = itensPrincipal.reduce((acc, i) => acc + (i.kcal || 0), 0);
  const itensSubstFlat = ordemCategorias.flatMap((cat) => substituicoesPorCategoria[cat] || []);
  const totalKcalSubst = itensSubstFlat.reduce((acc, i) => acc + (i.kcal || 0), 0);

  if (itensPrincipal.length === 0 && itensSubstFlat.length === 0) {
    return null;
  }

  return {
    nome: nomeRefeicao,
    refeicaoPrincipal: { itens: itensPrincipal, totalKcal: Math.round(totalKcalPrincipal) },
    substituicoesPorCategoria,
    substituicoes: itensSubstFlat,
    totalKcalSubstituicoes: Math.round(totalKcalSubst),
    totalKcal: Math.round(totalKcalPrincipal || totalKcalSubst),
  };
}

export function processarDadosRefeicao(registro) {
  const refeicoes = [];

  if (!registro) {
    return { refeicoes: [], totalCalorias: 0 };
  }

  // Tolera embrulho legado [{ content: {...} }] ou { content: {...} }
  let row = Array.isArray(registro) ? (registro[0]?.content ?? registro[0]) : registro;
  if (row && row.content && typeof row.content === 'object') row = row.content;
  if (!row || typeof row !== 'object') {
    return { refeicoes: [], totalCalorias: 0 };
  }

  // Refeições posicionais ref_1..ref_N (N variável), em ordem numérica
  const keys = Object.keys(row)
    .filter((k) => /^ref_\d+$/.test(k))
    .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));

  keys.forEach((key, idx) => {
    const parsed = parseRefeicaoJsonb(row[key], `Refeição ${idx + 1}`);
    if (parsed) {
      refeicoes.push({ id: idx + 1, ...parsed });
    }
  });

  const totalCalorias = refeicoes.reduce((acc, r) => acc + (r.totalKcal || 0), 0);

  return {
    refeicoes,
    totalCalorias: Math.round(totalCalorias),
  };
}

export function processarDadosAlimentacao(alimentos) {
  if (!alimentos || alimentos.length === 0) {
    return {
      refeicoes: [],
      totalCalorias: 0,
      totalProteinas: 0,
      totalCarboidratos: 0,
      totalGorduras: 0,
    };
  }

  const refeicoesMapa = {
    ref1: { nome: 'Refeição 1', itens: [], totalKcal: 0 },
    ref2: { nome: 'Refeição 2', itens: [], totalKcal: 0 },
    ref3: { nome: 'Refeição 3', itens: [], totalKcal: 0 },
    ref4: { nome: 'Refeição 4', itens: [], totalKcal: 0 },
  };

  let totalCalorias = 0;

  alimentos.forEach((alimento) => {
    if (alimento.ref1_g && alimento.ref1_kcal) {
      refeicoesMapa.ref1.itens.push({
        alimento: alimento.alimento,
        quantidade: `${alimento.ref1_g} g`,
        kcal: alimento.ref1_kcal,
        tipo: alimento.tipo_de_alimentos,
      });
      refeicoesMapa.ref1.totalKcal += alimento.ref1_kcal;
      totalCalorias += alimento.ref1_kcal;
    }
    if (alimento.ref2_g && alimento.ref2_kcal) {
      refeicoesMapa.ref2.itens.push({
        alimento: alimento.alimento,
        quantidade: `${alimento.ref2_g} g`,
        kcal: alimento.ref2_kcal,
        tipo: alimento.tipo_de_alimentos,
      });
      refeicoesMapa.ref2.totalKcal += alimento.ref2_kcal;
      totalCalorias += alimento.ref2_kcal;
    }
    if (alimento.ref3_g && alimento.ref3_kcal) {
      refeicoesMapa.ref3.itens.push({
        alimento: alimento.alimento,
        quantidade: `${alimento.ref3_g} g`,
        kcal: alimento.ref3_kcal,
        tipo: alimento.tipo_de_alimentos,
      });
      refeicoesMapa.ref3.totalKcal += alimento.ref3_kcal;
      totalCalorias += alimento.ref3_kcal;
    }
    if (alimento.ref4_g && alimento.ref4_kcal) {
      refeicoesMapa.ref4.itens.push({
        alimento: alimento.alimento,
        quantidade: `${alimento.ref4_g} g`,
        kcal: alimento.ref4_kcal,
        tipo: alimento.tipo_de_alimentos,
      });
      refeicoesMapa.ref4.totalKcal += alimento.ref4_kcal;
      totalCalorias += alimento.ref4_kcal;
    }
  });

  const refeicoes = Object.entries(refeicoesMapa)
    .filter(([_, refeicao]) => refeicao.itens.length > 0)
    .map(([key, refeicao], index) => ({
      id: index + 1,
      nome: refeicao.nome,
      itens: refeicao.itens,
      kcal: Math.round(refeicao.totalKcal),
    }));

  return {
    refeicoes,
    totalCalorias: Math.round(totalCalorias),
    totalProteinas: 0,
    totalCarboidratos: 0,
    totalGorduras: 0,
  };
}
