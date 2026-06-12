# Contrato de Dados — App do Paciente (AUTON Health)

> **Para quem é este documento:** a equipe / IA que trabalha no **sistema do médico** (`auton-health`).
> **Objetivo:** descrever EXATAMENTE o que o **app do paciente** lê do banco compartilhado, para que o sistema do médico grave os dados nos lugares certos e tudo funcione 100% no app do paciente.
>
> Regra de ouro: **o app do paciente é (quase) SOMENTE LEITURA.** Quase tudo que aparece nele precisa ter sido gravado pelo sistema do médico, no lugar e formato descritos aqui. Se não estiver no banco no formato certo, o paciente não vê.

---

## 1. Arquitetura

- **Banco único** Supabase (homolog: `mtjgjvwpjwwmnebdholz`). Os dois apps compartilham o mesmo Postgres.
- **App do médico** (`auton-health`): **ESCREVE** os dados (anamnese, diagnóstico, solução, prescrições).
- **App do paciente**: **SÓ LÊ**. Tem um backend próprio (`pacientes-auton-api`, Fastify + `supabase-js` com a **service_role key**) que lê o banco (ignorando RLS) e entrega pro front. A segurança por-paciente é feita no código do backend (valida o JWT do paciente e escopa tudo por ele). **Não é preciso mexer na RLS.**

---

## 2. Como o app do paciente encontra os dados (vale para TODOS os módulos)

```
1. Paciente loga via Supabase Auth  →  claim `sub` do JWT = auth.users.id
2. pacientes WHERE usuario_auth = <sub> AND deletado IS NOT TRUE     → o paciente
3. solucao  WHERE paciente_id = <paciente.id>
            ORDER BY criado_em DESC LIMIT 1                          → a SOLUÇÃO ATUAL
4. (metas)  diagnostico WHERE paciente_id = <paciente.id>
            ORDER BY criado_em DESC LIMIT 1                          → o DIAGNÓSTICO ATUAL
```

### Pré-requisitos para um paciente VER qualquer coisa
1. `pacientes.deletado = false` (ativo)
2. `pacientes.usuario_auth` preenchido — precisa ser o **id de um usuário em `auth.users`** (com email/senha, pra ele conseguir logar)
3. existir ao menos uma linha em `solucao` para esse `paciente_id`

### ⚠️ Regra crítica: "mais recente"
O app sempre lê a `solucao` (e o `diagnostico`) com **maior `criado_em`**. Se o médico gera/edita a prescrição, **ela precisa estar na solução mais recente** (ou ser a mais recente).

---

## 3. Contrato por módulo

### 3.1 Perfil — lê de `pacientes`  ✅
Campos: `id`, `nome`, `email`, `telefone`, `data_nascimento`, `cpf`, `genero`, `cidade`, `estado`, `foto_perfil`. (O app não edita perfil — read-only.)

### 3.2 Alimentação — lê de `solucao.refeicao` (jsonb)  ✅
```json
{
  "ref_1": {
    "principal": [{ "alimento": "Arroz integral, cozido", "gramas": 80, "kcal": 99, "categoria": "carboidratos" }],
    "substituicoes": {
      "proteinas":   [{ "alimento": "Frango grelhado", "gramas": 100, "kcal": 165 }],
      "carboidratos":[...], "gorduras":[...], "leguminosas":[...]
    }
  },
  "ref_2": {...}, "ref_3": {...}, "ref_4": {...}
}
```
Chaves fixas `ref_1`..`ref_4`; itens com `alimento`, `gramas`, `kcal`, `categoria`. Substituições agrupadas por `proteinas`/`carboidratos`/`gorduras`/`leguminosas`.

### 3.3 Suplementos — lê de `solucao.suplementacao` (jsonb)  ✅
Objeto com 4 categorias, cada uma um **array de itens**:
```json
{
  "suplementos":   [{ "nome": "...", "objetivo": "...", "dosagem": "...", "horario": "...", "data_inicio": "DD/MM/YYYY", "data_fim": "..." }],
  "fitoterapicos": [...], "homeopatia": [...], "florais_bach": [...]
}
```
> O app tolera 3 formatos por categoria: array de objetos (ideal), string JSON `"[{...}]"`, ou texto corrido com rótulos `Dosagem:/Horário:/Início:/Término:`. **Recomendado: array de objetos.**

