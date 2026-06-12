/**
 * Dados fictícios para rodar o app sem backend/Supabase.
 * Todas as telas usam estes dados para exibição visual.
 */

// ─── Paciente ──────────────────────────────────────────────
export const MOCK_PACIENTE = {
  id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  user_auth: "auth-mock-001",
  name: "João Pedro Silva",
  phone: "(11) 99800-2960",
  birth_date: "1990-05-15",
  email: "joao.silva@email.com",
};

// ─── Métricas do Paciente (mock — patient_metrics NÃO existe no banco) ────────────────
export const MOCK_METRICAS = {
  paciente_id: MOCK_PACIENTE.id,
  equilibrio_geral: 7.8,
  equilibrio_sono: 8.2,
  equilibrio_atividade_fisica: 7.0,
  equilibrio_alimentacao: 8.4,
  hidratacao_atual_litros: 2.3,
  qualidade_sono_horas: 7.5,
  qualidade_sono_variacao_minutos: 15,
};

// ─── Hábitos de Vida (real: diagnostico.habitos_vida) ─────
export const MOCK_HABITOS_VIDA = {
  metaAguaMl: 2500,
  exercicioDuracaoMin: 60,
  sonoDuracaoHoras: 8,
};

// ─── Histórico de Check-ins (mock — daily_checkins NÃO existe no banco) ───────────────
function gerarHistoricoCheckins(dias = 30) {
  const checkins = [];
  const hoje = new Date();
  for (let i = dias - 1; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    // Pular alguns dias aleatoriamente para parecer mais realista
    if (i > 0 && Math.random() < 0.15) continue;
    checkins.push({
      id: `checkin-${i}`,
      paciente_id: MOCK_PACIENTE.id,
      data_checkin: data.toISOString().split("T")[0],
      sono_qualidade: +(6 + Math.random() * 4).toFixed(1),
      sono_tempo_horas: +(6 + Math.random() * 2.5).toFixed(1),
      atividade_tempo_horas: +(0.3 + Math.random() * 2).toFixed(1),
      atividade_intensidade: +(40 + Math.random() * 50).toFixed(0),
      alimentacao_refeicoes: Math.floor(3 + Math.random() * 3),
      alimentacao_agua_litros: +(1.5 + Math.random() * 1.5).toFixed(1),
    });
  }
  return checkins;
}

export const MOCK_HISTORICO_CHECKINS = gerarHistoricoCheckins(30);

// ─── Refeições (real: solucao.refeicao) ────────────────────────────────
export const MOCK_REFEICAO = {
  id: "refeicao-001",
  created_at: "2026-03-20T10:00:00Z",
  ref_1: {
    principal: [
      { alimento: "Ovo cozido", quantidade: "2 unidades", kcal: 156 },
      { alimento: "Pão integral", quantidade: "2 fatias", kcal: 140 },
      { alimento: "Abacate", quantidade: "50g", kcal: 80 },
      { alimento: "Café com leite desnatado", quantidade: "200ml", kcal: 60 },
    ],
    substituicoes: {
      proteinas: [
        { alimento: "Queijo branco", quantidade: "40g", kcal: 110 },
        { alimento: "Peito de peru", quantidade: "50g", kcal: 60 },
      ],
      carboidratos: [
        { alimento: "Tapioca", quantidade: "2 unidades", kcal: 130 },
        { alimento: "Batata doce", quantidade: "100g", kcal: 86 },
      ],
      gorduras: [
        { alimento: "Azeite de oliva", quantidade: "1 colher de sopa", kcal: 108 },
        { alimento: "Castanha do Pará", quantidade: "3 unidades", kcal: 90 },
      ],
      leguminosas: [],
    },
  },
  ref_2: {
    principal: [
      { alimento: "Arroz integral", quantidade: "150g", kcal: 165 },
      { alimento: "Frango grelhado", quantidade: "150g", kcal: 248 },
      { alimento: "Brócolis cozido", quantidade: "100g", kcal: 35 },
      { alimento: "Salada de folhas verdes", quantidade: "1 prato", kcal: 25 },
      { alimento: "Azeite de oliva", quantidade: "1 colher de sopa", kcal: 108 },
    ],
    substituicoes: {
      proteinas: [
        { alimento: "Peixe grelhado (Tilápia)", quantidade: "150g", kcal: 195 },
        { alimento: "Carne bovina magra", quantidade: "120g", kcal: 210 },
      ],
      carboidratos: [
        { alimento: "Quinoa", quantidade: "100g", kcal: 120 },
        { alimento: "Mandioca cozida", quantidade: "100g", kcal: 125 },
      ],
      gorduras: [
        { alimento: "Abacate", quantidade: "50g", kcal: 80 },
      ],
      leguminosas: [
        { alimento: "Feijão preto", quantidade: "100g", kcal: 132 },
        { alimento: "Lentilha", quantidade: "100g", kcal: 116 },
      ],
    },
  },
  ref_3: {
    principal: [
      { alimento: "Iogurte natural", quantidade: "200ml", kcal: 100 },
      { alimento: "Granola", quantidade: "30g", kcal: 120 },
      { alimento: "Banana", quantidade: "1 unidade", kcal: 89 },
      { alimento: "Mel", quantidade: "1 colher de chá", kcal: 21 },
    ],
    substituicoes: {
      proteinas: [
        { alimento: "Whey protein", quantidade: "30g", kcal: 120 },
      ],
      carboidratos: [
        { alimento: "Aveia", quantidade: "30g", kcal: 117 },
        { alimento: "Maçã", quantidade: "1 unidade", kcal: 52 },
      ],
      gorduras: [
        { alimento: "Pasta de amendoim", quantidade: "1 colher de sopa", kcal: 94 },
      ],
      leguminosas: [],
    },
  },
  ref_4: {
    principal: [
      { alimento: "Salmão grelhado", quantidade: "150g", kcal: 280 },
      { alimento: "Batata doce", quantidade: "150g", kcal: 129 },
      { alimento: "Aspargos", quantidade: "100g", kcal: 20 },
      { alimento: "Azeite de oliva", quantidade: "1 colher de sopa", kcal: 108 },
    ],
    substituicoes: {
      proteinas: [
        { alimento: "Atum em lata", quantidade: "120g", kcal: 144 },
        { alimento: "Ovo mexido", quantidade: "3 unidades", kcal: 234 },
      ],
      carboidratos: [
        { alimento: "Inhame cozido", quantidade: "150g", kcal: 118 },
      ],
      gorduras: [
        { alimento: "Nozes", quantidade: "30g", kcal: 196 },
      ],
      leguminosas: [
        { alimento: "Grão de bico", quantidade: "100g", kcal: 164 },
      ],
    },
  },
};

