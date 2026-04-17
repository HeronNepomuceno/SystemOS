# 🚀 Sistema de Gestão de Ordens de Serviço (OS)

Projeto desenvolvido como parte do desafio técnico para a vaga de **Desenvolvedor Full Stack 2**.

---

## 📌 Sobre o projeto

Este sistema tem como objetivo gerenciar o ciclo completo de **Ordens de Serviço (OS)** em uma empresa de manutenção, permitindo:

* Abertura e gestão de ordens
* Atribuição de técnicos
* Acompanhamento de status
* Visualização de métricas (dashboard)
* Atualizações em tempo real

A aplicação foi desenvolvida com foco em **entrega funcional, clareza e simplicidade**, priorizando decisões práticas considerando o tempo limitado do desafio.

---

## 🌐 Acesso ao projeto

🔗 **Frontend (Netlify):**
https://systemos-desafio.netlify.app/ordens-de-servico

🔗 **Backend (Render):**
https://systemos-a6id.onrender.com

> ⚠️ Observação: o backend está hospedado em um plano gratuito do Render, podendo levar alguns segundos para responder na primeira requisição após inatividade.

---

## 🏗️ Arquitetura

O projeto foi estruturado como um **monorepo**, dividido em:

```
/backend → API REST (Node.js + Express + TypeScript)
/frontend → Aplicação web (React + Vite + TypeScript)
```

### 🎯 Decisão de Arquitetura

Optei por uma arquitetura **simples e direta**, sem adoção de padrões mais complexos como Clean Architecture.

**Motivação:**

* Tempo limitado do desafio
* Foco em entrega funcional completa
* Redução de complexidade desnecessária

Essa decisão foi intencional para priorizar:

* legibilidade
* produtividade
* velocidade de desenvolvimento

Em um cenário real de produção, a arquitetura poderia evoluir para uma estrutura mais desacoplada conforme a complexidade do sistema aumentasse.

---

## ⚙️ Tecnologias utilizadas

### Backend

* Node.js
* Express
* TypeScript
* Supabase (PostgreSQL)
* dotenv

### Frontend

* React
* Vite
* TypeScript
* Material UI (MUI)
* Recharts
* Supabase Realtime

### 🎯 Motivação das escolhas

As tecnologias foram escolhidas com base em:

* **Aderência à stack utilizada pela empresa**
* Contexto discutido durante a entrevista técnica
* Familiaridade com ferramentas modernas e produtivas
* Facilidade de integração com recursos como realtime

---

## 🔄 Realtime

Um dos diferenciais do projeto é a implementação de **atualizações em tempo real** utilizando o Supabase Realtime.

Sempre que ocorre:

* criação de OS
* atualização de status
* exclusão

A interface é automaticamente atualizada sem necessidade de refresh.

Isso foi aplicado especialmente na:

* tela principal de ordens de serviço
* página pública de acompanhamento

---

## 🔐 Segurança (CORS)

Foi implementado controle de CORS no backend, permitindo requisições apenas de origens específicas:

* ambiente local (desenvolvimento)
* frontend em produção (Netlify)

```ts
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://systemos-desafio.netlify.app'
    ]

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))
```

> Em um ambiente de produção real, esse controle seria ainda mais restritivo, incluindo autenticação e controle de acesso.

---

## 🧪 Testes

Foram implementados testes unitários utilizando:

* Jest
* Supertest

Foco principal:

* validações críticas de negócio
* regras de atualização de OS
* consistência dos endpoints

---

## ▶️ Como rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd projeto
```

---

### 2. Configurar variáveis de ambiente

#### Backend (`/backend/.env`)

```env
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
PORT=3333
```

---

### 3. Rodar o backend

```bash
cd backend
npm install
npm run build
npm start
```

Servidor disponível em:

```
http://localhost:3333
```

---

### 4. Rodar o frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação estará disponível em:

```
http://localhost:5173
```

---

## 📊 Funcionalidades implementadas

### ✔ Ordens de Serviço

* Criar OS
* Listar com filtros
* Editar
* Agendar atendimento
* Iniciar atendimento
* Finalizar com laudo
* Cancelar

### ✔ Técnicos

* Cadastro
* Listagem

### ✔ Dashboard

* OS por status
* OS finalizadas por técnico
* Média de tempo
* OS por período

### ✔ Página pública

* Visualização das OS
* Atualização em tempo real
* Sem necessidade de autenticação

---

## ⚠️ Limitações e decisões conscientes

Este projeto foi desenvolvido com foco em demonstrar capacidade técnica dentro de um prazo limitado.

Por isso, algumas decisões foram tomadas de forma consciente:

* ❌ Ausência de autenticação/autorização
* ❌ Sem controle de permissões por perfil
* ❌ Sem upload de arquivos
* ❌ UI com foco funcional (não polida)

---

## 🧠 Auto-crítica

Durante o desenvolvimento, alguns pontos poderiam ser melhorados:

* 🔤 **Padronização de nomenclatura:**
  Há mistura entre português e inglês em nomes de arquivos, rotas e variáveis.

* 🧱 **Arquitetura:**
  Poderia evoluir para uma separação mais clara de camadas (ex: services, repositories).

* 🔐 **Segurança:**
  Falta de autenticação e controle de acesso.

* 🧪 **Cobertura de testes:**
  Testes poderiam ser mais abrangentes, incluindo cenários de integração e E2E.

Esses pontos são conhecidos e seriam tratados em uma evolução natural do projeto.

---

## 🚀 Possíveis melhorias futuras

* Implementar autenticação (JWT)
* Controle de permissões por perfil
* Melhorar UX/UI
* Expandir cobertura de testes
* Adicionar logs estruturados
* Implementar CI/CD completo
* Dockerização

---

## 📌 Considerações finais

Este projeto foi construído buscando equilibrar:

* qualidade técnica
* clareza de implementação
* entrega completa das funcionalidades

com decisões pragmáticas diante do tempo disponível.

---

Feito com foco em evolução contínua 🚀
