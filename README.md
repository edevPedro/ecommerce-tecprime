# Desafio Técnico TecPrime

Uma aplicação full-stack de e-commerce demonstrando práticas arquiteturais modernas, código limpo e integração robusta entre sistemas.

## 🏗 Arquitetura

Este projeto segue uma estrutura de **Monorepo**, contendo:

* **Backend:** NestJS (Node.js) com BullMQ (Redis)
* **Frontend:** React (Vite + TypeScript)
* **Banco de Dados:** PostgreSQL
* **Orquestração:** Docker Compose

### Principais Decisões & Padrões

#### Backend (NestJS)

* **Arquitetura em Camadas:** Separação rigorosa de responsabilidades (Controllers → Services → Repositories/Adapters).
* **Adapter Pattern:** Utilizado no `ProductsModule` para normalizar dados da API externa (DummyJSON) para o formato do nosso domínio interno.
* **Fila Assíncrona (Redis + BullMQ):** Pedidos são processados de forma assíncrona para simular alta concorrência. A API responde imediatamente com um ID do Job, enquanto um processador em segundo plano realiza a transação.
* **Consistência Transacional:** O `OrdersProcessor` utiliza Transações Interativas do Prisma para garantir que a criação do pedido e a baixa de estoque ocorram de forma atômica.
* **Validação com DTO:** Validação rigorosa de entrada utilizando `class-validator`, garantindo integridade dos dados antes de chegarem à lógica de negócio.
* **Autenticação JWT:** Autenticação segura e stateless para proteger endpoints sensíveis.
* **Documentação Swagger:** Endpoints totalmente documentados com `@nestjs/swagger`, disponíveis em `/api`.

#### Frontend (React)

* **Login Postergado (Deferred Login):** Usuários podem navegar e adicionar itens ao carrinho livremente. A autenticação só é exigida no momento do **Checkout**.
* **UI Moderna:** Estilizado com TailwindCSS, com design limpo e tecnológico inspirado na identidade da TecPrime.
* **Context API:** Utilizada para gerenciamento global de estado (`CartContext`, `AuthContext`).
* **Interceptors:** Interceptadores do Axios anexando automaticamente o token JWT às requisições autenticadas.
* **Processamento Assíncrono de Pedidos:** O frontend lida de forma elegante com a criação assíncrona de pedidos, exibindo um estado de "Processando" e realizando polling/espera até a confirmação final.

#### Banco de Dados (PostgreSQL)

* **Prisma ORM:** Fornece acesso tipado ao banco de dados e migrações automatizadas.
* **Estratégia de Dados Híbrida:**

  * **Produtos:** Obtidos de `dummyjson.com` (fonte de verdade somente leitura para detalhes e avaliações).
  * **Estoque:** Gerenciado localmente na tabela `ProductStock` (fonte de verdade gravável para inventário).
  * **Pedidos:** Totalmente gerenciados localmente com integridade relacional.

---

## 🚀 Começando

### Pré-requisitos

* Docker & Docker Compose

### Início Rápido (Docker)

A maneira mais simples de rodar toda a stack é utilizando Docker Compose.

1. **Clone o repositório:**

```bash
git clone <repo-url>
cd challenge-tecprime
```

2. **Inicie a aplicação:**

```bash
docker-compose up -d --build
```

3. **Acesse a aplicação:**

* **Frontend:** `http://localhost`
* **Backend API:** `http://localhost:3000`
* **Documentação Swagger:** `http://localhost:3000/api`

---

### 🛡 Acesso Admin & Logs

A aplicação inclui uma área restrita para visualização de logs do sistema e funções administrativas. O sistema rastreia eventos críticos, incluindo:

* Autenticação de Usuário (Login/Logout)

* Atividades do Carrinho (Adicionar/Remover itens)

* Processamento de Pedidos

* **URL:** `http://localhost/logs`

* **Chave Secreta:** `secret` (padrão)

> **Observação:** A chave secreta pode ser configurada pela variável de ambiente `LOGS_SECRET` no backend.

> **Observação:** Se ocorrerem problemas de conexão com o banco na primeira execução, tente resetar os volumes:

```bash
docker-compose down -v
docker-compose up -d --build
```

---

## ⚙ Configuração Manual (Desenvolvimento)

Se preferir rodar os serviços individualmente:

### 1. Inicie a infraestrutura (PostgreSQL & Redis):

```bash
docker-compose up -d postgres redis
```

### 2. Backend:

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run start:dev
```

### 3. Frontend:

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🧪 Testes

### Rodando testes com Docker (Recomendado)

Você pode executar testes do backend e frontend usando profiles do Docker, sem instalar dependências localmente.

```bash
# Testes do backend
docker-compose --profile test run backend-tests

# Testes do frontend
docker-compose --profile test run frontend-tests
```

### Testes Manuais

**Backend:**

```bash
cd backend
npm run test
```

**Frontend:**

```bash
cd frontend
npm run test
```

---

## 🔮 Melhorias que eu implementaria com mais tempo

* **Testes End-to-End (E2E):** Implementar Cypress ou Playwright para simular jornadas completas (Login → Carrinho → Checkout).
* **Melhoria nos Logs Docker:** Adicionar rotação de logs, filtros por serviço/nível e armazenamento persistente fora do container.
* **Pipeline CI/CD:** Configurar GitHub Actions para automatizar lint, testes e deploy.
* **Monitoramento Avançado:** Integrar solução real de monitoramento como Prometheus + Grafana em vez de um leitor de logs customizado.
* **Reserva de Estoque:** Implementar retenção temporária de estoque ao adicionar itens ao carrinho (com expiração) para evitar overselling.
* **Integração com Gateway de Pagamento:** Substituir lógica mock por um provedor real como Abacatepay ou Pagar.me.
* **Responsividade Mobile:** Aprimorar a interface para experiência perfeita em todos os tamanhos de tela.
* **Componentes:** Melhorar e organizar componentes e criar o system design do projeto. 

---

## 🛠 Stack Tecnológica

* **Frameworks:** NestJS, React
* **Linguagem:** TypeScript
* **Banco de Dados:** PostgreSQL
* **Fila:** Redis + BullMQ
* **ORM:** Prisma
* **Estilização:** TailwindCSS
* **Ferramentas:** Docker, Vite, Axios, Passport (JWT), Swagger

---

## 📝 Diferenciais Implementados

* [x] Autenticação (JWT)
* [x] Controle Transacional de Estoque
* [x] Processamento Assíncrono com Fila (Redis)
* [x] Docker / Docker Compose
* [x] Arquitetura em Camadas
* [x] Logs Estruturados & Painel Admin
* [x] Integração de Avaliações de Produtos
* [x] Documentação de API com Swagger
* [x] Migrações Automatizadas de Banco de Dados

---

*Desenvolvido com <3 para o Desafio Técnico TecPrime.*