// ─── Exercícios Físicos (real: solucao.treinos) ─────────────
export const MOCK_EXERCICIOS = [
  {
    id: 1,
    paciente_id: MOCK_PACIENTE.id,
    nome_exercicio: "Supino reto com barra",
    series: "4",
    repeticoes: "10-12",
    descanso: "60s",
    grupo_muscular: "Peitoral",
    nome_treino: "Treino A - Superior",
    tipo_treino: "Musculação",
    observacoes: "Manter cotovelos a 45 graus",
  },
  {
    id: 2,
    paciente_id: MOCK_PACIENTE.id,
    nome_exercicio: "Remada curvada",
    series: "4",
    repeticoes: "10-12",
    descanso: "60s",
    grupo_muscular: "Costas",
    nome_treino: "Treino A - Superior",
    tipo_treino: "Musculação",
    observacoes: "Puxar a barra na direção do umbigo",
  },
  {
    id: 3,
    paciente_id: MOCK_PACIENTE.id,
    nome_exercicio: "Desenvolvimento com halteres",
    series: "3",
    repeticoes: "12",
    descanso: "45s",
    grupo_muscular: "Ombros",
    nome_treino: "Treino A - Superior",
    tipo_treino: "Musculação",
    observacoes: "",
  },
  {
    id: 4,
    paciente_id: MOCK_PACIENTE.id,
    nome_exercicio: "Rosca direta",
    series: "3",
    repeticoes: "12-15",
    descanso: "45s",
    grupo_muscular: "Bíceps",
    nome_treino: "Treino A - Superior",
    tipo_treino: "Musculação",
    observacoes: "",
  },
  {
    id: 5,
    paciente_id: MOCK_PACIENTE.id,
    nome_exercicio: "Tríceps testa",
    series: "3",
    repeticoes: "12-15",
    descanso: "45s",
    grupo_muscular: "Tríceps",
    nome_treino: "Treino A - Superior",
    tipo_treino: "Musculação",
    observacoes: "Manter cotovelos fixos",
  },
  {
    id: 6,
    paciente_id: MOCK_PACIENTE.id,
    nome_exercicio: "Agachamento livre",
    series: "4",
    repeticoes: "10-12",
    descanso: "90s",
    grupo_muscular: "Quadríceps / Glúteos",
    nome_treino: "Treino B - Inferior",
    tipo_treino: "Musculação",
    observacoes: "Descer até paralelo, manter joelhos alinhados",
  },
  {
    id: 7,
    paciente_id: MOCK_PACIENTE.id,
    nome_exercicio: "Leg press 45°",
    series: "4",
    repeticoes: "12-15",
    descanso: "60s",
    grupo_muscular: "Quadríceps",
    nome_treino: "Treino B - Inferior",
    tipo_treino: "Musculação",
    observacoes: "",
  },
  {
    id: 8,
    paciente_id: MOCK_PACIENTE.id,
    nome_exercicio: "Stiff",
    series: "3",
    repeticoes: "12",
    descanso: "60s",
    grupo_muscular: "Posterior de coxa",
    nome_treino: "Treino B - Inferior",
    tipo_treino: "Musculação",
    observacoes: "Manter leve flexão nos joelhos",
  },
  {
    id: 9,
    paciente_id: MOCK_PACIENTE.id,
    nome_exercicio: "Panturrilha em pé",
    series: "4",
    repeticoes: "15-20",
    descanso: "30s",
    grupo_muscular: "Panturrilha",
    nome_treino: "Treino B - Inferior",
    tipo_treino: "Musculação",
    observacoes: "Amplitude máxima",
  },
  {
    id: 10,
    paciente_id: MOCK_PACIENTE.id,
    nome_exercicio: "Caminhada ao ar livre",
    series: "1",
    repeticoes: "30 min",
    descanso: "—",
    grupo_muscular: "Cardiovascular",
    nome_treino: "Treino C - Cardio",
    tipo_treino: "Aeróbico",
    observacoes: "Intensidade moderada, frequência cardíaca entre 120-140bpm",
  },
  {
    id: 11,
    paciente_id: MOCK_PACIENTE.id,
    nome_exercicio: "Bicicleta ergométrica",
    series: "1",
    repeticoes: "20 min",
    descanso: "—",
    grupo_muscular: "Cardiovascular",
    nome_treino: "Treino C - Cardio",
    tipo_treino: "Aeróbico",
    observacoes: "Intercalar 2 min leve / 1 min intenso",
  },
];