### 3.4 Livro da Vida — lê de `solucao.mentalidade` (jsonb)  ✅ ⭐ REFERÊNCIA QUE FUNCIONA
```json
{
  "resumo_executivo": "texto..."  // OU { "mensagem_personalizada": "texto..." }
  ,
  "padrao_01": {
    "padrao": "Nome do padrão",
    "categorias": ["..."],
    "prioridade": 1,                         // 1=alta, 2=média, 3=baixa
    "areas_impacto": ["..."],
    "origem_estimada":  { "periodo": "...", "contexto_provavel": "..." },
    "conexoes_padroes": { "raiz_de": ["..."], "explicacao": "...", "alimentado_por": [], "relacionado_com": ["..."] },
    "manifestacoes_atuais": ["..."],
    "orientacoes_transformacao": [{ "nome": "...", "passo": 1, "o_que_fazer": "...", "como_fazer": "...", "porque_funciona": "..." }]
  },
  "padrao_02": {...}, "...": "...", "padrao_10": {...}
}
```
**Status: ✅ FUNCIONA e é a REFERÊNCIA.** Confirmado: editar no app do médico grava aqui (o `solucao.atualizado_em` muda) e o paciente passa a ver. **Use como modelo do comportamento que os módulos quebrados precisam ter.**

#### 3.4.1 Higiene do Sono — `solucao.mentalidade.higiene_sono`  ❌ NUNCA PREENCHIDO
A tela Livro da Vida tem uma seção "Higiene do Sono" que lê:
```json
"higiene_sono": {
  "horario_dormir": "22:30",
  "horario_acordar": "06:30",
  "duracao": "8h",
  "orientacoes": ["Manter o quarto escuro", "Evitar telas após 21h", "..."]
}
```
**🔴 Problema:** em **0 de 8** soluções com `mentalidade`, o campo `higiene_sono` existe. O app trata `null` (a seção some).
**✅ O que precisa:** gravar `higiene_sono` dentro de `solucao.mentalidade`. Os dados-fonte já existem em `diagnostico.habitos_vida` (campos `pilar3_rotina_sono_horario_dormir_recomendado`, `pilar3_rotina_sono_horario_acordar_recomendado`, `pilar3_padrao_duracao_total`, `pilar3_rotina_sono_rotina_pre_sono`, `pilar3_rotina_sono_gatilhos_evitar`, ...) — basta consolidar nesse shape.

### 3.5 Exercício — lê de `solucao.treinos` (jsonb)  ❌ NÃO FUNCIONA HOJE
```json
{
  "status": "ok",
  "nome_treino": "Treino A",
  "grupos_musculares": ["Peitoral"],
  "exercicios": [
    { "nome": "Supino reto", "grupo_muscular": "Peitoral", "series": 4, "repeticoes": "10-12", "descanso": "60s", "observacoes": "..." }
  ]
}
```
**🔴 Problema:** em TODAS as soluções, `treinos.status = "aguardando_anamnese"` e `exercicios = null`. O app do médico mostra um treino (da biblioteca `cadastro_treinos`), mas **NÃO grava em `solucao.treinos`**. Por isso o paciente vê "Nenhum exercício prescrito". (Suspeita: essa parte do app do médico ainda é **mock** — o "Treino A" na biblioteca está vazio no banco.)
**✅ O que precisa:** ao **prescrever**, serializar e gravar os exercícios em `solucao.treinos.exercicios` (e `status` ≠ "aguardando_anamnese"). É o que o comentário da tabela `cadastro_treinos` já manda: *"Para prescrever: serializar → jsonb_set em solucao.treinos."* Fonte dos exercícios: `cadastro_treino_exercicios` (`exercicio_nome`, `exercicio_grupo_muscular`, `series`, `repeticoes`, `descanso`, `observacao`, `ordem`).
**Verificar:** `SELECT treinos->'exercicios' FROM solucao WHERE consulta_id='<id>' ORDER BY criado_em DESC LIMIT 1;`

