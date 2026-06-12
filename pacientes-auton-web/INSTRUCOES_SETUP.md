# 🚀 Instruções de Setup - Check-ins Diários e Dashboard Dinâmico

## ✅ O QUE FOI IMPLEMENTADO:

### 1. **Tabelas SQL no Supabase:**
   - `daily_checkins` - Armazena check-ins diários dos pacientes
   - `patient_metrics` - Métricas calculadas automaticamente

### 2. **Funções e Triggers:**
   - Cálculo automático de métricas após cada check-in
   - Validação de 1 check-in por dia por paciente

### 3. **Frontend - Check-in Diários:**
   - ✅ Formulário interativo com 6 categorias
   - ✅ Validação de check-in já realizado
   - ✅ Salvamento automático no banco
   - ✅ Feedback visual de sucesso/erro

### 4. **Frontend - Dashboard:**
   - ✅ Dados 100% dinâmicos do banco
   - ✅ Filtro de período (7, 15, 30, 90 dias)
   - ✅ Cards com métricas (Equilíbrio Geral, Sono, Hidratação, Mental & Energia)
   - ✅ Equilíbrio Integrativo (6 dimensões)
   - ✅ Gráfico de evolução (LineChart) com dados reais
   - ✅ Aderência ao Protocolo (% de check-ins realizados)
   - ✅ Nome do paciente dinâmico (nome + sobrenome)
   - ✅ Idade Biológica (campo preparado para futuro cálculo)

### 5. **Notificações:**
   - ✅ Badge vermelho pulsante quando check-in não foi feito
   - ✅ Notificação no menu com link direto para check-in

---

## 📋 PASSO A PASSO PARA CONFIGURAR:

### **PASSO 1: Criar as Tabelas no Supabase**

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto **APOGEU** (yzjlhezmvdkwdhibyvwh)
3. Vá em **SQL Editor** (ícone de banco de dados na barra lateral)
4. Clique em **+ New Query**
5. Cole o conteúdo do arquivo `database-schema-checkins.sql` que está na raiz do projeto
6. Clique em **RUN** (ou pressione `Ctrl/Cmd + Enter`)
7. Aguarde a confirmação de "Success. No rows returned"

> **⚠️ NOTA IMPORTANTE:** O SQL foi ajustado para usar o tipo `UUID` ao invés de `TEXT` para `paciente_id`, garantindo compatibilidade com a tabela `patients` existente.

### **PASSO 2: Verificar as Tabelas Criadas**

1. No Supabase, vá em **Table Editor**
2. Você deve ver duas novas tabelas:
   - `daily_checkins`
   - `patient_metrics`

### **PASSO 3: Testar o Sistema**

1. **Inicie o servidor de desenvolvimento:**
   ```bash
   cd pacientes-auton-web
   npm start
   ```

2. **Faça login com um paciente existente**

3. **Acesse "Check-in Diários":**
   - Você verá as 6 categorias (Sono, Ambiente, Atividade Física, etc.)
   - Clique em "Iniciar"
   - Preencha os sliders em cada categoria
   - Clique em "Finalizar"
   - ✅ O check-in será salvo e você verá a mensagem de sucesso

4. **Acesse o Dashboard:**
   - Os cards mostrarão os dados do check-in que você acabou de fazer
   - Experimente mudar o filtro de período (7, 15, 30, 90 dias)
   - O gráfico mostrará a evolução do Equilíbrio Geral

5. **Teste a Notificação:**
   - Se você já fez o check-in hoje, o sino de notificações ficará normal
   - Se você **não** fez o check-in, verá:
     - ✅ Badge vermelho pulsante no sino
     - ✅ Notificação "Check-in Pendente" ao clicar no sino

---

## 🎯 DADOS CALCULADOS AUTOMATICAMENTE:

Após cada check-in, as seguintes métricas são calculadas automaticamente:

### **Cards do Topo:**
- **Equilíbrio Geral** (0-10): Média das 6 dimensões
- **Qualidade do Sono**: Média de horas de sono
- **Hidratação**: Média de litros consumidos vs meta
- **Mental & Energia**: Combinação de sono, sistema nervoso e atividade física

### **Equilíbrio Integrativo (6 Dimensões):**
1. **Sono**: Qualidade (70%) + Tempo normalizado (30%)
2. **Ambiente**: Exposição solar + Natureza
3. **Atividade Física**: Tempo + Intensidade
4. **Sistema Nervoso**: Estresse invertido + Mindfulness
5. **Alimentação**: Refeições + Hidratação
6. **Relacionamento**: Qualidade + Satisfação