// ─── Suplementação (real: solucao.suplementacao) ──────────────────────
export const MOCK_SUPLEMENTACAO = {
  suplementos: [
    {
      nome: "Vitamina D3",
      dosagem: "5.000 UI",
      horario: "Manhã, junto ao café da manhã",
      objetivo: "Manutenção dos níveis de vitamina D, saúde óssea e imunidade",
      data_inicio: "2026-01-15",
      data_fim: "2026-07-15",
      categoria: "Suplemento",
      alertas_criticos: "",
    },
    {
      nome: "Ômega 3 (EPA/DHA)",
      dosagem: "2g (1g EPA + 1g DHA)",
      horario: "Almoço",
      objetivo: "Anti-inflamatório, saúde cardiovascular e cerebral",
      data_inicio: "2026-01-15",
      data_fim: "2026-07-15",
      categoria: "Suplemento",
      alertas_criticos: "",
    },
    {
      nome: "Magnésio Quelato",
      dosagem: "400mg",
      horario: "Noite, antes de dormir",
      objetivo: "Qualidade do sono, relaxamento muscular, redução de ansiedade",
      data_inicio: "2026-02-01",
      data_fim: "2026-08-01",
      categoria: "Suplemento",
      alertas_criticos: "",
    },
    {
      nome: "Zinco quelato",
      dosagem: "30mg",
      horario: "Jantar",
      objetivo: "Suporte imunológico e recuperação muscular",
      data_inicio: "2026-02-01",
      data_fim: "2026-05-01",
      categoria: "Suplemento",
      alertas_criticos: "",
    },
  ],
  fitoterapicos: [
    {
      nome: "Ashwagandha (Withania somnifera)",
      dosagem: "600mg",
      horario: "Manhã e noite (300mg + 300mg)",
      objetivo: "Redução de cortisol, controle de estresse e ansiedade",
      data_inicio: "2026-01-20",
      data_fim: "2026-04-20",
      categoria: "Fitoterápico",
      alertas_criticos: "Não usar em caso de hipertireoidismo",
    },
    {
      nome: "Rhodiola Rosea",
      dosagem: "400mg",
      horario: "Manhã em jejum",
      objetivo: "Aumento de energia e resistência ao estresse",
      data_inicio: "2026-02-10",
      data_fim: "2026-05-10",
      categoria: "Fitoterápico",
      alertas_criticos: "",
    },
  ],
  homeopatia: [
    {
      nome: "Nux vomica 30CH",
      dosagem: "5 glóbulos",
      horario: "Manhã, em jejum (sublingual)",
      objetivo: "Equilíbrio digestivo e redução de irritabilidade",
      data_inicio: "2026-03-01",
      data_fim: "2026-06-01",
      categoria: "Homeopatia",
      alertas_criticos: "",
    },
  ],
  florais_bach: [
    {
      nome: "Rescue Remedy",
      dosagem: "4 gotas",
      horario: "3x ao dia (sublingual)",
      objetivo: "Alívio de estresse e ansiedade em momentos agudos",
      data_inicio: "2026-02-15",
      data_fim: "2026-05-15",
      categoria: "Floral de Bach",
      alertas_criticos: "",
    },
    {
      nome: "White Chestnut",
      dosagem: "4 gotas",
      horario: "Noite, antes de dormir",
      objetivo: "Acalmar pensamentos repetitivos e insônia",
      data_inicio: "2026-02-15",
      data_fim: "2026-05-15",
      categoria: "Floral de Bach",
      alertas_criticos: "",
    },
  ],
};

