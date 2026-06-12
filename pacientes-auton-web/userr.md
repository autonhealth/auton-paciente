# 🔗 Guia de Integração - Sistema de Pacientes

Este guia explica como conectar o sistema externo de pacientes ao banco de dados do MedCall AI.

## 📊 Estrutura do Banco de Dados

### Tabela: `patients`

A tabela `patients` armazena todos os dados dos pacientes. A coluna **`user_auth`** é a chave de ligação com o Supabase Auth.

```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES medicos(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    user_auth UUID REFERENCES auth.users(id), -- ✅ COLUNA DE LIGAÇÃO
    -- ... outros campos
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Relacionamento

```
auth.users (id) 
    ↓
patients.user_auth (FK)
```

- **`auth.users.id`**: ID do usuário no Supabase Auth (UUID)
- **`patients.user_auth`**: Foreign Key que referencia `auth.users.id`

## 🔑 Variáveis de Ambiente Necessárias

No seu sistema externo, você precisa das seguintes variáveis:

```env
# URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave pública (anon key) - para operações do cliente
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Chave de serviço (service role) - para operações administrativas
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

**Onde encontrar:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ NUNCA exponha no frontend!)

## 💻 Código de Integração

### 1. Instalar Dependências

```bash
npm install @supabase/supabase-js
# ou
yarn add @supabase/supabase-js
```

### 2. Criar Cliente Supabase

#### Para Frontend (Cliente Autenticado)

```typescript
// lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### Para Backend/API Routes (Service Role)

```typescript
// lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ⚠️ Service Role bypassa RLS - use com cuidado!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

### 3. Autenticação do Paciente

Quando o paciente faz login, você recebe o `user.id` do Supabase Auth. Use esse ID para buscar os dados do paciente:

```typescript
// Exemplo: Login do paciente
import { supabase } from './lib/supabase-client';

async function loginPaciente(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Erro no login:', error);
    return null;
  }

  // data.user.id é o user_auth que está na tabela patients
  const userAuthId = data.user.id;
  
  // Buscar dados do paciente usando o user_auth
  const paciente = await buscarPacientePorUserAuth(userAuthId);
  
  return {
    user: data.user,
    paciente: paciente
  };
}
```

### 4. Buscar Dados do Paciente

#### Opção A: Buscar por `user_auth` (Recomendado)

```typescript
// Buscar paciente pelo user_auth (ID do Supabase Auth)
async function buscarPacientePorUserAuth(userAuthId: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_auth', userAuthId)
    .single();

  if (error) {
    console.error('Erro ao buscar paciente:', error);
    return null;
  }

  return data;
}
```

#### Opção B: Buscar por Email

```typescript
// Buscar paciente pelo email
async function buscarPacientePorEmail(email: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Erro ao buscar paciente:', error);
    return null;
  }

  return data;
}
```

### 5. Exemplo Completo: Sistema de Login

```typescript
// pages/login.tsx ou app/login/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Fazer login no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Email ou senha incorretos');
        setLoading(false);
        return;
      }

      // 2. Buscar dados do paciente usando user_auth
      const userAuthId = authData.user.id;
      
      const { data: paciente, error: pacienteError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_auth', userAuthId)
        .single();

      if (pacienteError || !paciente) {
        setError('Paciente não encontrado');
        setLoading(false);
        return;
      }

      // 3. Salvar dados na sessão/localStorage
      localStorage.setItem('paciente', JSON.stringify(paciente));
      
      // 4. Redirecionar para dashboard
      router.push('/dashboard');
      
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

### 6. Buscar Dados do Paciente Logado

```typescript
// hooks/usePaciente.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

export function usePaciente() {
  const [paciente, setPaciente] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarPaciente() {
      // 1. Verificar se há sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setLoading(false);
        return;
      }

      // 2. Buscar paciente pelo user_auth
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_auth', session.user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar paciente:', error);
        setLoading(false);
        return;
      }

      setPaciente(data);
      setLoading(false);
    }

    carregarPaciente();

    // 3. Escutar mudanças na sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data } = await supabase
            .from('patients')
            .select('*')
            .eq('user_auth', session.user.id)
            .single();
          
          setPaciente(data);
        } else {
          setPaciente(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { paciente, loading };
}
```

### 7. Atualizar Dados do Paciente

```typescript
async function atualizarPaciente(userAuthId: string, dados: Partial<Patient>) {
  const { data, error } = await supabase
    .from('patients')
    .update(dados)
    .eq('user_auth', userAuthId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar paciente:', error);
    return null;
  }

  return data;
}

// Exemplo de uso:
await atualizarPaciente(userAuthId, {
  phone: '(11) 99999-9999',
  address: 'Nova Rua, 123'
});
```

## 🔐 Segurança (Row Level Security - RLS)

O Supabase usa RLS para proteger os dados. Certifique-se de que as políticas permitem que pacientes vejam apenas seus próprios dados:

```sql
-- Política para pacientes verem apenas seus próprios dados
CREATE POLICY "Pacientes podem ver apenas seus próprios dados"
ON patients
FOR SELECT
USING (
  auth.uid() = user_auth
);

-- Política para pacientes atualizarem apenas seus próprios dados
CREATE POLICY "Pacientes podem atualizar apenas seus próprios dados"
ON patients
FOR UPDATE
USING (
  auth.uid() = user_auth
);
```

## 📝 Query SQL Direta (Se necessário)

Se você precisar fazer queries SQL diretas:

```sql
-- Buscar paciente pelo user_auth
SELECT * FROM patients 
WHERE user_auth = 'uuid-do-usuario-aqui';

-- Buscar paciente pelo email
SELECT * FROM patients 
WHERE email = 'paciente@email.com';

-- Buscar paciente com dados do médico
SELECT 
  p.*,
  m.name as doctor_name,
  m.email as doctor_email
FROM patients p
JOIN medicos m ON p.doctor_id = m.id
WHERE p.user_auth = 'uuid-do-usuario-aqui';
```

## 🎯 Resumo: Caminho para Executar

1. **Instalar Supabase JS:**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Configurar variáveis de ambiente:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
   SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
   ```

3. **Criar cliente Supabase:**
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   const supabase = createClient(url, anonKey);
   ```

4. **Autenticar paciente:**
   ```typescript
   const { data } = await supabase.auth.signInWithPassword({ email, password });
   const userAuthId = data.user.id;
   ```

5. **Buscar dados do paciente:**
   ```typescript
   const { data: paciente } = await supabase
     .from('patients')
     .select('*')
     .eq('user_auth', userAuthId)
     .single();
   ```

## 🔗 Links Úteis

- [Documentação Supabase JS](https://supabase.com/docs/reference/javascript/introduction)
- [Autenticação Supabase](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## ❓ Dúvidas?

- **Qual coluna usar?** → `patients.user_auth` (FK para `auth.users.id`)
- **Como autenticar?** → `supabase.auth.signInWithPassword()`
- **Como buscar dados?** → Query na tabela `patients` usando `user_auth`

