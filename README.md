# TecPrime Technical Challenge

A full-stack e-commerce application demonstrating modern architectural practices, clean code, and robust system integration.

## 🏗 Architecture

This project follows a **Monorepo** structure containing:

- **Backend:** NestJS (Node.js) with BullMQ (Redis)
- **Frontend:** React (Vite + TypeScript)
- **Database:** PostgreSQL
- **Orchestration:** Docker Compose

### Key Decisions & Patterns

#### Backend (NestJS)

- **Layered Architecture:** Strict separation of concerns (Controllers -> Services -> Repositories/Adapters).
- **Adapter Pattern:** Used in the `ProductsModule` to normalize data from the external API (DummyJSON) into our internal domain format.
- **Async Queue (Redis + BullMQ):** Orders are processed asynchronously to simulate high-concurrency handling. The API responds immediately with a Job ID, while a background processor handles the transaction.
- **Transactional Consistency:** The `OrdersProcessor` uses Prisma Interactive Transactions to ensure that order creation and stock decrements happen atomically.
- **DTO Validation:** Strict input validation using `class-validator` ensures data integrity before it reaches business logic.
- **JWT Authentication:** Secure stateless authentication for protecting sensitive endpoints.
- **Swagger Documentation:** Fully documented API endpoints using `@nestjs/swagger`, available at `/api`.

#### Frontend (React)

- **Deferred Login:** Users can browse and add items to the cart freely. Authentication is only required at the **Checkout** step.
- **Modern UI:** Styled with TailwindCSS, featuring a clean, tech-focused design inspired by TecPrime's branding.
- **Context API:** Used for global state management (`CartContext`, `AuthContext`).
- **Interceptors:** Axios interceptors automatically attach JWT tokens to authenticated requests.
- **Async Order Handling:** The frontend gracefully handles the async order creation process, displaying a "Processing" state and polling/waiting for the final order confirmation.

#### Database (PostgreSQL)

- **Prisma ORM:** Provides type-safe database access and automated migrations.
- **Hybrid Data Strategy:**
  - **Products:** Fetched from `dummyjson.com` (read-only source of truth for details & reviews).
  - **Stock:** Managed locally in `ProductStock` table (writeable source of truth for inventory).
  - **Orders:** Fully managed locally with relational integrity.

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose

### Quick Start (Docker)

The easiest way to run the entire stack is with Docker Compose.

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd challenge-tecprime
   ```

2. **Start the Application:**

   ```bash
   docker-compose up -d --build
   ```

3. **Access the App:**
   - **Frontend:** `http://localhost`
   - **Backend API:** `http://localhost:3000`
   - **Swagger Docs:** `http://localhost:3000/api`

### 🛡 Admin & Logs Access

The application includes a restricted area for viewing system logs and administrative functions. The system tracks critical events including:

- User Authentication (Login/Logout)
- Shopping Cart Activities (Add/Remove items)
- Order Processing

- **URL:** `http://localhost/logs`
- **Secret Key:** `secret` (Default)

> **Note:** The secret key can be configured via the `LOGS_SECRET` environment variable in the backend.

> **Note:** If you encounter database connection issues on the first run, try resetting the volumes:
>
> ```bash
> docker-compose down -v
> docker-compose up -d --build
> ```

### Manual Setup (Development)

If you prefer to run services individually:

1. **Start Infrastructure (PostgreSQL & Redis):**

   ```bash
   docker-compose up -d postgres redis
   ```

2. **Backend Setup:**

   ```bash
   cd backend
   cp .env.example .env # Copy environment variables
   npm install
   npx prisma migrate dev --name init # Run database migrations
   npm run start:dev
   ```

3. **Frontend Setup:**

   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 🧪 Testing

### Running Tests with Docker (Recommended)

You can run both backend and frontend tests using Docker profiles without installing dependencies locally.

```bash
# Run backend tests
docker-compose --profile test run backend-tests

# Run frontend tests
docker-compose --profile test run frontend-tests
```

### Manual Testing

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

## 🔮 Melhorias que faria se tivesse mais tempo

- **End-to-End Testing (E2E):** Implement Cypress or Playwright tests to simulate full user journeys (Login -> Cart -> Checkout).
- **Enhance Docker Logs:** Add log rotation, filtering by service/level, and persistent storage outside the container.
- **CI/CD Pipeline:** Set up GitHub Actions to automate linting, testing, and deployment.
- **Advanced Monitoring:** Integrate a real monitoring solution like Prometheus + Grafana instead of a custom log reader.
- **Stock Reservations:** Implement temporary stock holding when items are added to the cart (with expiry) to prevent overselling during checkout.
- **Payment Gateway Integration:** Replace the mock payment logic with a real provider like Stripe or Pagar.me.
- **Mobile Responsiveness:** Further polish the UI for a perfect experience on all device sizes.


## 🛠 Tech Stack

- **Frameworks:** NestJS, React
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Queue:** Redis + BullMQ
- **ORM:** Prisma
- **Styling:** TailwindCSS
- **Tools:** Docker, Vite, Axios, Passport (JWT), Swagger

## 📝 Differentials Implemented

- [x] **Authentication (JWT)**
- [x] **Transactional Stock Control**
- [x] **Async Queue Processing (Redis)**
- [x] **Docker / Docker Compose**
- [x] **Layered Architecture**
- [x] **Structured Logs & Admin Panel**
- [x] **Product Reviews Integration**
- [x] **Swagger API Documentation**
- [x] **Automated Database Migrations**

---

_Developed with <3 for the TecPrime Technical Challenge._