// ─── Livro da Vida (real: solucao.mentalidade) ────────────────
export const MOCK_LIVRO_DA_VIDA = {
  resumo_executivo:
    "João Pedro apresenta um perfil de alta performance profissional com tendência ao autocobrança excessiva. Os padrões identificados revelam conexões entre estresse ocupacional, qualidade de sono comprometida e dificuldades no gerenciamento emocional. A abordagem integrativa foca em restabelecer o equilíbrio entre produtividade e autocuidado, fortalecendo os pilares de sono, atividade física e nutrição como base para a saúde mental.",
  padroes: [
    {
      id: 1,
      nome: "Autocobrança e Perfeccionismo",
      subtitulo: "Padrão Central",
      prioridade: "alta",
      manifestacoes: [
        "Dificuldade em delegar tarefas no trabalho",
        "Sensação constante de não estar fazendo o suficiente",
        "Tendência a trabalhar além do horário regularmente",
        "Autocrítica severa diante de erros pequenos",
      ],
      origens_conexoes: [
        "Ambiente familiar competitivo na infância",
        "Reforço social de produtividade como valor pessoal",
        "Medo de julgamento e rejeição profissional",
      ],
      orientacoes_transformacao: [
        "Praticar o exercício de 'suficiência': ao final do dia, listar 3 coisas que foram suficientes",
        "Estabelecer horário fixo para encerrar o trabalho (meta: 18h30)",
        "Meditação de autocompaixão 10 minutos pela manhã",
        "Terapia cognitivo-comportamental focada em reestruturação de crenças limitantes",
      ],
    },
    {
      id: 2,
      nome: "Ciclo Sono-Ansiedade",
      subtitulo: "Padrão Interdependente",
      prioridade: "alta",
      manifestacoes: [
        "Dificuldade para adormecer devido a pensamentos acelerados",
        "Despertar no meio da noite (entre 3h-4h) com preocupações",
        "Uso de telas até tarde como forma de 'desligar'",
        "Sonolência diurna compensada com cafeína excessiva",
      ],
      origens_conexoes: [
        "Hiperativação do sistema nervoso simpático (cortisol elevado à noite)",
        "Hábito de revisar problemas do dia ao deitar",
        "Conexão direta com o padrão de autocobrança",
      ],
      orientacoes_transformacao: [
        "Implementar ritual noturno: desligar telas 1h antes de dormir",
        "Técnica 4-7-8 de respiração ao deitar",
        "Limitar cafeína até 14h no máximo",
        "Suplementação com magnésio quelato 400mg à noite",
        "Manter diário de gratidão antes de dormir (3 itens)",
      ],
    },
    {
      id: 3,
      nome: "Alimentação Emocional",
      subtitulo: "Padrão de Compensação",
      prioridade: "média",
      manifestacoes: [
        "Tendência a comer doces em momentos de estresse",
        "Pular refeições durante o dia e compensar à noite",
        "Dificuldade em manter a regularidade das refeições planejadas",
      ],
      origens_conexoes: [
        "Comida como mecanismo de recompensa desde a infância",
        "Estresse ocupacional eleva cortisol e busca por carboidratos rápidos",
        "Conexão com o padrão de autocobrança (não 'merece' parar para comer)",
      ],
      orientacoes_transformacao: [
        "Preparar as refeições no dia anterior (meal prep dominical)",
        "Manter snacks saudáveis na mesa de trabalho",
        "Antes de comer por impulso, beber 1 copo de água e esperar 10 min",
        "Registro alimentar consciente (sem julgamento)",
      ],
    },
  ],
  higiene_sono: {
    horario_dormir_recomendado: "22:30",
    horario_acordar_recomendado: "06:30",
    duracao_ideal_horas: 8,
    orientacoes: [
      "Manter o quarto escuro e com temperatura entre 18-22°C",
      "Evitar exercícios intensos após as 20h",
      "Desligar todas as telas 1 hora antes de dormir",
      "Utilizar luz amarela a partir das 20h",
    ],
  },
};
