# GEMINI Project Context: help-desk-back

This project is a **Multi-tenant Help Desk Backend** built with **NestJS**, following **Domain-Driven Design (DDD)** and **Clean Architecture** principles. It serves as a SaaS platform where multiple companies (Tenants) can manage support tickets.

## 🏗️ Architectural Overview
- **`src/core`**: Base abstractions and shared utilities (`Entity`, `UniqueEntityID`, `ValueObject`, `Either` monad).
- **`src/domain`**: The heart of the application. Strictly isolated from external libraries, ORMs, or NestJS decorators.
- **`src/infra`**: Implementation details, NestJS Controllers/Modules, Cryptography, and Prisma Repositories.
- **`test`**: Support utilities for unit testing (`factories` with `@faker-js/faker`, in-memory repositories, and Fakes like `FakeHasher`).

## 🛠️ Main Technologies
- **Framework:** NestJS
- **Language:** TypeScript (Strict Mode)
- **Database/ORM:** PostgreSQL + **Prisma ORM (v7)**
- **Testing:** Vitest (Unit and E2E)
- **Error Handling:** Functional style using the `Either` monad. Avoid throwing raw exceptions in the domain layer.

## 📐 Strict Development Conventions & Business Rules

### 1. Multi-tenancy (Row-Level Isolation)
- **Tenant Isolation:** All entities belonging to a tenant (Admins, Technicians, Employees, Tickets) **MUST** include `tenantId`.
- **IDOR Prevention:** Any repository method performing reads or updates on tenant data MUST require `tenantId` as an argument (e.g., `findById(id, tenantId)`).
- **Global vs. Tenant Auth:** - `SUPER_ADMIN` belongs to the Host platform (no `tenantId`).
  - Tenant users authenticate using a compound identification (requires `tenantSlug` to resolve to `tenantId` + `email`).
- **Unique Constraints:** Emails are globally unique for creating a new Tenant, but compound unique inside the database (`@@unique([email, tenantId])`) for tenant users.

### 2. Domain-Driven Design (DDD) & Clean Architecture
- **Dependency Rule:** `enterprise` and `application` layers MUST NOT import NestJS (`@nestjs/*`), Prisma (`@prisma/client`), or any infrastructure-specific code (except on use-cases, these need a @Injectable() decorator to work with Nest.js).
- **Transactions:** Complex cross-aggregate operations (like SaaS Onboarding) must use the **Gateway/Unit of Work pattern** (e.g., `ITenantAndAdminRegisterGateway`) in the domain, implemented via Prisma's Interactive Transactions (`$transaction`) in the infra layer.

## 🤖 AI Assistant Instructions (System Prompt)
When generating code or answering questions for this project, the AI MUST adhere to these rules:
- **Tone:** Direct, objective, and high technical precision. Do not use filler words, greetings, or compliment the user's code.
- **Citations:** Prioritize official documentation (e.g., Prisma v7 docs, NestJS docs) and renowned technical literature (Evans, Fowler, Martin) when explaining theoretical concepts.
- **Code Generation:** Provide clean, production-ready TypeScript code. Explicitly mention if external context is missing.
- **Updates & Best Practices:** Always use the most up-to-date syntax for the stack (e.g., Prisma v7 ESM/Transaction patterns).

## 📅 Roadmap Status
- **Phase 1 (Active):** Identity, Access Management, SaaS Onboarding, and Multi-tenancy.
- **Phase 2-6 (Planned):** Ticket Core Domain, Messaging/Threads, File Storage, Domain Events, and Notifications.