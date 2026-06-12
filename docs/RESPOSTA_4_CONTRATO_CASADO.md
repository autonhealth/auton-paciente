# Recebido o handoff — nosso lado JÁ casou o contrato de leitura

> **De:** lado do **app do paciente** (`pacientes-auton-api`).
> **Para:** lado do **sistema do médico** (`auton-health`).

Recebemos o handoff. **Ajustamos o app do paciente para ler exatamente os shapes canônicos que vocês vão gravar.** Backend (`tsc`) e front (build CRA) verdes, + self-test dos shapes passando. Checklist do §6 confirmado abaixo.

---

## ✅ Checklist do §6 — confirmado do nosso lado

| Item | Status | Nota |
|------|--------|------|
| `solucao.suplementacao` como objeto (4 categorias, arrays); tolerar string legado | ✅ | Já tolerávamos array de objetos, string-JSON **e** string-prosa (legado vira 1 item, não quebra). Fitoterápicos lidos **aninhados** em `suplementacao.fitoterapicos`. |
| `solucao.refeicao` como objeto `ref_1..ref_N` (tolerar embrulho `[{content:…}]`) | ✅ **(ajustado)** | Antes líamos só `ref_1..ref_4`; agora lemos **ref_N dinâmico** + desembrulhamos `[{content}]`/`{content}`. `gramas` agora aceito como **string com unidade** (`"120g"`) ou número. |
| `solucao.treinos.exercicios[]` agrupando por `nome_treino` (fallback do topo) | ✅ | Já agrupamos por `nome_treino`; usamos o `nome_treino` do topo como fallback (shape do agente) e lemos `nome_exercicio`. `status: true` ok. |
| `solucao.mentalidade.higiene_sono` (objeto de strings) | ✅ **(ajustado)** | Lemos `horario_dormir/acordar`, `duracao` e `orientacoes[]`. **Ver nota importante abaixo** sobre `meta_*`. |
| Respeitar `solucao.itens_visiveis` (`false` ⇒ ocultar) | ✅ **(ajustado)** | Agora **ocultamos o módulo do menu** (Sidebar + BottomNav) quando vier `false` — não é mais só "tela vazia". Chaves: `livro_vida/alimentacao/suplementacao/treinamentos`. Ausência = visível. |
| `diagnostico.habitos_vida.{meta_agua_ml,meta_exercicio_min,meta_sono_horas}` com `Number()`; ausente/null = sem meta | ✅ **(ligado)** | Saímos do mock. Endpoint novo lê esses campos, faz `Number()` e **trata ausente/null/"" como "sem meta" → cai num default sensato (nunca 0)**. |
| Coluna vazia/null = "sem dado" (estado vazio, não erro) | ✅ | Todos os módulos tratam vazio/null como empty-state. |

---

## ⚠️ 1 ponto pra vocês confirmarem — Higiene do Sono: recomendado vs. atual

O `higiene_sono` de vocês tem **dois conjuntos**: o padrão atual (`horario_dormir`, `horario_acordar`, `duracao_media`) e a **meta/recomendação** (`meta_horario_dormir`, `meta_horario_acordar`, `meta_duracao`).

Como a seção do app se chama **"Higiene do Sono"** (protocolo/recomendação), nós **mostramos os campos `meta_*` (recomendado)** nos cards Dormir/Acordar/Duração, caindo no padrão atual só se a meta não existir. Ex.: no seu exemplo, o card "Dormir" mostra **`22:30 - 23:00`** (meta), não `00:30 - 01:15` (hábito atual).

👉 **Se a intenção era mostrar o padrão ATUAL** (não a meta), nos avisem — é um flip de 1 linha. Achamos que recomendado faz mais sentido pro paciente, mas a decisão é de vocês.

---

## 📋 Notas menores (não bloqueiam)

- **Suplementação — alertas críticos:** vocês embutem os alertas no `objetivo` (com ⚠️/🔴). Nós exibimos o `objetivo` inteiro, então **o alerta aparece junto** (não temos caixa vermelha dedicada). Se quiserem destaque separado, gravem `alertas_criticos` no item — já lemos esse campo.
- **Refeição sem `kcal`:** o shape de edição manual (`{alimento, gramas, observacao}`) não traz `kcal`. Hoje exibimos `0 kcal` quando ausente. Se a edição manual **não** for incluir kcal, a gente esconde o "0 kcal" (me confirmem que faço o ajuste). Refeições do agente (com kcal) seguem mostrando normal.
- **Categoria de suplemento vazia (`[]`):** lemos sem quebrar — apenas não renderizamos a categoria. 👍

---

## Loop de validação
Estamos prontos. **Mandem o `consulta_id`** de cada domínio conforme forem gravando (ordem sugerida: suplementação → alimentação → treino → higiene do sono → metas → visibilidade) que confirmamos no **banco live na hora** e batemos a renderização. 🚀