### 3.6 Visibilidade / "ocultar módulos" — lê de `solucao.itens_visiveis` (jsonb)  ❌ NÃO FUNCIONA HOJE
```json
{ "livro_vida": true, "alimentacao": true, "treinamentos": true, "suplementacao": true }
```
O app do paciente **já respeita**: valor `false` → esconde o módulo.
**🔴 Problema:** nas **9** soluções, todos os 4 campos são SEMPRE `true`. O "ocultar" do app do médico **nunca grava `false`**.
**✅ O que precisa:** ao marcar "ocultar X", gravar `false` no campo:
| Toggle no médico | Campo |
|------------------|-------|
| Ocultar Livro da Vida | `itens_visiveis.livro_vida` |
| Ocultar Alimentação | `itens_visiveis.alimentacao` |
| Ocultar Atividade Física | `itens_visiveis.treinamentos` |
| Ocultar Suplementos | `itens_visiveis.suplementacao` |

### 3.7 Metas de hábitos (água, exercício, sono) — lê de `diagnostico.habitos_vida` (jsonb)  ⚠️ MOCK HOJE
Telas: Dashboard (cards Hidratação/Exercício/Sono — o "alvo"/meta) e Alimentação (meta de água).
Fonte: a última `diagnostico` do paciente, domínio JSONB `habitos_vida`.
| Meta | Campo em `diagnostico.habitos_vida` |
|------|-------------------------------------|
| 💧 Água (ml/dia) | `pilar1_hidratacao_agua_ml_dia` |
| 🏃 Exercício (min/dia) | `pilar2_prescricao_fase1_duracao` |
| 😴 Sono (h/noite) | `pilar3_padrao_duracao_total` |
**⚠️ Formato é TEXTO LIVRE e inconsistente.** Valores reais observados: água = `"500"`, `"2000-2200"`, `"Não mencionado"`, `""`; exercício = `"30-60min/sessão"`; sono = `"4-7h/noite"`. **Não são números limpos.**
**Status: mock hoje** (front retorna `MOCK_HABITOS_VIDA`). Dá pra plugar lendo de `diagnostico.habitos_vida` com parsing tolerante (extrair o 1º número) — **ou (ideal)** o sistema do médico exporia metas numéricas limpas (ex.: `meta_agua_ml`, `meta_exercicio_min`, `meta_sono_horas`).

---

## 4. Funcionalidades que HOJE são mock (sem fonte real no banco)

Estas partes **não têm tabela/fonte real** no banco atual — seguem mock. Para funcionarem, é preciso criar a fonte (e, em alguns casos, decisão de produto).

### 4.1 Check-ins Diários — tabela `daily_checkins` **NÃO EXISTE**
O paciente registraria diariamente: `sono_qualidade` (0-10), `sono_tempo_horas` (0-12), `atividade_tempo_horas` (0-5), `atividade_intensidade` (0-100), `alimentacao_refeicoes` (0-6), `alimentacao_agua_litros` (0-4), `data_checkin` (date).
⚠️ É uma feature de **ESCRITA do paciente** → conflita com o app ser read-only. Precisa: (a) criar `daily_checkins`; (b) decidir se/como o paciente escreve (endpoint POST com auth).

### 4.2 Métricas do Dashboard — tabela `patient_metrics` **NÃO EXISTE**
`equilibrio_geral`, `equilibrio_sono`, `equilibrio_atividade_fisica`, `equilibrio_alimentacao`, `hidratacao_atual_litros`, `qualidade_sono_horas`, `idade_biologica`. No design original são **calculadas dos check-ins** (trigger). Sem `daily_checkins`+`patient_metrics`, o Dashboard de métricas é mock.
- **Idade biológica:** sem `patient_metrics`, o app usa o fallback de **idade cronológica** via `pacientes.data_nascimento` (isso funciona).
- **Equilíbrio / aderência ao protocolo / gráfico de evolução:** dependem 100% dos check-ins → mock.

