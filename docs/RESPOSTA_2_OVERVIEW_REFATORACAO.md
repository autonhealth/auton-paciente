# Resposta ao "Overview da Refatoração" — confirmação + 1 heads-up do banco live

> **De:** lado do **app do paciente** (`pacientes-auton-api`).
> **Para:** lado do **sistema do médico** (`auton-health`).

---

## 1. ✅ Confirmado — estamos alinhados

Concordamos 100% com o overview. Do nosso lado, varrido e confirmado:

- **Ambos os apps no projeto `mtjgjvwpjwwmnebdholz`.** Nossos dois `.env` (api e web) apontam pra `https://mtjgjvwpjwwmnebdholz.supabase.co`.
- **Zero referência** ao projeto antigo `wefyknlketrgskuxgcya` no nosso código.
- O backend do paciente só consulta tabelas do **schema novo**: `pacientes`, `solucao`, `prescricoes_paciente`, `protocolos_alimentares_paciente`. Nenhum `from('s_*')`/`from('patients')`.
- Resíduo encontrado e **já limpo**: apenas **comentários** no nosso arquivo de mock rotulavam seções com nomes antigos (`s_refeicao`, etc.) — atualizamos pros nomes reais. Nenhuma query usava nomes legados.
- Tratamos o `FUNCIONALIDADES_APP_PACIENTE.md` como **histórico**; o `CONTRATO_DADOS_APP_PACIENTE.md` é o atual.

---

## 2. ⚠️ Heads-up: a `solucao` LIVE tem MENOS colunas que o overview lista

Verifiquei `information_schema` no live. A tabela **`public.solucao` tem exatamente 13 colunas**:

```
id, consulta_id, paciente_id, medico_id, criado_em, atualizado_em, concluido,
mentalidade (jsonb), refeicao (jsonb), suplementacao (jsonb), treinos (jsonb),
etapa_concluida, itens_visiveis (jsonb)
```

O overview de vocês cita `solucao.fitoterapicos`, `solucao.habitos_vida` e `solucao.limpeza_terreno` — **essas colunas NÃO existem no banco live.** Confirmado: uma query em `solucao.fitoterapicos` retorna `ERROR: column "fitoterapicos" does not exist`. (Provavelmente existem nas migrations/código, mas não foram aplicadas no homolog — mesma classe de drift dos `s_*`.)

**Implicações práticas (pra não repetir o bug dos `s_*`):**
- **Fitoterápicos:** nós lemos os fitoterápicos **de dentro de `solucao.suplementacao`** (key aninhada `fitoterapicos`) — e isso **tem dado e funciona** (validado com paciente real). Ao consolidar, **gravem fitoterápicos dentro de `solucao.suplementacao`**, não numa coluna `solucao.fitoterapicos` (que não existe). Shape:
  ```json
  "suplementacao": { "suplementos": [...], "fitoterapicos": [...], "homeopatia": [...], "florais_bach": [...] }
  ```
- **Metas / hábitos:** não há `solucao.habitos_vida` no live. A fonte de metas é `diagnostico.habitos_vida` (texto livre hoje) — ou o `solucao.metas` numérico que combinamos criar (Q3 da resposta anterior). Se forem criar `solucao.metas`, lembrem que é **coluna nova** (precisa `ALTER TABLE`/migration aplicada no homolog), senão dá o mesmo erro.

> Sugestão: antes de gravar em qualquer coluna de `solucao`, confirmem no live com
> `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='solucao';`
> Se quiserem, a gente roda e manda — temos leitura no live.

---

## 3. Nada muda pro nosso lado

Nossos adaptadores já leem `suplementacao` (com fitoterápicos aninhados), `refeicao`, `mentalidade`, `treinos`, `itens_visiveis`, e `pacientes`. **Tudo no schema novo, tudo certo.** Seguimos prontos: quando vocês gravarem treino/visibilidade/higiene_sono/metas, é só mandar o `consulta_id` que confirmamos no live na hora.
