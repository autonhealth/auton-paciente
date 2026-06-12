# Resposta ao lado do médico — verificação no banco LIVE + consenso

> **De:** lado do **app do paciente** (`pacientes-auton-api`).
> **Para:** lado do **sistema do médico** (`auth-health`).
> **Contexto:** resposta ao seu retorno sobre o `CONTRATO_DADOS_APP_PACIENTE.md`. Concordamos com quase tudo. Abaixo: (1) a verificação no **banco live** que vocês pediram no §6, (2) as respostas aos pontos de consenso (§4), (3) alinhamento sobre o "contrato dividido" (§2).

---

## 0. TL;DR
- ✅ **Verifiquei no banco live** (`mtjgjvwpjwwmnebdholz`) — temos acesso de leitura via service_role.
- 🔴 **As tabelas `s_*` (legado) NÃO EXISTEM no live.** Seus controllers de edição manual gravam em tabelas inexistentes aqui → ou apontam pra outro banco, ou as edições falham. **Consolidar em `solucao.*` é obrigatório, não opcional.**
- ✅ Confirmado no live: `itens_visiveis` sempre `true`, `treinos.status = "aguardando_anamnese"`.
- ✅ Mandamos os **shapes definitivos** de `treinos` e `higiene_sono` (§2 abaixo).
- ✅ **Decisões de produto:** metas = **números limpos** (opção a); check-ins = **fora de escopo por ora**.

---

## 1. Verificação no banco LIVE (o que vocês pediram no §6)

Rodamos no live `mtjgjvwpjwwmnebdholz`:

**(a) `solucao` tem as colunas esperadas?** ✅ Sim — `criado_em`, `atualizado_em`, `itens_visiveis` (jsonb), e os domínios `refeicao`/`suplementacao`/`mentalidade`/`treinos` (jsonb). A query rodou sem erro selecionando todas.

**(b) `SELECT itens_visiveis, treinos->>'status' ... ORDER BY criado_em DESC LIMIT 5`:**
| criado_em | itens_visiveis | treino_status | ref | supl | ment |
|-----------|----------------|---------------|-----|------|------|
| 2026-06-10 22:42 | `{...todos true}` | `aguardando_anamnese` | ✅ | ✅ | ✅ |
| 2026-06-10 22:09 | `{...todos true}` | `aguardando_anamnese` | ✅ | ✅ | ✅ |
| 2026-06-10 21:21 | `{...todos true}` | `aguardando_anamnese` | ✅ | ✅ | ✅ |
| 2026-06-10 21:14 | `{...todos true}` | `aguardando_anamnese` | ✅ | ✅ | ✅ |
| 2026-06-05 19:44 | `{...todos true}` | `null` | ✅ | ✅ | ✅ |
→ Confirma os 2 bugs: visibilidade nunca grava `false`; treino nunca é prescrito.

**(c) 🔴 As tabelas legadas `s_*` recebem escrita?** **NÃO — elas NÃO EXISTEM no live.**
```sql
SELECT table_schema, table_name FROM information_schema.tables
WHERE table_name IN ('s_refeicao','s_suplementacao','s_suplementacao2','s_exercicios_fisicos','s_agente_mentalidade_2');
-- resultado: 0 linhas (nenhuma existe, em nenhum schema)
```
**Implicação crítica:** seus controllers de edição manual (`solucoesController.ts` gravando em `s_refeicao`/`s_suplementacao2`/`s_exercicios_fisicos`) estão escrevendo em tabelas que **não existem neste banco**. Ou (i) esses controllers apontam para outro projeto/banco (prod? legado?), ou (ii) as edições manuais estão **falhando silenciosamente** no homolog. Vale vocês confirmarem a connection string desses controllers. De todo jeito: **a correção é mover essas escritas para `solucao.{refeicao,suplementacao,treinos}`** (que existe e é o que o paciente lê).

---

## 2. Respostas aos pontos de consenso (§4)

### Q1 — Shape canônico de `solucao.treinos` ✅ (definido pelo nosso código)
Nosso app lê `treinos.exercicios` (array) e **agrupa por `nome_treino` de cada exercício** (suportamos A/B/C nativamente — basta cada exercício ter seu `nome_treino`). Shape canônico:
```json
{
  "status": "prescrito",
  "exercicios": [
    { "nome_treino": "Treino A", "nome": "Supino reto",  "grupo_muscular": "Peitoral", "series": 4, "repeticoes": "10-12", "descanso": "60s", "observacoes": "..." },
    { "nome_treino": "Treino A", "nome": "Crucifixo",     "grupo_muscular": "Peitoral", "series": 3, "repeticoes": "12",    "descanso": "45s", "observacoes": "" },
    { "nome_treino": "Treino B", "nome": "Agachamento",   "grupo_muscular": "Pernas",   "series": 4, "repeticoes": "10",    "descanso": "90s", "observacoes": "" }
  ]
}
```
Respondendo direto:
- **`status`:** o app **não trava num valor específico** — ele renderiza `exercicios` se houver, senão mostra "Nenhum exercício prescrito". Use `"prescrito"` (ou qualquer ≠ `"aguardando_anamnese"`). Mantenha `"aguardando_anamnese"` enquanto não houver treino.
- **Múltiplos treinos (A/B/C):** **sim**, suportado. **Tudo num único `exercicios[]`**, cada item com seu `nome_treino`. O front renderiza 1 card por `nome_treino` distinto. (Não precisa de array de treinos aninhado.)
- **Tipos:** `series` pode ser número ou string; `repeticoes`/`descanso` strings. Campos por exercício lidos: `nome` (aceita `nome_exercicio`), `grupo_muscular`, `series`, `repeticoes`, `descanso`, `observacoes`, `nome_treino`. Mapear 1:1 de `cadastro_treino_exercicios` resolve.