### 4.3 Notificações de check-in (Navbar) — mock
Badge de "check-in pendente". Sem endpoint; depende dos check-ins.

### 4.4 Troca de senha (Perfil) — ✅ já funciona (Supabase Auth)
`supabase.auth.updateUser({ password })` escreve em `auth.users`, não no banco clínico. Não depende do sistema do médico.

### 4.5 Módulos que NÃO existem no app atual
"Módulo Educacional" e "Evolução do Paciente / Composição Corporal" aparecem na spec antiga, mas **não existem no app atual** (sem páginas nem rotas). Fora de escopo — só relevante se forem reimplementados.

---

## 5. Resumo dos ajustes no sistema do médico (action items)

| # | Item | Problema hoje | O que fazer | Onde gravar |
|---|------|---------------|-------------|-------------|
| 1 | **Exercício** | treino não grava | persistir `exercicios[]` ao prescrever | `solucao.treinos` |
| 2 | **Ocultar módulos** | "ocultar" não grava `false` | persistir os booleans | `solucao.itens_visiveis.*` |
| 3 | **Higiene do Sono** | nunca preenchido | gravar o objeto `higiene_sono` | `solucao.mentalidade.higiene_sono` |
| 4 | **Metas (água/exercício/sono)** | texto livre / só no diagnóstico | (ideal) expor metas numéricas limpas | `diagnostico.habitos_vida` ou campos novos |
| 5 | **Check-ins + métricas** | tabelas não existem | criar `daily_checkins` + `patient_metrics` (+ trigger) — decisão de produto | tabelas novas |
| ⭐ | **Livro da Vida** | — (funciona) | **usar como modelo** | `solucao.mentalidade` |

> O padrão correto **já existe** (Livro da Vida): editar no médico → `jsonb_set` no campo da `solucao` → `atualizado_em` muda → paciente vê. Replicar isso para `treinos`, `itens_visiveis` e `mentalidade.higiene_sono`.

---

## 6. Observações finais
- Gravar sempre na **solução/diagnóstico mais recentes** (`ORDER BY criado_em DESC`).
- O app do paciente **não escreve** (exceto troca de senha via Supabase Auth) — não conte com ele pra persistir nada clínico.
- Não é preciso alterar RLS (o backend do paciente usa service_role e escopa por paciente no código).
- Identificação: `pacientes.usuario_auth = auth.users.id`. Garanta `usuario_auth` preenchido, `deletado = false`, e uma `solucao`.

---

### Referência rápida (fonte → tela do paciente)
| Fonte no banco | Tela | Status |
|----------------|------|--------|
| `pacientes` | Perfil | ✅ |
| `solucao.refeicao` | Alimentação | ✅ |
| `solucao.suplementacao` | Suplementos | ✅ |
| `solucao.mentalidade` (padrões + resumo) | Livro da Vida | ✅ (referência) |
| `solucao.mentalidade.higiene_sono` | Livro da Vida → Higiene do Sono | ❌ médico nunca grava |
| `solucao.treinos` | Exercício Físico | ❌ médico não grava (mock) |
| `solucao.itens_visiveis` | Ocultar módulos | ❌ médico não grava |
| `diagnostico.habitos_vida` | Metas (água/exercício/sono) | ⚠️ existe mas texto livre; front ainda mock |
| `daily_checkins` (**não existe**) | Check-in diário | ❌ mock (tabela não existe + é escrita) |
| `patient_metrics` (**não existe**) | Dashboard: equilíbrio, idade biológica, aderência, gráfico | ❌ mock (tabela não existe) |
| `auth.users` (Supabase Auth) | Troca de senha (Perfil) | ✅ funciona |
| — | Notificações de check-in | ❌ mock |
| — | Educacional / Composição corporal | ⛔ não existem no app atual |