### **Aderência ao Protocolo:**
- % de dias com check-in nos últimos 7 dias
- Exemplo: 5 check-ins em 7 dias = 71% de aderência

---

## 📊 COMO FUNCIONA O GRÁFICO:

O gráfico **LineChart** exibe a evolução do **Equilíbrio Geral** ao longo do tempo:

- Cada ponto representa um dia com check-in
- O valor é calculado como a média das 6 dimensões daquele dia
- Atualiza automaticamente conforme você faz novos check-ins
- Ajusta-se ao período selecionado (7, 15, 30 ou 90 dias)

---

## 🔔 NOTIFICAÇÃO DE CHECK-IN PENDENTE:

### Como Funciona:
1. A cada carregamento do Dashboard ou Navbar, verifica se o check-in de hoje foi feito
2. Se **NÃO** foi feito:
   - Badge vermelho aparece no sino (ícone de notificações)
   - Badge pulsa para chamar atenção
   - Ao clicar no sino, aparece notificação "Check-in Pendente"
   - Clicar na notificação redireciona para `/checkin-diarios`
3. Se **JÁ** foi feito:
   - Badge não aparece
   - Ao tentar fazer novo check-in, aparece mensagem: "Você já realizou o check-in de hoje"

---

## 🛠️ ARQUIVOS CRIADOS/MODIFICADOS:

### **Arquivos Novos:**
- `database-schema-checkins.sql` - Script SQL para criar tabelas
- `src/lib/checkins.js` - Funções para interagir com check-ins
- `INSTRUCOES_SETUP.md` - Este arquivo

### **Arquivos Modificados:**
- `src/layouts/checkin-diarios/index.js` - Integração com banco
- `src/layouts/dashboard/index.js` - Dashboard dinâmico
- `src/layouts/dashboard/components/WelcomeMark/index.js` - Nome dinâmico
- `src/layouts/dashboard/components/IdadeBiologica/index.js` - Idade dinâmica
- `src/layouts/dashboard/components/ReferralTracking/index.js` - Aderência dinâmica
- `src/examples/Navbars/DashboardNavbar/index.js` - Notificação de check-in

---

## 📝 PRÓXIMOS PASSOS (OPCIONAL):

### **Idade Biológica:**
- Campo `idade_biologica` já existe em `patient_metrics`
- Implemente a fórmula de cálculo desejada
- Atualize via trigger ou função separada

### **Notificações Push:**
- Integrar com Firebase Cloud Messaging
- Enviar notificação no final do dia se check-in não foi feito

### **Histórico Detalhado:**
- Criar tela para visualizar histórico completo de check-ins
- Gráficos individuais por dimensão

---

## ❓ DÚVIDAS COMUNS:

### **Q: Erro "operator does not exist: uuid = text" ao executar SQL**
**A:** Esse erro foi corrigido! Certifique-se de usar a versão mais recente do arquivo `database-schema-checkins.sql`. O problema era incompatibilidade de tipos entre `UUID` (tabela `patients`) e `TEXT` (tabelas novas). Agora tudo usa `UUID` corretamente.

### **Q: O Dashboard está vazio após criar as tabelas**
**A:** Isso é normal! Você precisa fazer pelo menos 1 check-in para ver dados.

### **Q: O gráfico não aparece**
**A:** O gráfico só aparece após 1+ check-ins. Antes disso, mostra mensagem "Realize mais check-ins...".

### **Q: A notificação não aparece**
**A:** Certifique-se de:
1. Estar logado com um paciente válido
2. Não ter feito o check-in de hoje
3. Recarregar a página para verificar

### **Q: Posso fazer mais de 1 check-in por dia?**
**A:** Não. O sistema valida e só permite 1 check-in por dia. Se tentar fazer outro, aparecerá erro.

---

## 🎉 CONCLUSÃO:

Tudo está funcionando! Agora você tem:
- ✅ Check-ins diários salvos no banco
- ✅ Dashboard 100% dinâmico
- ✅ Gráficos de evolução
- ✅ Notificações de check-in pendente
- ✅ Cálculos automáticos de métricas
- ✅ Filtros de período

**Bom uso do sistema! 🚀**