### Q2 — Shape de `solucao.mentalidade.higiene_sono` ✅
Shape definitivo que o app lê:
```json
"higiene_sono": {
  "horario_dormir":  "22:30",
  "horario_acordar": "06:30",
  "duracao":         "8h",
  "orientacoes":     ["Manter o quarto escuro", "Evitar telas após 21h", "..."]
}
```
- Nomes canônicos: **`horario_dormir`, `horario_acordar`, `duracao`, `orientacoes`** (array de strings).
- Nosso adapter também aceita aliases: `horario_dormir_recomendado`, `horario_acordar_recomendado`, `duracao_ideal_horas`, `duracao_alvo`. **Não** lemos `meta_duracao`/`meta_horario_dormir` — se preferirem esses nomes, nos avisem que adicionamos o alias; senão, gravem nos nomes canônicos acima.

### Q3 — Metas (água/exercício/sono) → **opção (a): números limpos** ✅
Escolhemos a **opção (a)**. Preferência de local (pra evitar query extra do nosso lado, já que sempre buscamos a `solucao`):
```json
// em solucao:
"metas": { "agua_ml": 2400, "exercicio_min": 60, "sono_horas": 8 }
```
- **Preferido:** `solucao.metas` com esses 3 números limpos.
- **Alternativa aceitável:** manterem em `diagnostico.habitos_vida` mas exporem campos **numéricos** novos (`meta_agua_ml`, `meta_exercicio_min`, `meta_sono_horas`); nesse caso a gente passa a buscar a última `diagnostico` também.
- Qualquer uma das duas resolve. Só **não** queremos depender do texto livre atual (`"2000-2200"`, `"30-60min/sessão"`).

### Q4 — Check-ins / `patient_metrics` → **fora de escopo por ora** ✅
Confirmado: **fica fora de escopo agora**, seguem mock no app do paciente (Dashboard de equilíbrio/idade biológica/aderência/gráfico). Quando for priorizado:
- É **escrita do paciente** → quem registra check-in é o app do paciente. Proposta: **a tabela `daily_checkins` e o caminho de escrita ficam com o lado do paciente** (`pacientes-auton-api` grava via service_role escopando pelo JWT do paciente; ou RLS de escrita por paciente). `patient_metrics` pode ser derivada via trigger ou calculada no nosso backend.
- Especificamos isso num doc separado quando entrar no roadmap.

### Q5 — Chave "mais recente" ✅
Confirmado: lemos a **última `solucao` por `criado_em`** para o `paciente_id` (e a última `diagnostico`, se formos usar metas de lá). Como `solucao` é 1:1 com `consulta`, isso = a `solucao` da consulta mais recente. **Por favor gravem sempre na `solucao` mais recente** (não numa anterior). Combinado.

---

## 3. Sobre o "contrato dividido" (§2) e os quick-wins (§5)

Seu achado do §2 é **o ponto central** — e o live confirma que é ainda mais grave: como as `s_*` **não existem aqui**, as edições manuais não estão chegando a lugar nenhum no homolog. Então:
- ✅ **Quick-win 2 (unificar escrita em `solucao.*`)** é a prioridade nº 1. Assim que a edição manual gravar em `solucao.{refeicao,suplementacao,treinos}`, ela aparece pro paciente na hora (igual o Livro da Vida).
- ✅ **Quick-win 1 (`itens_visiveis`)**: perfeito. Quando o `POST .../update-visibility` gravar `false`, **nosso app já reage** — hoje ele devolve `visivel:false` e esconde os dados do módulo. **Observação:** hoje o módulo oculto vira "tela vazia"; o **item de menu continua aparecendo**. Se vocês quiserem que ele **suma do menu** de vez, nos avisem que fazemos esse ajuste no nosso front (lemos `itens_visiveis` e escondemos a navegação). É decisão de UX de vocês.
- ⚠️ **Atenção ao formato de suplementação:** vocês citaram que `s_suplementacao2` guarda **array de JSON-strings**. Hoje o `solucao.suplementacao` que lemos vem em formatos variados (array de objetos, string-JSON, ou texto). **Nosso adapter já tolera os 3**, mas o **ideal** ao consolidar é gravar **array de objetos** por categoria: `{ suplementos: [{nome, objetivo, dosagem, horario, data_inicio, data_fim}], fitoterapicos:[...], homeopatia:[...], florais_bach:[...] }`.

---

## 4. Próximos passos sugeridos
1. **Vocês:** confirmar a connection string dos controllers `s_*` (pra entender pra onde as edições manuais vão hoje).
2. **Vocês (quick-win 1):** implementar `update-visibility` gravando `false` em `solucao.itens_visiveis`. → nós validamos no live na hora.
3. **Vocês (quick-win 2):** consolidar edição manual de alimentação/suplementos/treino em `solucao.*` (array de objetos p/ suplementação).
4. **Vocês:** prescrição de treino no shape do Q1 + higiene do sono no shape do Q2.
5. **Ambos:** metas → escolher `solucao.metas` (preferido) ou `diagnostico` numérico.
6. **Depois:** check-ins/métricas como feature separada (lado paciente dono).

> Conforme vocês forem gravando, **mandem o `consulta_id`** que a gente confirma no banco live em segundos se o dado caiu certo (igual fizemos pra `itens_visiveis` e `treinos`).
