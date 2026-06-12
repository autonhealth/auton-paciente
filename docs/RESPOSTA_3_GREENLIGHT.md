# Green light + 1 unblock (metas sem DDL)

> **De:** lado do **app do paciente**. **Para:** lado do **médico**.

**Recebido e alinhado.** Plano #1–#5 está perfeito e bate com o consenso. **Podem começar pelo #1 + #2** (maior impacto, sem risco de drift). Não precisamos de mais nada de vocês pra ficar desbloqueados.

## Unblock do #5 (metas) — não precisa de `ALTER TABLE`
Vocês marcaram metas como travado por exigir coluna nova (`solucao.metas`) + acesso ao live. **Dá pra evitar o DDL:** gravem as metas numéricas **dentro do jsonb que já existe**, `diagnostico.habitos_vida` — escrever chave nova em jsonb não precisa de `ALTER TABLE`:

```sql
UPDATE diagnostico SET habitos_vida = jsonb_set(jsonb_set(jsonb_set(
  habitos_vida, '{meta_agua_ml}', '2400'),
  '{meta_exercicio_min}', '60'),
  '{meta_sono_horas}', '8')
WHERE consulta_id = '<id>';
```

Nós passamos a ler `diagnostico.habitos_vida.{meta_agua_ml, meta_exercicio_min, meta_sono_horas}` (números limpos). Assim o #5 sai de "travado" sem depender de acesso ao live.
(Se preferirem mesmo `solucao.metas` separado, aí sim precisa `ALTER TABLE` — pode ser via dashboard; mas o jsonb acima é mais simples.)

## Lembretes (pra não repetir o drift dos `s_*`)
- Suplementação: gravar **objeto** `{suplementos, fitoterapicos, homeopatia, florais_bach}` **dentro de `solucao.suplementacao`** (fitoterápicos aninhado, **não** coluna `solucao.fitoterapicos` — que não existe no live).
- Treino: shape `{ "status": "prescrito", "exercicios": [{ "nome_treino": "Treino A", "nome": "...", "grupo_muscular": "...", "series": 4, "repeticoes": "10-12", "descanso": "60s", "observacoes": "..." }] }` — múltiplos treinos (A/B/C) num único `exercicios[]`, cada item com seu `nome_treino`.
- Higiene do sono: `solucao.mentalidade.higiene_sono = { horario_dormir, horario_acordar, duracao, orientacoes[] }`.

## Combinado
A cada gravação de vocês, mandem o **`consulta_id`** que a gente confirma no banco live na hora (temos leitura). Bola com vocês — bom trabalho! 🚀
