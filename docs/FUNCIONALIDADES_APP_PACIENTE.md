# AUTON Health — App Paciente: Documento Completo de Funcionalidades

> Versão: 1.0 | Data: 02/04/2026  
> Escopo: Todas as telas, funcionalidades, fluxos de dados, cálculos, validações e regras de negócio da aplicação web do paciente AUTON Health.

---

## Sumário

1. [Visão Geral da Aplicação](#1-visão-geral-da-aplicação)
2. [Arquitetura e Estrutura de Navegação](#2-arquitetura-e-estrutura-de-navegação)
3. [Sistema de Autenticação](#3-sistema-de-autenticação)
   - 3.1 Login
   - 3.2 Recuperação de Senha
   - 3.3 Redefinição de Senha
   - 3.4 Proteção de Rotas
4. [Contexto do Paciente](#4-contexto-do-paciente)
5. [Dashboard (Tela Inicial)](#5-dashboard-tela-inicial)
   - 5.1 Saudação Personalizada
   - 5.2 Filtro de Período
   - 5.3 Cards de Métricas (Sono, Exercício, Hidratação)
   - 5.4 Idade Biológica
   - 5.5 Aderência ao Protocolo
   - 5.6 Equilíbrio Integrativo
   - 5.7 Widget de Equilíbrio Geral
   - 5.8 Gráfico de Evolução
   - 5.9 Evolução do Paciente (oculto)
6. [Módulo Estilo de Vida](#6-módulo-estilo-de-vida)
   - 6.1 Alimentação (Plano Alimentar)
   - 6.2 Exercício Físico
   - 6.3 Suplementos e Fitoterápicos
   - 6.4 Livro da Vida (Mentalidade e Espiritualidade)
   - 6.5 Higiene do Sono
7. [Check-in Diários](#7-check-in-diários)
8. [Perfil do Paciente](#8-perfil-do-paciente)
9. [Módulo Educacional](#9-módulo-educacional)
10. [Fórmulas e Cálculos](#10-fórmulas-e-cálculos)
11. [Estrutura de Dados](#11-estrutura-de-dados)
12. [Regras de Negócio Globais](#12-regras-de-negócio-globais)

---

## 1. Visão Geral da Aplicação

O AUTON Health App Paciente é uma aplicação web SPA (Single Page Application) que permite ao paciente acompanhar seu plano de saúde integrativo prescrito por um médico. O paciente pode:

- Visualizar métricas de saúde consolidadas (sono, exercício, hidratação, equilíbrio geral)
- Consultar seu plano alimentar personalizado com refeições e substituições
- Acompanhar seu programa de exercícios físicos organizado por tipo de treino
- Visualizar prescrições de suplementos, fitoterápicos, homeopatia e florais de Bach
- Ler padrões psicológicos e orientações de transformação (Livro da Vida)
- Realizar check-ins diários de sono, atividade física e alimentação
- Gerenciar perfil pessoal e alterar senha de acesso
- Acessar módulos educacionais (em desenvolvimento)

A aplicação é uma vertente do projeto principal `auton-health-main`, que é o sistema do médico/clínica. Este app é exclusivamente para o paciente.

---

## 2. Arquitetura e Estrutura de Navegação

### Mapa de Rotas

| Rota | Tela | Acesso | Menu |
|------|------|--------|------|
| `/dashboard` | Dashboard principal | Protegida | Início |
| `/lifestyle/livro-da-vida` | Livro da Vida | Protegida | Estilo de Vida > Livro da Vida |
| `/lifestyle/alimentacao` | Plano Alimentar | Protegida | Estilo de Vida > Alimentação |
| `/lifestyle/exercicio-fisico` | Exercícios | Protegida | Estilo de Vida > Exercício Físico |
| `/lifestyle/suplementos-fitoterapicos` | Suplementos | Protegida | Estilo de Vida > Suplementos |
| `/checkin-diarios` | Check-in Diários | Protegida | Check-in Diários |
| `/perfil` | Perfil do Paciente | Protegida | Oculta (via menu de perfil) |
| `/educacional` | Módulos Educacionais | Protegida | Desabilitada |
| `/educacional/modulo/:moduloId` | Detalhe do Módulo | Protegida | Desabilitada |
| `/authentication/sign-in` | Login | Pública | — |
| `/authentication/forgot-password` | Recuperar Senha | Pública | — |
| `/authentication/reset-password` | Redefinir Senha | Pública | — |

### Comportamentos de Navegação

- **Redirecionamento padrão**: `/` e qualquer rota inválida redirecionam para `/dashboard`
- **Scroll automático**: A página rola para o topo a cada mudança de rota
- **Reset de estado**: Todas as páginas resetam seus estados locais quando a rota muda (`location.pathname`)
- **Sidebar colapsável**: O menu lateral possui dois estados — expandido (com labels) e mini (apenas ícones). Expande ao passar o mouse e colapsa ao sair
- **Menu agrupado**: As rotas de Estilo de Vida são agrupadas em um menu collapse com sub-itens

---

## 3. Sistema de Autenticação

### 3.1 Login (`/authentication/sign-in`)

**Fluxo principal:**
1. Paciente informa email e senha
2. Sistema autentica via Supabase Auth (`signInWithPassword`)
3. Após autenticação, busca dados do paciente na tabela `patients` usando o campo `user_auth` (ID do Supabase Auth)
4. Salva dados do paciente no `localStorage` (`paciente` e `user_auth_id`)
5. Redireciona para `/dashboard`

**Campos do formulário:**
- Email (obrigatório, validação HTML5 de formato)
- Senha (obrigatório)
- Toggle "Lembrar-me"

**Fluxos alternativos:**
- Email/senha incorretos → Mensagem "Email ou senha incorretos"
- Paciente não encontrado no banco → "Paciente não encontrado. Entre em contato com o suporte."
- Erro genérico de rede → "Erro ao fazer login. Tente novamente."

**Navegação:**
- Link "Esqueci minha senha" → `/authentication/forgot-password`

### 3.2 Recuperação de Senha (`/authentication/forgot-password`)

**Fluxo principal:**
1. Paciente informa email
2. Sistema envia link de recuperação via `supabase.auth.resetPasswordForEmail()`
3. Email recebido contém link para `/authentication/reset-password`
4. Mensagem de sucesso exibida

**Validação:**
- Campo email obrigatório

**Tratamento de erros:**
- Email não encontrado → Mensagem de erro do Supabase
- Erro de rede → Mensagem genérica

### 3.3 Redefinição de Senha (`/authentication/reset-password`)

**Fluxo principal:**
1. Paciente acessa via link do email (contém token PKCE no URL)
2. Sistema detecta código PKCE (`?code=`) ou token hash (`#access_token`)
3. Aguarda até 2 segundos pela detecção automática de sessão
4. Monitora eventos de auth (`PASSWORD_RECOVERY` ou `SIGNED_IN`)
5. Paciente informa nova senha e confirmação
6. Sistema atualiza via `supabase.auth.updateUser({ password })`
7. Após sucesso, redireciona para login em 3 segundos

**Validações:**
- Senha mínimo 6 caracteres
- Senha e confirmação devem ser iguais
- Nova senha não pode ser igual à atual (erro `same_password` do Supabase)

**Tratamento de erros:**
- Sessão expirada → "Sessão expirada. Faça login novamente."
- Senha muito curta (HTTP 422) → "Senha inválida. Use no mínimo 6 caracteres."
- Mesma senha → "A nova senha deve ser diferente da atual."
- Token inválido ou expirado → Mensagem de erro

**Timeout de segurança:**
- Fallback de 2 segundos se sessão PKCE não for detectada automaticamente

### 3.4 Proteção de Rotas

**Mecanismo:**
- Componente `ProtectedRoute` envolve todas as rotas autenticadas
- Verifica e renova sessão Supabase (`verificarERenovarSessao()`)
- Busca dados do paciente na tabela `patients`
- Timeout de 8 segundos para verificação
- Se não autenticado → Redireciona para `/authentication/sign-in`

**Renovação de sessão:**
- Hook `usePageFocus` monitora visibilidade da página
- Quando a aba volta ao foco após 30+ segundos, renova sessão automaticamente
- Se token de refresh inválido → Redireciona para login

**Eventos monitorados:**
- `SIGNED_OUT` / `USER_DELETED` → Limpa localStorage, marca como não autenticado
- `SIGNED_IN` → Re-verifica dados do paciente
- `TOKEN_REFRESHED` → Ignorado (evita loops)

---

## 4. Contexto do Paciente

O `PacienteContext` é o provedor global de dados do paciente para toda a aplicação.

**Dados fornecidos:**
- `paciente`: Objeto com dados do paciente (id, name, phone, birth_date, email, user_auth)
- `loading`: Booleano indicando carregamento
- `error`: Mensagem de erro (se houver)
- `refetchPaciente()`: Função para recarregar dados

**Fluxo de carregamento:**
1. Verifica sessão ativa
2. Busca paciente na tabela `patients` usando `session.user.id`
3. Salva no estado e no localStorage
4. Máximo 2 tentativas em caso de falha
5. Timeout de 8 segundos por tentativa

**Persistência:**
- Dados salvos em `localStorage.paciente` (JSON)
- ID de auth salvo em `localStorage.user_auth_id`
- Limpos no logout

---

## 5. Dashboard (Tela Inicial)

### 5.1 Saudação Personalizada (WelcomeMark)

**Funcionalidade:**
- Exibe "Bem vindo de volta, **[Primeiro Nome]**"
- Extrai primeiro nome do campo `paciente.name` (split por espaço, pega índice 0)
- Fallback para "Usuário" se nome não disponível
- Mensagem complementar: "Que bom ver você de novo!"

### 5.2 Filtro de Período

**Funcionalidade:**
- Permite selecionar o intervalo de tempo para cálculo de todas as métricas
- Opções: Hoje (1 dia), 7 dias, 15 dias, 30 dias, 90 dias
- Valor padrão: 7 dias
- Alterar o período recalcula automaticamente: métricas, histórico, gráficos e aderência

**Comportamento:**
- Ao trocar período, dispara novo carregamento de dados
- Timeout de segurança de 10 segundos para carregamento
- Se timeout, mantém dados anteriores (degradação graciosa)

### 5.3 Cards de Métricas

Três cards exibem as métricas principais, cada um calculado sobre a **média do período selecionado**.

#### Qualidade do Sono

**Dados exibidos:**
- Horas médias dormidas no período (formato `Xh:YYmin`)
- Meta de sono em horas (vem de `habitosVida.sonoDuracaoHoras`, padrão 8h)
- Percentual de atingimento (`sonoAtualHoras / sonoMeta * 100`)
- Indicador de cor: verde se ≥100%, vermelho se <100%

**Cálculo:**
```
sonoMediaPeriodo = soma(checkins.sono_tempo_horas) / checkins.length
sonoPercentual = min(100, round(sonoMediaPeriodo / sonoMeta * 100))
```

**Formatação:**
```
Exemplo: 7.5 horas → "7h:30min"
Math.floor(horas) + "h:" + Math.round((horas % 1) * 60) + "min"
```

#### Exercício

**Dados exibidos:**
- Minutos médios de atividade no período
- Meta em minutos/dia (vem de `habitosVida.exercicioDuracaoMin`, padrão 60min)
- Percentual de atingimento
- Indicador de cor: verde se ≥100%, vermelho se <100%

**Cálculo:**
```
exercicioAtualMin = round(média(checkins.atividade_tempo_horas) * 60)
exercicioPercentual = min(100, round(exercicioAtualMin / exercicioMeta * 100))
```

#### Hidratação

**Dados exibidos:**
- Litros médios de água no período
- Meta em litros (vem de `habitosVida.metaAguaMl / 1000`, padrão 2.4L)
- Percentual de atingimento
- Indicador de cor: verde se ≥ meta, vermelho se < meta

**Cálculo:**
```
hidratacaoMedia = soma(checkins.alimentacao_agua_litros) / checkins.length
hidratacaoPercentual = min(100, round(hidratacaoMedia / metaAgua * 100))
```

### 5.4 Idade Biológica

**Funcionalidade:**
- Exibe a idade biológica do paciente (se o médico tiver definido) ou a idade cronológica

**Lógica de decisão:**
1. Busca `metricas.idade_biologica` do banco
2. Se existir → Exibe como "Idade biológica ajustada"
3. Se não → Calcula idade cronológica a partir de `paciente.birth_date` → Exibe como "Idade atual"
4. Se nenhum disponível → Exibe "—" com "calculando..."

**Cálculo de idade cronológica:**
```
idade = anoAtual - anoNascimento
se mêsAtual < mêsNascimento OU (mesmo mês E diaAtual < diaNascimento):
  idade = idade - 1
```

### 5.5 Aderência ao Protocolo (ReferralTracking)

**Funcionalidade:**
- Exibe o percentual de dias com check-in realizado dentro do período selecionado
- Gauge semicircular de 0% a 100%
- Ícone de sentimento central (feliz, neutro ou triste)
- Texto "X de Y dias (meta)"

**Cálculo:**
```
datasUnicas = Set(checkins.map(c => c.data_checkin))  // dias únicos com check-in
realizado = datasUnicas.size
meta = periodo  // 7 dias = meta 7
percentual = min(100, round(realizado / meta * 100))
```

**Lógica do ícone:**
- ≥ 80% → Rosto feliz (`sentiment_satisfied_alt`)
- ≥ 50% → Rosto neutro (`sentiment_neutral`)
- < 50% → Rosto triste (`sentiment_dissatisfied`)

### 5.6 Equilíbrio Integrativo

**Funcionalidade:**
- Exibe 3 dimensões do equilíbrio de saúde: Sono, Atividade Física e Alimentação
- Cada dimensão mostra uma nota de 0.0 a 10.0
- Dados vêm diretamente do objeto `metricas`:
  - `metricas.equilibrio_sono`
  - `metricas.equilibrio_atividade_fisica`
  - `metricas.equilibrio_alimentacao`

### 5.7 Widget de Equilíbrio Geral

**Funcionalidade:**
- Progress circular mostrando a nota geral de equilíbrio do paciente
- Escala de 0 a 10
- Converte para percentual: `valor * 10`
- Dado: `metricas.equilibrio_geral`

### 5.8 Gráfico de Evolução

**Funcionalidade:**
- Gráfico de linha mostrando a evolução do equilíbrio geral ao longo do período
- Eixo X: datas dos check-ins (formato "DD/mes")
- Eixo Y: nota de equilíbrio (0-10)
- Cada ponto é calculado individualmente por check-in usando a fórmula de equilíbrio geral

**Processamento (processarDadosGrafico):**
```
Para cada check-in:
  1. Formata data: "01/jan", "02/fev", etc.
  2. Calcula equilíbrio geral do check-in
  3. Adiciona ao dataset
Retorna: { labels: [...datas], datasets: [{ name, data }] }
```

### 5.9 Evolução do Paciente (oculto)

**Status:** Componente implementado mas comentado no dashboard

**Funcionalidades planejadas:**
- 5 avaliações de composição corporal com:
  - Data, peso, circunferência abdominal, IMC, % gordura, massa magra
  - Deltas (variação entre avaliações)
  - Classificação IMC com código de cores
  - Barras de progresso em direção à meta
  - Notas do médico
- Gráficos de tendência (peso, cintura, gordura, massa muscular)
- Galeria de fotos por avaliação
- Visualização em cards expansíveis

---

## 6. Módulo Estilo de Vida

### 6.1 Alimentação — Plano Alimentar (`/lifestyle/alimentacao`)

**Funcionalidade:**
- Exibe o plano alimentar personalizado prescrito pelo médico
- Organizado em até 4 refeições (Refeição 1, 2, 3, 4)
- Cada refeição possui dois modos de visualização:
  - **Principal**: Alimentos prescritos com quantidades e calorias
  - **Substituições**: Alternativas organizadas por categoria nutricional

**Dados por refeição:**
- Nome da refeição
- Lista de alimentos com: nome, quantidade/porção, calorias (kcal)
- Total de calorias da refeição

**Substituições por categoria:**
- Proteínas (ex: frango → peixe, carne bovina)
- Carboidratos (ex: arroz integral → quinoa, mandioca)
- Gorduras (ex: azeite → abacate, castanhas)
- Leguminosas (ex: feijão preto → lentilha, grão de bico)

**Resumo geral:**
- Total de calorias diárias (soma de todas as refeições)
- Número de refeições
- Meta de água diária (em ml, convertida de `habitosVida.metaAguaMl`)

**Processamento de dados (`processarDadosRefeicao`):**
```
1. Recebe registro com campos ref_1, ref_2, ref_3, ref_4 (JSONB)
2. Cada ref contém: { principal: [...], substituicoes: { proteinas, carboidratos, gorduras, leguminosas } }
3. Parseia cada item: { alimento, quantidade, kcal }
4. Calcula total kcal por refeição (principal) e por substituição
5. Retorna: { refeicoes: [...], totalCalorias }
```

**Fallbacks de campos:**
- `alimento` ← `item.alimento || item.nome || item.descricao || "—"`
- `quantidade` ← `item.quantidade || item.porcao || gramas formatado`
- `kcal` ← `item.kcal || item.calorias || 0`

**Estados:**
- Carregando → Spinner
- Erro → Mensagem de erro
- Sem dados → "Nenhum plano alimentar cadastrado"
- Toggle principal/substituições por refeição

### 6.2 Exercício Físico (`/lifestyle/exercicio-fisico`)

**Funcionalidade:**
- Exibe o programa de exercícios prescrito pelo médico
- Organizado por tipo de treino (A, B, C, etc.)
- Cada treino contém uma lista de exercícios com detalhes

**Organização:**
- Exercícios agrupados por `nome_treino` (ex: "Treino A - Superior")
- Fallback para `tipo_treino` (ex: "Musculação", "Aeróbico")
- Se nenhum → "Sem Tipo"

**Lista de treinos:**
- Badge com letra do treino (A, B, C)
- Nome do treino
- Tipo (Musculação, Aeróbico, etc.)
- Contagem de exercícios

**Detalhe de cada exercício:**
- Número sequencial (01, 02, etc.)
- Nome do exercício
- Séries (ex: "4")
- Repetições (ex: "10-12")
- Descanso (ex: "60s")
- Grupo muscular (ex: "Peitoral", "Costas")
- Observações do médico (ex: "Manter cotovelos a 45 graus")
- URL de vídeo explicativo (se disponível)

**Interações:**
1. Clicar em treino → Expande lista de exercícios
2. Navegar entre treinos (Anterior/Próximo)
3. Clicar no ícone de ajuda → Abre modal com vídeo/dicas (se URL disponível)
4. Botão voltar → Retorna à lista de treinos

**Estados:**
- Carregando → Spinner
- Sem exercícios → "Nenhum exercício prescrito"
- Treino selecionado → Visão detalhada

### 6.3 Suplementos e Fitoterápicos (`/lifestyle/suplementos-fitoterapicos`)

**Funcionalidade:**
- Exibe todas as prescrições de suplementos, fitoterápicos, homeopatia e florais de Bach
- Filtro por categoria
- Cards informativos com dosagem, horário e alertas

**Categorias:**
1. **Suplementos** — ex: Vitamina D3, Ômega 3, Magnésio Quelato, Zinco
2. **Fitoterápicos** — ex: Ashwagandha, Rhodiola Rosea
3. **Homeopatia** — ex: Nux vomica 30CH
4. **Florais de Bach** — ex: Rescue Remedy, White Chestnut

**Dados por item:**
- Nome do suplemento/fitoterápico
- Categoria (badge colorido)
- Dosagem (ex: "5.000 UI", "2g (1g EPA + 1g DHA)")
- Horário de uso (ex: "Manhã, junto ao café da manhã", "Noite, antes de dormir")
- Objetivo/finalidade (texto descritivo)
- Data de início e fim (formato DD/MM/YYYY)
- Alertas críticos (ex: "Não usar em caso de hipertireoidismo")

**Filtro:**
- Tabs: Todos, Suplementos, Fitoterápicos, Homeopatia, Florais de Bach
- Filtragem local (client-side) por campo `categoria`

**Processamento de dados (`buscarSuplementacao`):**
```
1. Busca por paciente_id na tabela s_suplementacao2
2. Fallback: busca última consulta → usa consulta_id
3. Parseia arrays JSON: suplementos, fitoterapicos, homeopatia, florais_bach
4. Retorna objeto com 4 arrays processados
```

**Estados:**
- Carregando → Spinner
- Sem dados → "Nenhuma suplementação prescrita"
- Erro → Mensagem de erro

### 6.4 Livro da Vida — Mentalidade e Espiritualidade (`/lifestyle/livro-da-vida`)

**Funcionalidade:**
- Apresenta a análise psicológica do paciente: padrões comportamentais, suas origens e orientações de transformação
- Inclui protocolo de higiene do sono personalizado
- Todo conteúdo é somente leitura (prescrito pelo médico via IA)

**Seção 1 — Resumo Executivo:**
- Texto narrativo descrevendo o perfil psicológico do paciente
- Contextualiza os padrões identificados e a abordagem recomendada

**Seção 2 — Padrões Psicológicos (Accordion):**

Cada padrão contém:
- **Nome**: Identificação do padrão (ex: "Autocobrança e Perfeccionismo")
- **Subtítulo**: Classificação (ex: "Padrão Central", "Padrão Interdependente")
- **Prioridade**: alta, média ou baixa
- **Manifestações**: Lista de comportamentos/sintomas atuais
  - ex: "Dificuldade em delegar tarefas no trabalho"
  - ex: "Tendência a trabalhar além do horário regularmente"
- **Origens e Conexões**: Causas raiz e relações entre padrões
  - ex: "Ambiente familiar competitivo na infância"
  - ex: "Conexão direta com o padrão de autocobrança"
- **Orientações de Transformação**: Passos práticos numerados
  - ex: "Praticar o exercício de 'suficiência': ao final do dia, listar 3 coisas que foram suficientes"
  - ex: "Estabelecer horário fixo para encerrar o trabalho (meta: 18h30)"

**Interação:**
- Clicar no padrão → Expande/colapsa accordion
- Dentro do padrão, cada seção (manifestações, origens, orientações) pode ser expandida

**Seção 3 — Higiene do Sono:**

- **Horários recomendados**: Dormir, Acordar, Duração ideal
- **Janela de sono**: Horários para semana e fins de semana
- **Rotina pré-sono**: Sequência cronológica de atividades
  - ex: "22:00 - Desligar telas", "22:20 - Banho morno", "23:00 - Deitar"
- **Gatilhos a evitar**: Lista de comportamentos prejudiciais
  - ex: "Cafeína após 16h", "Telas após 21h"
- **Progressão de ajuste**: Orientação para implementação gradual
- **Observações clínicas**: Notas do médico

**Processamento de dados (`buscarLivroDaVida`):**
```
1. Busca na tabela s_agente_mentalidade_2 por paciente_id
2. Fallback: busca última consulta → usa consulta_id
3. Processa campos padrao_01 a padrao_10 (JSON)
4. Processa resumo_executivo (texto)
5. Processa higiene_sono (JSON com horários e orientações)
6. Retorna: { resumo_executivo, padroes[], higiene_sono }
```

### 6.5 Higiene do Sono (página dedicada)

**Status:** Implementada mas não acessível pelo menu (rota existe)

**Funcionalidade idêntica à Seção 3 do Livro da Vida**, porém como página standalone com layout dedicado:

- Horários recomendados em cards individuais
- Janela de sono com comparativo semana/fim de semana
- Rotina pré-sono com timeline visual
- Lista de gatilhos a evitar
- Progressão de ajuste gradual
- Observações clínicas do médico

---

## 7. Check-in Diários (`/checkin-diarios`)

**Funcionalidade:**
- Formulário guiado de 3 etapas para o paciente registrar métricas diárias
- Permite apenas 1 check-in por dia
- Alimenta o dashboard com dados para cálculos de equilíbrio

### Verificação Inicial

Ao carregar a página:
1. Verifica se paciente já realizou check-in hoje (`verificarCheckinHoje`)
2. Se sim → Exibe mensagem "Você já realizou o check-in de hoje" com botão "Voltar"
3. Se não → Exibe tela inicial com 3 categorias para iniciar

### Tela Inicial

Exibe 3 cards representando as categorias:
1. **Sono** — Ícone lua, "Registre a qualidade e duração do seu sono"
2. **Atividade Física** — Ícone fitness, "Registre seu exercício e intensidade"
3. **Alimentação** — Ícone restaurante, "Registre suas refeições e hidratação"

Botão "Começar" inicia o formulário.

### Etapa 1 — Sono

| Campo | Tipo | Faixa | Descrição |
|-------|------|-------|-----------|
| Qualidade do sono | Slider | 0 a 10 | Nota subjetiva da qualidade |
| Tempo de sono | Slider | 0 a 12 horas | Duração total dormida |

### Etapa 2 — Atividade Física

| Campo | Tipo | Faixa | Descrição |
|-------|------|-------|-----------|
| Tempo de atividade | Slider | 0 a 5 horas | Duração total de exercício |
| Intensidade | Slider | 0 a 100% | Nível de esforço percebido |

### Etapa 3 — Alimentação

| Campo | Tipo | Faixa | Descrição |
|-------|------|-------|-----------|
| Número de refeições | Slider | 0 a 6 | Refeições feitas no dia |
| Água consumida | Slider | 0 a 4 litros | Consumo de água no dia |

### Fluxo de Submissão

1. Paciente ajusta sliders em cada etapa
2. Navega entre etapas via "Anterior" / "Próximo"
3. Na última etapa, clica "Finalizar"
4. Sistema chama `salvarCheckin(pacienteId, dados)` com estrutura:
   ```
   {
     paciente_id: UUID,
     data_checkin: "YYYY-MM-DD",
     sono_qualidade: 0-10,
     sono_tempo_horas: 0-12,
     atividade_tempo_horas: 0-5,
     atividade_intensidade: 0-100,
     alimentacao_refeicoes: 0-6,
     alimentacao_agua_litros: 0-4
   }
   ```
5. Se sucesso → Mensagem "Check-in concluído com sucesso!" → Após 2s reseta formulário
6. Se erro → Mensagem de erro, paciente pode tentar novamente

### Regras de Negócio

- **1 check-in por dia**: Verificado por `data_checkin` (data no formato YYYY-MM-DD)
- **Métricas atualizadas automaticamente**: Após inserção, trigger no banco recalcula `patient_metrics`
- **Valores default**: Sliders iniciam em valores medianos razoáveis
- **Sem validação obrigatória**: Paciente pode submeter com quaisquer valores dentro da faixa

---

## 8. Perfil do Paciente (`/perfil`)

### Seção 1 — Dados Pessoais

**Modo leitura:**
- Nome completo
- Email (somente leitura, não editável)
- CPF (somente leitura, se disponível)
- Telefone (formatado)
- Data de nascimento (formato DD/MM/YYYY)

**Modo edição:**
- Botão "Editar" ativa modo de edição
- Campos editáveis: Nome, Telefone, Data de Nascimento
- Botão "Salvar" persiste alterações
- Botão "Cancelar" descarta alterações e volta ao modo leitura

**Formatação de telefone:**
```
Formato: (XX) XXXXX-XXXX (celular) ou (XX) XXXX-XXXX (fixo)
Remove caracteres não-numéricos, limita a 11 dígitos
Aplica máscara conforme quantidade de dígitos
```

**Persistência:**
1. Envia update para tabela `patients` usando `user_auth` como identificador
2. Atualiza `localStorage.paciente` com dados retornados
3. Chama `refetchPaciente()` para atualizar contexto global

### Seção 2 — Segurança (Alterar Senha)

**Campos:**
- Nova senha (mínimo 6 caracteres)
- Confirmar nova senha
- Toggle de visibilidade para cada campo (ícone olho)

**Validações:**
1. Nova senha e confirmação preenchidas
2. Nova senha ≥ 6 caracteres
3. Senhas idênticas
4. Sessão ativa válida (verifica antes de submeter)

**Fluxo:**
1. Verifica sessão ativa via `supabase.auth.getSession()`
2. Se sessão inválida → "Sessão expirada. Faça login novamente."
3. Chama `supabase.auth.updateUser({ password })` com timeout de 3 segundos
4. Sucesso → Mensagem verde, limpa campos
5. Erro → Mensagem vermelha com detalhes

**Tratamento de erros específicos:**
- Código `same_password` → "A nova senha deve ser diferente da atual."
- Erro de sessão/JWT → "Sessão expirada."
- HTTP 422 → "Senha inválida."

**Auto-dismiss de mensagens:**
- Todas as mensagens de feedback (perfil e senha) desaparecem após 5 segundos
- Limpos também ao mudar de rota

---

## 9. Módulo Educacional

**Status:** Implementado mas desabilitado na navegação

### Lista de Módulos (`/educacional`)

**Funcionalidade:**
- Grid de cards representando módulos educacionais
- Cada card exibe: título, descrição, progresso (%), aulas concluídas, duração total

**Status dos módulos:**
- Bloqueado (0% progresso) → Ícone de cadeado
- Em progresso (1-99%) → Ícone de play
- Concluído (100%) → Ícone de check

**Interação:**
- Clicar no card → Navega para `/educacional/modulo/:moduloId`

### Detalhe do Módulo (`/educacional/modulo/:moduloId`)

**Funcionalidade:**
- Player de vídeo (YouTube iframe)
- Lista de aulas na sidebar
- Navegação entre aulas (Anterior/Próximo)

**Dados por aula:**
- Título da aula
- URL do vídeo (YouTube)
- Duração (ex: "23:47")
- Status: concluída, em andamento, bloqueada

**Interações:**
1. Clicar em aula na sidebar → Carrega vídeo correspondente
2. Botão "Anterior" → Aula anterior (desabilitado na primeira)
3. Botão "Próximo" → Próxima aula (desabilitado na última)
4. Botão voltar → Retorna para lista de módulos

**Edge case:**
- `moduloId` inválido → Exibe "Módulo não encontrado"

---

## 10. Fórmulas e Cálculos

### Equilíbrio Geral (por check-in individual)

```
sono = sono_qualidade × 0.7 + (sono_tempo_horas / 8 × 10) × 0.3

atividade = (atividade_tempo_horas / 1.5 × 10 × 0.5) + (atividade_intensidade / 10 × 0.5)

alimentacao = (alimentacao_refeicoes / 4 × 10 × 0.5) + (alimentacao_agua_litros / 2.5 × 10 × 0.5)

equilibrio_geral = (sono + atividade + alimentacao) / 3

Resultado: clampado entre 0 e 10
```

**Pesos:**
- Sono: qualidade tem peso 70%, duração tem peso 30%
- Atividade: tempo e intensidade dividem 50/50
- Alimentação: refeições e água dividem 50/50
- As 3 dimensões contribuem igualmente (33.3% cada)

**Referências de normalização:**
- Sono ideal: 8 horas
- Atividade ideal: 1.5 horas
- Intensidade ideal: 100%
- Refeições ideais: 4
- Água ideal: 2.5 litros

### Aderência ao Protocolo

```
datasUnicas = contagem de datas distintas com check-in no período
meta = número de dias do período selecionado
percentual = min(100, round(datasUnicas / meta × 100))
```

### Métricas do Dashboard (médias do período)

```
sonoMedia = soma(checkins.sono_tempo_horas) / totalCheckins
exercicioMedia = soma(checkins.atividade_tempo_horas) / totalCheckins × 60 (convertido para minutos)
hidratacaoMedia = soma(checkins.alimentacao_agua_litros) / totalCheckins
```

### Calorias Totais (Alimentação)

```
Para cada refeição (ref_1 a ref_4):
  totalKcalRefeicao = soma(itens_principais.kcal)
totalCaloriasDiarias = soma(todasRefeicoes.totalKcal)
```

### Idade Cronológica

```
idade = anoAtual - anoNascimento
se (mêsAtual < mêsNascimento) OU (mêsAtual == mêsNascimento E diaAtual < diaNascimento):
  idade = idade - 1
```

---

## 11. Estrutura de Dados

### Paciente (`patients`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| user_auth | UUID | ID do Supabase Auth vinculado |
| name | string | Nome completo |
| phone | string | Telefone (dígitos) |
| birth_date | date | Data de nascimento (YYYY-MM-DD) |
| email | string | Email |
| cpf | string | CPF (opcional) |

### Check-in Diário (`daily_checkins`)

| Campo | Tipo | Faixa | Descrição |
|-------|------|-------|-----------|
| id | UUID | — | Identificador |
| paciente_id | UUID | — | FK para patients |
| data_checkin | date | — | Data do check-in (YYYY-MM-DD) |
| sono_qualidade | float | 0-10 | Nota de qualidade do sono |
| sono_tempo_horas | float | 0-12 | Horas dormidas |
| atividade_tempo_horas | float | 0-5 | Horas de atividade física |
| atividade_intensidade | float | 0-100 | Intensidade (%) |
| alimentacao_refeicoes | int | 0-6 | Número de refeições |
| alimentacao_agua_litros | float | 0-4 | Litros de água |

### Métricas do Paciente (`patient_metrics`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| paciente_id | UUID | FK para patients |
| equilibrio_geral | float | Nota geral 0-10 |
| equilibrio_sono | float | Nota sono 0-10 |
| equilibrio_atividade_fisica | float | Nota atividade 0-10 |
| equilibrio_alimentacao | float | Nota alimentação 0-10 |
| hidratacao_atual_litros | float | Média de hidratação |
| qualidade_sono_horas | float | Média de horas de sono |
| qualidade_sono_variacao_minutos | int | Variação em minutos |
| idade_biologica | int | Idade biológica (se definida) |

### Hábitos de Vida (`d_agente_habitos_vida_sistemica`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| paciente_id | UUID | FK para patients |
| pilar1_hidratacao_agua_ml_dia | float | Meta de água (ml/dia) |
| pilar2_prescricao_fase1_duracao | float | Meta exercício (min/dia) |
| pilar3_padrao_duracao_total | float | Meta sono (horas/dia) |
| created_at | timestamp | Data do registro |

### Refeições (`s_refeicao`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador |
| paciente_id / paciente | UUID | FK para patients |
| ref_1 | JSONB | Refeição 1: { principal: [...], substituicoes: {...} } |
| ref_2 | JSONB | Refeição 2 |
| ref_3 | JSONB | Refeição 3 |
| ref_4 | JSONB | Refeição 4 |
| created_at | timestamp | Data do registro |

**Estrutura JSONB de cada refeição:**
```json
{
  "principal": [
    { "alimento": "Ovo cozido", "quantidade": "2 unidades", "kcal": 156 }
  ],
  "substituicoes": {
    "proteinas": [{ "alimento": "Queijo branco", "quantidade": "40g", "kcal": 110 }],
    "carboidratos": [...],
    "gorduras": [...],
    "leguminosas": [...]
  }
}
```

### Exercícios (`s_exercicios_fisicos`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | Identificador |
| paciente_id | UUID | FK para patients |
| nome_exercicio | string | Nome do exercício |
| series | string | Número de séries (ex: "4") |
| repeticoes | string | Repetições (ex: "10-12") |
| descanso | string | Tempo de descanso (ex: "60s") |
| grupo_muscular | string | Grupo muscular (ex: "Peitoral") |
| nome_treino | string | Nome do treino (ex: "Treino A - Superior") |
| tipo_treino | string | Tipo (ex: "Musculação", "Aeróbico") |
| observacoes | string | Instruções especiais |

### Suplementação (`s_suplementacao2`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| paciente_id | UUID | FK para patients |
| consulta_id | UUID | FK para consultations (alternativo) |
| suplementos | JSON[] | Array de suplementos |
| fitoterapicos | JSON[] | Array de fitoterápicos |
| homeopatia | JSON[] | Array de homeopáticos |
| florais_bach | JSON[] | Array de florais |
| created_at | timestamp | Data do registro |

**Estrutura de cada item:**
```json
{
  "nome": "Vitamina D3",
  "dosagem": "5.000 UI",
  "horario": "Manhã, junto ao café da manhã",
  "objetivo": "Saúde óssea e imunidade",
  "data_inicio": "2026-01-15",
  "data_fim": "2026-07-15",
  "categoria": "Suplemento",
  "alertas_criticos": ""
}
```

### Livro da Vida (`s_agente_mentalidade_2`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| paciente_id | UUID | FK para patients |
| consulta_id | UUID | FK para consultations |
| resumo_executivo | text/JSON | Resumo psicológico |
| padrao_01 a padrao_10 | JSONB | Até 10 padrões comportamentais |
| higiene_sono | JSONB | Protocolo de sono |
| created_at | timestamp | Data do registro |

**Estrutura de cada padrão:**
```json
{
  "nome": "Autocobrança e Perfeccionismo",
  "subtitulo": "Padrão Central",
  "prioridade": "alta",
  "manifestacoes": ["Dificuldade em delegar tarefas", ...],
  "origens_conexoes": ["Ambiente familiar competitivo", ...],
  "orientacoes_transformacao": ["Praticar exercício de 'suficiência'", ...]
}
```

**Estrutura higiene_sono:**
```json
{
  "horario_dormir_recomendado": "22:30",
  "horario_acordar_recomendado": "06:30",
  "duracao_ideal_horas": 8,
  "orientacoes": ["Manter quarto escuro", "Evitar exercícios após 20h", ...]
}
```

### Consultas (`consultations`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador |
| patient_id | UUID | FK para patients |
| created_at | timestamp | Data da consulta |

*Usada como tabela intermediária para vincular dados de prescrição quando `paciente_id` direto não está disponível.*

---

## 12. Regras de Negócio Globais

### Carregamento de Dados

1. **Ordenação por data**: Todos os registros de prescrição (refeição, exercícios, suplementos, livro da vida) são ordenados por `created_at DESC` e limitados ao registro mais recente
2. **Fallback de identificação**: Se busca por `paciente_id` falha, sistema tenta buscar via última `consulta_id` do paciente
3. **Timeout**: Todas as requisições têm timeout de 8-10 segundos com até 2 retentativas
4. **Retry**: Em caso de erro de rede ou timeout, aguarda 1 segundo e tenta novamente

### Sessão e Autenticação

1. **Auto-refresh de token**: Token é renovado automaticamente quando restam menos de 5 minutos
2. **Detecção de foco**: Ao voltar à aba após 30+ segundos, sessão é verificada e renovada
3. **Persistência**: Sessão persiste no localStorage do navegador
4. **Logout**: Remove `paciente` e `user_auth_id` do localStorage, redireciona para login

### Check-in

1. **1 por dia**: Verificado pela data `data_checkin` no formato YYYY-MM-DD
2. **Atualização de métricas**: Após inserção de check-in, trigger no banco atualiza automaticamente `patient_metrics`
3. **Sem edição**: Check-in submetido não pode ser editado pelo paciente

### Dados de Prescrição

1. **Somente leitura**: Paciente visualiza mas não edita prescrições (alimentação, exercícios, suplementos, livro da vida)
2. **Última consulta**: Sempre exibe dados da consulta mais recente
3. **Dados opcionais**: Todos os campos de prescrição podem estar ausentes — o sistema exibe mensagem "Nenhum dado cadastrado" quando vazio

### Formatação

1. **Datas**: Armazenadas como YYYY-MM-DD, exibidas como DD/MM/YYYY
2. **Telefone**: Armazenado como dígitos, exibido como (XX) XXXXX-XXXX
3. **Valores numéricos**: Arredondados para 1 casa decimal na exibição
4. **Percentuais**: Arredondados para inteiro, limitados a 100% máximo
5. **Horas**: Convertidas para formato Xh:YYmin na exibição

---

*Documento gerado em 02/04/2026. Reflete o estado atual da aplicação incluindo dados mock para demonstração visual.*
