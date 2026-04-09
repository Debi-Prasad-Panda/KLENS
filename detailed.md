# K-LENS Detailed Technical Documentation

## Table of Contents

1. [Project Overview & Tech Stack](#1-project-overview--tech-stack)
2. [Folder Structure](#2-folder-structure)
3. [Architecture](#3-architecture)
4. [Database Design](#4-database-design)
5. [Workflow & Pipeline](#5-workflow--pipeline)
6. [All Features](#6-all-features)
7. [DevOps, Security & Miscellaneous](#7-devops-security--miscellaneous)
8. [Glossary & Changelog](#8-glossary--changelog)

---

## 1. Project Overview & Tech Stack

### 1.1 Project Title and One-Line Description

Project Name: K-LENS (Knowledge Lens)

One-Line Tagline: An industrial intelligence platform that combines document AI, operational dashboards, knowledge graph insights, and role-aware workflows for high-safety environments.

### 1.2 Problem Statement

Industrial organizations generate large volumes of critical operational data across SOPs, shift handovers, compliance records, incident logs, and machine-related documents. This information is often fragmented across tools, hard to query in real time, and difficult to operationalize for frontline teams. Traditional dashboards can show static KPIs, but they usually fail to connect context across people, processes, assets, and risk signals.

K-LENS addresses this gap by unifying document intelligence, role-based access, live operational context, AI-assisted search/chat, and graph-based relationship mapping. The system is designed to support real-world factory constraints such as shift-driven operations, compliance audits, multilingual users, and strict access controls.

### 1.3 Goals and Objectives

1. Centralize industrial knowledge from documents, events, and operational metadata into a single workspace.
2. Provide role-aware access so that users only see data and actions relevant to their responsibilities.
3. Reduce time-to-information via semantic search, AI chat, and contextual recommendations.
4. Support safe operations with clear auditability, approvals, and compliance-friendly workflows.
5. Enable real-time collaboration using notifications and WebSocket-driven processing updates.
6. Improve decision quality by representing relationships between entities in a knowledge graph.
7. Support document lifecycle management, including upload, OCR extraction, analysis, and versioning.
8. Offer a deployment model suitable for development and production through containerized infrastructure.
9. Keep architecture extensible for future integrations with ERP, SCADA, and OT systems.
10. Provide a modern user interface that is usable on desktop control centers and mobile devices.

### 1.4 Complete Technology Stack and Rationale

#### Frontend Technologies

| Technology | Role in K-LENS | Why it was chosen |
|---|---|---|
| React 18 | UI rendering and component composition | React provides a mature ecosystem and component model suitable for building a large dashboard-style SPA with many reusable views. |
| TypeScript | Type safety in UI and API integration | TypeScript reduces runtime bugs by enforcing interface contracts across components, hooks, and backend payloads. |
| Vite | Frontend build tool and dev server | Vite gives fast startup and HMR performance, which helps when iterating on a large component library. |
| React Router DOM | Client-side routing | Route-based composition keeps authentication, page transitions, and protected views organized. |
| Tailwind CSS | Utility-first styling | Tailwind makes it easier to keep visual consistency across many dashboard widgets while maintaining speed of development. |
| Radix UI + shadcn/ui patterns | Accessible low-level UI primitives | This combination provides high-quality building blocks (dialogs, menus, forms, tabs) with accessibility and customization benefits. |
| Recharts | Analytics and KPI visualizations | Recharts integrates naturally with React and is efficient for business/industrial dashboard chart needs. |
| Three.js + react-force-graph-3d | 3D graph rendering | Required for knowledge graph exploration where relationship topology benefits from 3D interaction. |
| Sonner / toast utilities | User feedback notifications | Lightweight UX feedback for asynchronous actions such as uploads and processing completion. |
| React Query (TanStack Query pattern) | Server-state orchestration | Helps coordinate request caching, loading states, and retry behavior in a data-heavy dashboard. |

#### Backend Technologies

| Technology | Role in K-LENS | Why it was chosen |
|---|---|---|
| FastAPI | HTTP API layer and OpenAPI docs | FastAPI offers high performance, clear request modeling, and built-in documentation that accelerates integration. |
| Python 3.11 | Primary backend language | Python enables fast development for API orchestration plus excellent ecosystem support for AI, data processing, and integration tasks. |
| Pydantic | Request/response validation | Strong schema validation helps enforce contract reliability, especially for chat/search payloads and security-sensitive input. |
| SQLAlchemy | ORM and persistence abstraction | SQLAlchemy provides robust modeling, migration friendliness, and flexible query composition for relational data. |
| Uvicorn | ASGI server runtime | Uvicorn is a reliable production-ready runtime for FastAPI with async support. |
| Redis (rate limit + pub/sub) | Ephemeral state and messaging | Redis supports both request throttling and real-time status fan-out with low operational complexity. |

#### Database and Storage Technologies

| Technology | Role in K-LENS | Why it was chosen |
|---|---|---|
| PostgreSQL 16 | System-of-record relational database | PostgreSQL provides strong transactional guarantees and mature indexing for core business data. |
| pgvector | Embedding storage and similarity search | Enables vector similarity queries directly inside PostgreSQL, avoiding premature architecture complexity. |
| Neo4j 5 | Knowledge graph database | Neo4j is optimized for relationship-centric exploration and graph traversals needed in incident/risk intelligence. |
| Supabase Storage | Document/file storage | Centralized object storage with convenient auth integration for uploaded document workflows. |
| Supabase Postgres ecosystem | Managed auth/data integration path | Supports quick integration of JWT-based identity and profile tables with manageable operational overhead. |

#### DevOps, Infrastructure, and Runtime

| Technology | Role in K-LENS | Why it was chosen |
|---|---|---|
| Docker | Service containerization | Ensures reproducible runtime environments for frontend, backend, and supporting infrastructure. |
| Docker Compose | Multi-service local orchestration | Simplifies developer onboarding by standing up Postgres, Redis, Neo4j, API, and frontend together. |
| Nginx | Reverse proxy and static serving | Used for traffic routing, static asset delivery, and API/frontend boundary control. |
| Mosquitto MQTT | IoT messaging channel | Provides protocol-level support for telemetry/event scenarios common in industrial environments. |
| Shell and batch scripts | Operational shortcuts | Cross-platform startup/shutdown/check-health scripts reduce manual setup friction. |

#### Authentication and Security Stack

| Technology | Role in K-LENS | Why it was chosen |
|---|---|---|
| Supabase Auth | Identity and JWT issuance | Speeds up secure user authentication implementation with proven auth primitives. |
| JWT Bearer tokens | API authorization transport | Standard mechanism for stateless authorization across frontend and backend services. |
| RBAC model (custom) | Fine-grained permissions | Industrial workflows need controlled access by role, department, and function. |
| Row-Level Security (SQL scripts) | Data-level access boundaries | Adds defense-in-depth by limiting which rows users can access, beyond endpoint checks. |
| Input validation utilities | Request hardening | Prevents malformed input propagation and reduces risk from common injection/XSS vectors. |
| Rate limiting middleware | Abuse mitigation | Helps protect API resources from request bursts and accidental overload. |

#### Testing and Quality Tooling

| Technology | Role in K-LENS | Why it was chosen |
|---|---|---|
| ESLint | Frontend code quality checks | Enforces coding standards and catches risky patterns early in TypeScript/React code. |
| TypeScript compiler checks | Static validation | Provides compile-time confidence on props, models, and API contracts. |
| FastAPI interactive docs (/docs) | API behavior verification | Speeds endpoint validation and contract inspection during development and QA. |
| Health-check scripts | Runtime sanity verification | Enables quick confirmation that core services are available before test cycles. |

#### Third-Party APIs and SDKs

| Technology | Role in K-LENS | Why it was chosen |
|---|---|---|
| Google Gemini API | AI analysis and embeddings | Used for document summarization, insights extraction, and vector generation in the processing pipeline. |
| OpenRouter | Multi-model chat access | Provides flexible chat model routing with fallback options for availability and cost control. |
| Supabase SDKs | Auth and data integration | Standardized SDK pathways simplify session handling and backend token validation. |
| Browser Web Speech API | Voice-to-text interaction | Supports hands-busy contexts for industrial users through voice-driven inputs. |

### 1.5 Strategic Outcome of the Stack

K-LENS uses a practical hybrid architecture: relational consistency in PostgreSQL, relationship intelligence in Neo4j, and AI augmentation through Gemini/OpenRouter. The frontend stack emphasizes maintainability and role-driven UX, while backend services remain modular enough to evolve from prototype to production. This combination balances speed of iteration with the reliability needs of safety-sensitive industrial workflows.

## 2. Folder Structure

### 2.1 Root-Level Folder Tree (ASCII)

```text
KLENS/
|-- .dockerignore
|-- .env
|-- .env.example
|-- .env.local.example
|-- .gitignore
|-- bun.lockb
|-- package-lock.json
|-- package.json
|-- components.json
|-- eslint.config.js
|-- postcss.config.js
|-- tailwind.config.ts
|-- tsconfig.json
|-- tsconfig.app.json
|-- tsconfig.node.json
|-- vite.config.ts
|-- index.html
|-- README.md
|-- SECURITY-API-KEYS.md
|-- report.md
|-- detailed.map (phase-by-phase writing plan for detailed.md)
|-- detailed.md
|-- Dockerfile
|-- Dockerfile.dev
|-- docker-compose.yml
|-- docker-compose.override.yml
|-- docker-entrypoint.sh
|-- nginx.conf
|-- mosquitto.conf
|-- check-health.sh
|-- check-health.bat
|-- start.sh
|-- start.bat
|-- start-dev.sh
|-- start-dev.bat
|-- stop.sh
|-- stop.bat
|-- restart.bat
|-- public/
|   |-- robots.txt
|   |-- placeholder.svg
|-- src/
|   |-- App.tsx
|   |-- App.css
|   |-- index.css
|   |-- main.tsx
|   |-- vite-env.d.ts
|   |-- components/
|   |-- contexts/
|   |-- data/
|   |-- hooks/
|   |-- lib/
|   |-- pages/
|   |-- styles/
|   |-- types/
|-- backend-python/
|   |-- Dockerfile
|   |-- requirements.txt
|   |-- *.sql (schema, migration, bootstrap)
|   |-- app/
|   |   |-- main.py
|   |   |-- api/
|   |   |-- core/
|   |   |-- dependencies/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- services/
|   |   |-- utils/
|   |-- uploads/
|-- dist/ (generated build output)
|-- node_modules/ (dependency cache)
```

### 2.2 Frontend Folder Breakdown (src)

#### src root files

1. App.tsx: top-level application shell, router composition, provider hierarchy.
2. main.tsx: React bootstrap entry point.
3. App.css and index.css: global styling and utility-level CSS.
4. vite-env.d.ts: Vite TypeScript ambient types.

#### src/pages

1. Index.tsx: main operational dashboard entry and view switching.
2. Login.tsx: authentication page.
3. Settings.tsx: profile and application preferences.
4. Users.tsx: user and role management page.
5. Notifications.tsx: notification center and acknowledgment workflows.
6. NotFound.tsx: catch-all unknown route page.

#### src/components

1. components/klens: domain-specific screens and high-level feature modules.
2. components/Analytics: specialized analytics widgets and section layouts.
3. components/layout: global page layout structures.
4. components/Notifications: notification indicators and related UI widgets.
5. components/ui: reusable primitive components, mostly Radix/shadcn-style building blocks.
6. NavLink.tsx: routing-aware navigation helper.

#### src/contexts

1. AuthContext.tsx: session, identity, industrial context, and auth actions.
2. LanguageContext.tsx: i18n state and language selection.
3. ThemeContext.tsx: dark/light mode state and persistence.

#### src/hooks

1. useAudit.ts: audit stream/state retrieval.
2. useAutoLock.ts: kiosk auto-lock timeout handling.
3. useDashboardStats.ts: dashboard metric fetching and shaping.
4. useDocumentInsights.ts: document AI insights fetching logic.
5. usePermissions.ts: role/permission checks for conditional UI rendering.
6. useVoiceToText.ts: speech recognition abstraction.
7. use-mobile.tsx: responsive viewport detection.
8. use-toast.ts: toast message helper wrappers.

#### src/lib

1. api.ts: typed API client and endpoint wrappers.
2. supabase.ts: Supabase client setup and auth token retrieval.
3. permissions.ts: permission constants and helper utilities.
4. websocket.ts: WebSocket connection helpers for live process status.
5. utils.ts: general utility functions.

#### src/styles, src/types, src/data

1. styles: module-level CSS for advanced visuals (digital badge, voice modes).
2. types: shared type declarations used across pages/components/hooks.
3. data: static demo datasets (for graph fallback and development demonstrations).

### 2.3 Backend/API Folder Breakdown (backend-python)

#### backend-python root

1. requirements.txt: Python dependency manifest.
2. Dockerfile: backend container image definition.
3. sql files: schema creation, migrations, fixes, bootstrap data scripts.
4. uploads/: transient storage for files during processing.

#### backend-python/app/main.py

1. Initializes FastAPI app.
2. Registers middleware and routers.
3. Defines startup logic for initialization routines.

#### backend-python/app/api

1. auth.py and supabase_auth.py: authentication-related endpoints.
2. documents.py and upload.py: document lifecycle and ingestion.
3. search.py: semantic and keyword search operations.
4. chat.py: conversational assistant API endpoint.
5. graph.py: knowledge graph data retrieval and risk-related graph endpoints.
6. websocket.py: live status socket endpoints.
7. audit.py: audit log retrieval.
8. approvals.py: approval workflows.
9. handover.py: succession and handover logic.
10. notifications.py: notification query and update endpoints.
11. roles.py and user_management.py: role/user administration surfaces.
12. profile.py and pomodoro.py: user context and compatibility/utility endpoints.

#### backend-python/app/core

1. config.py: environment configuration and global settings.
2. database.py: SQLAlchemy engine/session and DB initialization.
3. permissions.py: role and permission definitions.
4. security.py: auth/security helper logic.
5. seed.py: data seeding helpers.

#### backend-python/app/models

1. user.py, user_profile.py: identity and extended operational profile.
2. document.py, document_version.py: document metadata, status, and version history.
3. approval.py: approval entities and status transitions.
4. audit_log.py: immutable activity/audit history records.
5. access_rules.py: fine-grained access model data.

#### backend-python/app/services

1. gemini_service.py: AI analysis and embedding workflows.
2. neo4j_service.py: graph node/edge extraction and persistence logic.
3. supabase_service.py: Supabase-level operations and wrappers.
4. handover_service.py: business logic for succession planning.
5. alert_service.py: alerting behavior and downstream notification integration.

#### backend-python/app/dependencies, middleware, utils

1. dependencies/auth.py: current user resolution and auth dependency injection.
2. middleware/rate_limit.py: request throttling controls.
3. utils/validation.py: sanitization and input validation helpers.

### 2.4 Database and Migration Folder Breakdown

1. auth_tables.sql: authentication and profile-related schema.
2. rbac_schema.sql: role hierarchy and permission-mapping structures.
3. audit_logs_schema.sql: audit model schema and indexes.
4. notifications_schema.sql: notifications and escalation-ready tables.
5. handover_tables.sql: handover/succession data structures.
6. rls_access_control.sql: row-level security policy setup.
7. supabase_functions.sql: SQL functions and trigger utilities.
8. migrate-to-768-dim.sql: vector dimension migration.
9. fix_uploaded_by.sql and fix_document_user_type.sql: compatibility correction scripts.
10. demo_users.sql and admin_setup.sql: seed/bootstrap script data.

### 2.5 Config and DevOps Folder/File Breakdown

1. docker-compose.yml: complete local stack orchestration.
2. docker-compose.override.yml: environment-specific overrides.
3. Dockerfile and Dockerfile.dev: frontend runtime and development builds.
4. nginx.conf: proxy rules, static serving, path routing.
5. mosquitto.conf: MQTT broker setup.
6. start/stop/restart scripts: operational convenience commands.
7. check-health scripts: service-level readiness checks.
8. .env.example files: safe configuration templates.

### 2.6 Naming Conventions Used

1. Frontend component files use PascalCase to reflect React component naming.
2. Frontend utility and hook files use camelCase and kebab/snake hybrids where historically adopted.
3. Backend Python modules use snake_case according to Python idioms.
4. SQL scripts use descriptive snake_case with purpose-driven suffixes (schema, fix, migrate, seed).
5. Script files are verb-led for clear intent: start, stop, restart, check-health.

### 2.7 Convention Rationale

1. Language-idiomatic naming improves readability for contributors specialized in each stack.
2. Verb-oriented script names reduce onboarding confusion for operational tasks.
3. Separation by concern (api, models, services, core) enables predictable navigation for large teams.
4. Clear distinction between source, generated output, and dependencies prevents accidental edits to build artifacts.

## 3. Architecture

### 3.1 High-Level Architecture Diagram (ASCII)

```text
				    +-----------------------+
				    |     End Users         |
				    | (Admin, Manager,      |
				    |  Engineer, Operator)  |
				    +-----------+-----------+
						|
						v
				    +-----------------------+
				    |   React Frontend      |
				    |  (Vite SPA, TS, UI)   |
				    +-----------+-----------+
						|
			       HTTPS / WS       |
						v
				    +-----------------------+
				    |  Nginx Reverse Proxy  |
				    +-----------+-----------+
						|
						v
				    +-----------------------+
				    |   FastAPI Backend     |
				    | (Routers + Services)  |
				    +---+---+---+---+---+--+
					|   |   |   |   |
		+-----------------------+   |   |   |   +----------------------+
		|                           |   |   |                          |
		v                           v   v   v                          v
	+---------------+         +---------------+  +---------------+   +-------------+
	| PostgreSQL    |         | Redis         |  | Neo4j         |   | Supabase    |
	| + pgvector    |         | rate limit    |  | graph store   |   | Auth+Storage|
	+-------+-------+         | pub/sub       |  +-------+-------+   +------+------+ 
		|                 +---------------+          |                  |
		|                                              \\                |
		v                                               v                v
	+---------------+                              +---------------+   +-------------+
	| SQLAlchemy ORM|                              | Graph Service |   | Token/File  |
	+---------------+                              +---------------+   | Operations  |
									    +-------------+

			 +-----------------------------------------------+
			 | AI Services: Gemini + OpenRouter             |
			 | (summaries, chat, embeddings, enrichment)    |
			 +-----------------------------------------------+
```

### 3.2 Frontend Architecture

#### 3.2.1 Component Hierarchy

1. Root boot in main.tsx mounts App.tsx.
2. App.tsx defines provider stack and route tree.
3. Auth-aware pages are routed with protection logic.
4. Index.tsx acts as a multi-view container for major product surfaces.
5. Section components in src/components/klens deliver domain functionality.
6. Shared components in src/components/ui keep interaction patterns consistent.

#### 3.2.2 State Management Pattern

1. Global cross-cutting state uses React Context.
2. AuthContext stores user/session/role-centric data.
3. ThemeContext and LanguageContext provide app-level UX preferences.
4. Server state is accessed via API wrappers and hooks; cache patterns are used where useful.
5. Local UI state remains colocated in components for clarity and maintainability.

#### 3.2.3 Routing Strategy

1. BrowserRouter handles client-side navigation.
2. Pages under src/pages map to top-level app routes.
3. Login route remains public.
4. Operational routes require authenticated context.
5. Unknown routes fall through to NotFound.

#### 3.2.4 Real-Time Update Integration

1. Document processing status uses WebSocket subscriptions.
2. Client subscribes per document ID to status streams.
3. UI updates are staged by progress milestones.
4. Toast feedback and status widgets provide immediate user feedback.

### 3.3 Backend Architecture

#### 3.3.1 Pattern Selection

K-LENS backend follows a layered modular monolith pattern.

1. API layer: request parsing and route-level concerns.
2. Dependency layer: auth/session resolution and shared DI logic.
3. Service layer: business workflows and third-party orchestration.
4. Data layer: SQLAlchemy models and database session boundaries.
5. Core layer: configuration, security primitives, and permissions catalog.

This pattern was chosen because it keeps deployment simple while still separating concerns strongly enough for later service extraction if required.

#### 3.3.2 Request Processing Layers

1. HTTP request enters FastAPI router.
2. Middleware applies CORS/rate-limiting and request metadata handling.
3. Dependencies resolve current user and roles.
4. Endpoint validates payload via Pydantic models.
5. Service performs business logic and external API orchestration.
6. ORM/query layer reads and writes persistent state.
7. Response is normalized and returned with proper status codes.

### 3.4 API Design and Endpoint Catalog

Base URL pattern: /api/* (plus compatibility namespaces where present).

#### 3.4.1 Authentication and User Context

1. POST /api/auth/register
Description: Register user identity and baseline profile.
Request Body: email, password, display attributes.
Response: user payload + auth/session details.

2. POST /api/auth/login
Description: Authenticate user and return access token context.
Request Body: email, password.
Response: token/session + user profile metadata.

3. GET /api/auth/me
Description: Resolve current authenticated user and context.
Request Body: none.
Response: user identity, role, and contextual flags.

4. GET /api/auth/shift-status
Description: Retrieve industrial shift context.
Response: shift state and timing metadata.

5. POST /api/auth/pin
Description: Validate or configure kiosk/security PIN behaviors.
Response: operation status.

#### 3.4.2 Documents and Upload

1. GET /api/documents
Description: list documents with filtering and pagination.
Response: collection of document metadata.

2. POST /api/documents
Description: create a document record and begin processing workflows.
Request: file or payload metadata depending on flow.
Response: document identifier and initial status.

3. GET /api/documents/{id}
Description: fetch single document detail and processing outputs.
Response: full document model.

4. PUT /api/documents/{id}
Description: modify mutable document fields and flags.
Response: updated record.

5. DELETE /api/documents/{id}
Description: remove document and optionally related resources.
Response: deletion confirmation.

6. POST /api/upload
Description: direct upload endpoint for file ingestion.
Request: multipart/form-data file payload.
Response: ingestion status and new document ID.

#### 3.4.3 Search, Chat, and Graph

1. POST /api/search
Description: hybrid semantic and keyword search.
Request: query, filters, pagination/limit.
Response: ranked result set with match metadata.

2. POST /api/chat/
Description: AI assistant query endpoint.
Request: current prompt + normalized conversation history.
Response: answer text plus optional source context.

3. GET /api/graph/full
Description: retrieve full graph nodes and edges for visualization.
Response: graph object containing nodes and relationships.

4. GET /api/graph/risks
Description: retrieve risk-oriented graph projection.
Response: filtered graph for risk analysis views.

#### 3.4.4 Operational and Governance Endpoints

1. GET /api/audit
Description: list audit records by date/action filters.

2. GET/POST /api/approvals
Description: read and submit approval actions.

3. GET/POST /api/notifications
Description: notification feed operations and acknowledgment updates.

4. POST /api/handover/generate
Description: generate succession or handover intelligence outputs.

5. Admin and role routes
Description: role assignment, user management, and policy enforcement helpers.

#### 3.4.5 WebSocket Endpoint

1. WS /api/ws/documents/{doc_id}/status
Description: stream staged progress for document processing lifecycle.
Payload Shape: progress percentage, stage name, optional message.

### 3.5 Authentication and Authorization Flow

#### 3.5.1 Authentication Sequence

1. User submits credentials from login page.
2. Frontend initiates Supabase sign-in.
3. Supabase issues JWT session token.
4. Frontend stores token in session context.
5. API requests include Authorization Bearer header.
6. Backend dependency validates token and resolves user identity.
7. Request continues only if token is valid and user context exists.

#### 3.5.2 Authorization Sequence

1. Role is attached to user context at request time.
2. Endpoint enforces permission checks at route/service layer.
3. Frontend also gates UI actions using role-aware hooks and components.
4. Database-level policies can add additional RLS safety.
5. Unauthorized actions return explicit 403 responses.

#### 3.5.3 Role Model

Representative roles include ADMIN, MANAGER, ENGINEER, SAFETY_OFFICER, and OPERATOR.

1. ADMIN: full configuration, user, and governance authority.
2. MANAGER: operational oversight and approval-oriented capabilities.
3. ENGINEER: technical content and workflow execution capabilities.
4. SAFETY_OFFICER: compliance and safety-critical process authority.
5. OPERATOR: constrained execution and consumption-level access.

### 3.6 Third-Party Integration Architecture

#### 3.6.1 Supabase Integration

1. Auth issuance and session lifecycle management.
2. Profile and identity context retrieval.
3. Storage operations for uploaded files.

#### 3.6.2 AI Integration (Gemini and OpenRouter)

1. Gemini used for document enrichment and embeddings.
2. OpenRouter used for chat model routing and fallback flexibility.
3. Service layer wraps providers to isolate downstream API variation.

#### 3.6.3 Neo4j Integration

1. Service layer extracts entities/relationships from analyzed content.
2. Graph persistence provides relationship-aware querying.
3. Frontend graph components consume graph API responses for 2D/3D rendering.

#### 3.6.4 Redis Integration

1. Rate-limiting counters and request-throttle state.
2. Pub/sub signaling for real-time processing updates.

#### 3.6.5 MQTT Integration

1. Mosquitto config supports IoT-facing scenarios.
2. Architecture supports telemetry expansion with topic-based messaging.

### 3.7 Architectural Trade-offs and Design Rationale

1. Monolith-with-layers is faster to ship than microservices in early stages.
2. PostgreSQL + pgvector avoids immediate dependence on standalone vector DBs.
3. Separate Neo4j is justified because relationship analytics are first-class in the product.
4. Supabase significantly reduces auth and storage implementation overhead.
5. Real-time user experience uses WebSocket only where it adds clear operational value.
### 3.8 Concrete API Contracts (Implementation Spec)

#### 3.8.1 POST /api/chat/

Request schema:

```json
{
  "message": "Summarize safety risks in DOC-2026-019",
  "conversationHistory": [
    { "role": "user", "content": "Show unresolved incidents" },
    { "role": "assistant", "content": "3 unresolved incidents found" }
  ],
  "contextDocumentIds": ["DOC-2026-019"],
  "stream": false
}
```

Response schema (200):

```json
{
  "answer": "Primary risk is overdue pressure valve inspection...",
  "model": "openrouter/mistral-small-3.1",
  "sources": [
    { "document_id": "DOC-2026-019", "section": "4.2", "score": 0.91 }
  ],
  "latency_ms": 842
}
```

Status codes:

1. 200: successful completion.
2. 400: invalid payload shape.
3. 401: missing or invalid bearer token.
4. 422: schema validation failed (strict model violation).
5. 429: rate-limit triggered.
6. 503: upstream model unavailable and fallback exhausted.

Error payload:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "conversationHistory items must contain only role and content",
    "request_id": "req_9f4e3a"
  }
}
```

#### 3.8.2 POST /api/search

Request schema:

```json
{
  "query": "permit to work for boiler 2",
  "limit": 20,
  "offset": 0,
  "filters": {
    "status": ["active"],
    "tags": ["safety", "permit"],
    "department": ["Operations"]
  }
}
```

Response schema (200):

```json
{
  "items": [
    {
      "document_id": "DOC-2026-011",
      "title": "Boiler 2 Permit SOP",
      "match_type": "hybrid",
      "score": 0.938,
      "snippet": "...isolation and lockout sequence..."
    }
  ],
  "total": 1,
  "timing_ms": {
    "embed": 68,
    "vector": 35,
    "keyword": 22,
    "merge": 5
  }
}
```

Status codes:

1. 200: success.
2. 400: empty query.
3. 422: invalid filters or type mismatch.
4. 500: search backend processing error.

#### 3.8.3 GET /api/documents/{id}

Response schema (200):

```json
{
  "id": "DOC-2026-011",
  "title": "Boiler 2 Permit SOP",
  "status": "completed",
  "uploaded_by": "USR-101",
  "ocr_text_present": true,
  "summary": "Procedure for hot work permit issuance...",
  "insights": {
    "risk_level": "medium",
    "review_due": "2026-10-01"
  },
  "created_at": "2026-04-08T10:15:21Z",
  "updated_at": "2026-04-08T10:18:49Z"
}
```

Status codes:

1. 200: success.
2. 401: unauthorized.
3. 403: forbidden by RBAC/RLS policy.
4. 404: document not found.

### 3.9 WebSocket Protocol Contract

Endpoint:

1. WS /api/ws/documents/{doc_id}/status

Outbound event format:

```json
{
  "doc_id": "DOC-2026-011",
  "stage": "embedding",
  "progress": 60,
  "message": "Generating 768-dim vectors",
  "ts": "2026-04-08T10:17:12Z"
}
```

Control events:

1. heartbeat: every 20s to keep connection alive.
2. complete: progress=100 and stage=completed.
3. failed: stage=failed with error.code and error.message.

### 3.10 Neo4j Graph Schema (Operational)

Node labels:

1. Document
2. Entity
3. Risk
4. Process
5. Asset
6. Person

Relationship types:

1. EXTRACTED_FROM (Entity->Document)
2. RELATED_TO (Entity->Entity)
3. CAUSES (Risk->Incident or Risk->Process)
4. MITIGATED_BY (Risk->Control)
5. OWNS (Person->Asset)
6. REFERENCES (Document->Process)

Cypher indexing examples:

```cypher
CREATE INDEX document_id IF NOT EXISTS FOR (d:Document) ON (d.id);
CREATE INDEX entity_name IF NOT EXISTS FOR (e:Entity) ON (e.name);
CREATE INDEX risk_level IF NOT EXISTS FOR (r:Risk) ON (r.level);
```

### 3.11 AI and Embedding Runtime Details

Prompt templates:

1. Document summarization template: concise 8-12 bullet extract with risk/control emphasis.
2. Search expansion template: rewrite user query into domain synonyms and safety keywords.
3. Chat answer template: answer, rationale, source references, confidence note.

Runtime settings:

1. Temperature: 0.2 for extraction and compliance-sensitive summaries.
2. Temperature: 0.4 for chat assistance where exploratory responses are useful.
3. Max tokens: 1024 chat, 512 summary, configurable by environment.

Fallback routing:

1. Primary model route via OpenRouter.
2. On non-2xx or timeout > 8s, fallback to Gemini route.
3. On dual failure, return 503 with retriable error code.

Embeddings:

1. Dimension: 768 (Gemini embedding profile currently assumed).
2. Distance metric: cosine similarity in pgvector queries.
3. Chunking: 600-900 tokens target with overlap for long documents.

## 4. Database Design

### 4.1 Database Choice Rationale

K-LENS uses a hybrid persistence strategy:

1. PostgreSQL as the primary relational system of record.
2. pgvector extension for embedding similarity search in the same relational boundary.
3. Neo4j for relationship-heavy graph projections that are difficult to model/query efficiently in tabular form.
4. Redis for short-lived operational state and messaging.

This combination was selected to balance transactional consistency, AI retrieval requirements, and graph-native traversal workloads.

### 4.2 Entity-Relationship Overview (ASCII)

```text
 users (1) -------- (1) user_profiles
	 |
	 | (1)
	 +-------- (N) documents -------- (N) document_versions
	 |
	 +-------- (N) audit_logs
	 |
	 +-------- (N) approvals
	 |
	 +-------- (N) access_rules

 notifications (linked to users by recipient/user identifiers)
 handover domain tables (linked to users/assets depending on schema)

 Neo4j graph layer:
	 Document nodes --RELATIONSHIP--> Entity nodes (Person, Machine, Risk, Process, etc.)
```

### 4.3 Table-Level Design

The exact schema is distributed across ORM models and SQL scripts. The list below consolidates the major data structures.

#### 4.3.1 users

Representative fields:

1. id: UUID/PK, unique user identity.
2. email: unique indexed login identifier.
3. full_name/display_name: user-friendly identifier.
4. role: role enum or constrained text.
5. department: optional organizational grouping.
6. password_hash (legacy/local mode): credential hash.
7. created_at and updated_at: auditing timestamps.

Constraints and notes:

1. email must be unique.
2. role should map to RBAC catalog.
3. password values are never stored in plain text.

#### 4.3.2 user_profiles

Representative fields:

1. id: profile PK.
2. user_id: FK to users.id.
3. shift_pattern or shift metadata fields.
4. location and facility context fields.
5. emergency_contact details.
6. expertise/certification-related metadata.
7. voice settings and personalization fields.

Constraints and notes:

1. user_id should be unique for one-to-one profile mapping.
2. profile fields are used in role and workflow personalization.

#### 4.3.3 documents

Representative fields:

1. id: document PK.
2. title and filename: source identity.
3. uploaded_by / owner reference to user.
4. status: upload/processing/completed/failed.
5. ocr_text: extracted source text.
6. summary: AI-generated overview.
7. insights_json or structured insight columns.
8. embedding: vector field (Vector(768) in current model).
9. created_at and updated_at.

Constraints and notes:

1. status values should be constrained to valid lifecycle states.
2. uploaded_by FK enforces ownership lineage.
3. embedding dimensionality must match configured model outputs.

#### 4.3.4 document_versions

Representative fields:

1. id: version PK.
2. document_id: FK to documents.id.
3. version_number or semantic revision marker.
4. content_snapshot reference or delta payload.
5. commit_message / change_note.
6. author_id and timestamp fields.

Constraints and notes:

1. document_id supports one-to-many version history.
2. version ordering should be index-backed for efficient restore operations.

#### 4.3.5 approvals

Representative fields:

1. id: approval PK.
2. requester_id: initiating user.
3. approver_id: reviewing authority.
4. resource_type and resource_id.
5. action_type.
6. status: pending/approved/rejected.
7. comment and decision metadata.
8. created_at and resolved_at.

Constraints and notes:

1. status transitions should be controlled by service logic.
2. indexes on status and created_at improve queue views.

#### 4.3.6 audit_logs

Representative fields:

1. id: audit record PK.
2. user_id: actor reference.
3. action_type: normalized event type.
4. resource_type and resource_id.
5. details_json: flexible event metadata.
6. ip/user_agent (if captured).
7. created_at event timestamp.

Constraints and notes:

1. append-only semantics are recommended.
2. high-write scenarios need timestamp and actor indexes.

#### 4.3.7 access_rules

Representative fields:

1. id: rule PK.
2. subject role/user reference.
3. resource scope (document/project/domain).
4. permission action (read/write/approve/manage).
5. condition metadata.
6. active flag and validity windows.

Constraints and notes:

1. rule conflicts should be resolved by deterministic precedence.
2. rule lookup should be indexed by subject and resource scope.

#### 4.3.8 notifications domain tables

Representative fields:

1. id.
2. recipient_id.
3. category/type.
4. severity/priority.
5. message payload.
6. read_at or acknowledged_at.
7. escalation metadata.
8. created_at.

#### 4.3.9 handover/succession domain tables

Representative fields typically include:

1. user links.
2. role or position links.
3. asset/responsibility mappings.
4. orphan-risk indicators.
5. recommendation metadata.

### 4.4 Foreign Keys and Relationship Semantics

1. users.id anchors identity for documents, approvals, profiles, and audits.
2. documents.id anchors version history and downstream graph extraction traceability.
3. approver/requester relationships in approvals ensure accountability trails.
4. audit resources link actions to concrete records for compliance review.
5. profile linkage enables personalized operational context without polluting base identity records.

### 4.5 Indexing Strategy

1. users.email unique index for login path speed.
2. documents.status, documents.created_at indexes for dashboard filters.
3. documents.uploaded_by index for user-scoped views.
4. pgvector index on documents.embedding for semantic search acceleration.
5. audit_logs.created_at and audit_logs.user_id indexes for audit slicing.
6. approvals.status and approvals.created_at indexes for queue and SLA dashboards.
7. notifications.recipient_id and notifications.created_at indexes for inbox performance.
8. foreign-key columns indexed for join performance across service-heavy endpoints.

### 4.6 Migration and Seeding Strategy

1. Schema bootstrapping uses SQL scripts under backend-python root.
2. Environment setup runs schema scripts in controlled order: auth, RBAC, audit, notifications, handover.
3. Fix scripts are included for compatibility edge cases discovered during iteration.
4. Embedding migration script captures model dimension changes.
5. Demo/admin seed scripts enable predictable local development.
6. Backend seed helpers can populate default datasets during startup in non-production environments.

### 4.7 Backup and Recovery Plan

Recommended production posture:

1. Daily full PostgreSQL backups plus intra-day WAL archiving.
2. Point-in-time recovery enabled where hosting permits.
3. Weekly backup restore drills in staging to validate integrity.
4. Neo4j regular export snapshots aligned with PostgreSQL backup cadence.
5. Redis treated as reconstructable cache/message layer unless business-critical data is added.
6. Supabase storage bucket backup policy configured by retention class.
7. Recovery runbook documented with RTO/RPO targets and ownership matrix.

### 4.8 Data Governance and Operational Controls

1. Enforce least privilege database credentials per environment.
2. Use separate secrets per environment and rotate periodically.
3. Track schema changes through version-controlled migration scripts.
4. Apply RLS policies for tenant/role data boundaries where applicable.
5. Audit high-risk actions and administrative changes consistently.
### 4.9 Migration Execution Order and Rollback Plan

Recommended execution sequence:

1. auth_tables.sql
2. rbac_schema.sql
3. audit_logs_schema.sql
4. notifications_schema.sql
5. handover_tables.sql
6. rls_access_control.sql
7. supabase_functions.sql
8. migrate-to-768-dim.sql
9. fix_uploaded_by.sql
10. fix_document_user_type.sql
11. admin_setup.sql
12. demo_users.sql (non-production only)

Rollback strategy:

1. Every migration script must have a paired rollback script in release branch.
2. Apply migrations inside an explicit transaction where supported.
3. For high-impact DDL, perform blue/green migration or shadow table migration.
4. If migration fails, rollback transaction and redeploy previous backend image.
5. Run post-rollback integrity checks for users, documents, approvals, and audit tables.

### 4.10 Concrete Postgres Index Strategy

Planned/expected B-tree indexes:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_documents_status_created ON documents(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_status_created ON approvals(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON notifications(recipient_id, created_at DESC);
```

Vector index (pgvector):

```sql
CREATE INDEX IF NOT EXISTS idx_documents_embedding_hnsw
ON documents USING hnsw (embedding vector_cosine_ops);
```

Notes:

1. Use HNSW for large corpus semantic search.
2. Fall back to ivfflat where extension/runtime constraints exist.
3. Reindex windows should be scheduled during low-traffic periods.

## 5. Workflow & Pipeline

### 5.1 End-to-End User Journey

Representative operational journey:

1. User lands on login page.
2. User authenticates and receives session context.
3. Dashboard loads role-aware widgets and action shortcuts.
4. User uploads a document or queries existing records.
5. Backend begins asynchronous processing and emits status updates.
6. User watches live progress and opens generated insights.
7. User searches related data, graph entities, or asks AI chat follow-up questions.
8. User triggers approvals/notifications where governance requires.
9. System records auditable actions.
10. User completes shift tasks and exits with state persisted.

### 5.2 Data Flow Diagram (ASCII)

```text
 [User Action]
	 |
	 v
 [React UI] --(REST/WS)--> [FastAPI Router]
						 |
						 v
					[Dependency/Auth]
						 |
						 v
					  [Service Layer]
				 +---------+---------+
				 |         |         |
				 v         v         v
			 [Postgres] [Neo4j]   [Redis]
				 |                   |
				 v                   v
			 [Stored Data]     [Pub/Sub Status]
				 |
				 v
		   [Response + Updates]
				 |
				 v
			  [Frontend UI]
```

### 5.3 Request-Response Lifecycle

1. Client calls API through centralized API helper.
2. Request includes auth token if session exists.
3. FastAPI middleware enforces cross-cutting concerns (CORS, rate limits).
4. Dependency layer validates identity and resolves permissions.
5. Pydantic validation normalizes request structure.
6. Controller/router delegates business logic to a service class or function.
7. Service interacts with data stores and external providers.
8. Result is transformed into response schema.
9. Frontend updates state and presents success/error feedback.
10. Optional side effects are logged/audited for governance.

### 5.4 Background Jobs, Queues, and Scheduled Work

Current behavior emphasizes asynchronous processing within API-driven workflows.

1. Document processing runs in staged asynchronous tasks after ingestion.
2. Redis pub/sub broadcasts status events to subscribed clients.
3. Startup seed or initialization tasks can run during backend boot in non-production contexts.

Recommended extensions:

1. Introduce explicit task queue framework when workloads increase (for retries, dead-letter handling, scheduling).
2. Add scheduled cleanup jobs for temporary files and stale processing records.
3. Add periodic data-quality checks for graph consistency.

### 5.5 File Upload and Media Handling Pipeline

1. Frontend validates file presence and basic constraints before submission.
2. File submitted via multipart/form-data to upload endpoint.
3. Backend validates mime type/size and user authorization.
4. File stored in Supabase storage bucket (or configured storage backend).
5. Document record created with initial processing status.
6. OCR extraction obtains machine-readable text.
7. AI analysis creates summaries and insights payload.
8. Embeddings generated and stored for semantic retrieval.
9. Graph extraction identifies entities and relationships.
10. Final status emitted and visible to UI in near real time.

Failure and recovery handling:

1. Errors produce explicit failed status updates.
2. Partial results can be persisted where feasible for diagnostics.
3. Retries should be controlled to avoid duplicated graph writes.

### 5.6 Notification Pipeline

Primary in-app path:

1. Trigger event occurs (approval pending, processing finished, compliance flag, operational warning).
2. Notification record is created with recipient, severity, and payload.
3. Frontend bell and notification page display unread events.
4. User can acknowledge or mark as read.
5. Audit trail captures critical notification interactions.

Planned extensible channels:

1. Email integration for non-interactive alerts.
2. Push notification integration for mobile use cases.
3. SMS fallback for high-priority operational events.

### 5.7 CI/CD Pipeline (Target Process)

Even where tooling evolves, the recommended baseline pipeline is:

1. Developer pushes branch to git remote.
2. CI installs dependencies and runs static checks.
3. Frontend lint/typecheck/build jobs run.
4. Backend dependency and import checks run.
5. Optional test stages execute unit/integration suites.
6. Container images are built and tagged.
7. Security scans validate dependencies and image vulnerabilities.
8. Artifacts promoted to staging environment.
9. Smoke tests validate critical user paths.
10. Manual or policy-gated approval promotes build to production.
11. Post-deploy health checks validate services.
12. Rollback path is prepared for failed deployment criteria.

### 5.8 Operational Control Points

1. Health check scripts provide quick service verification.
2. Rate limiting mitigates accidental or malicious load spikes.
3. Role checks prevent unauthorized process execution.
4. Audit logging maintains accountability for compliance and incident review.
5. Environment templates reduce configuration drift between environments.

### 5.9 Workflow Risks and Mitigations

1. Risk: upload failures due to storage or network interruptions.
Mitigation: staged statuses, explicit error states, retry-friendly design.

2. Risk: AI provider latency or temporary outages.
Mitigation: fallback providers where supported and user-visible status transparency.

3. Risk: graph duplication from repeated enrichment calls.
Mitigation: idempotent entity merge logic and deterministic identifiers.

4. Risk: delayed or missing real-time progress events.
Mitigation: heartbeat/reconnect handling and last-known-status polling fallback.

## 6. All Features

### 6.1 Core Features

#### 6.1.1 Authentication and Session Context

Feature Description:
K-LENS provides secure login and role-aware session initialization to ensure that users only access appropriate capabilities. The flow integrates identity with industrial context such as shift and responsibility metadata.

Technical Operation:

1. Frontend login triggers Supabase authentication.
2. JWT token is attached to API requests.
3. Backend resolves current user and permissions via auth dependencies.
4. Client contexts persist role, theme, and language preferences.

Files Involved:

1. src/pages/Login.tsx
2. src/contexts/AuthContext.tsx
3. src/lib/supabase.ts
4. backend-python/app/api/supabase_auth.py
5. backend-python/app/dependencies/auth.py

Edge Cases Handled:

1. Token expiration and reauthentication flow.
2. Unauthorized route access redirection.
3. Missing profile context fallback handling.

#### 6.1.2 Document Upload and Processing

Feature Description:
Users upload operational files that are processed through OCR, summarization, embedding, and graph enrichment. The pipeline is designed to make unstructured documents immediately useful in downstream discovery and governance workflows.

Technical Operation:

1. Upload endpoint accepts file payloads.
2. Document record is created with processing status.
3. Service stages perform extraction, AI analysis, and vector generation.
4. Graph relationships are generated from extracted insights.

Files Involved:

1. src/components/klens/UploadView.tsx
2. src/components/klens/DocumentProcessor.tsx
3. backend-python/app/api/documents.py
4. backend-python/app/api/upload.py
5. backend-python/app/services/gemini_service.py
6. backend-python/app/services/neo4j_service.py

Edge Cases Handled:

1. Unsupported file type rejection.
2. Processing failure status propagation.
3. Partial metadata persistence for diagnostics.

#### 6.1.3 Real-Time Processing Feedback

Feature Description:
K-LENS keeps users informed during async operations using WebSocket progress updates. This improves trust in long-running workloads such as document ingestion.

Technical Operation:

1. Frontend opens document-specific WebSocket channel.
2. Backend publishes stage events to subscribed clients.
3. UI renders progress indicators and completion states.

Files Involved:

1. src/lib/websocket.ts
2. src/components/klens/DocumentProcessor.tsx
3. backend-python/app/api/websocket.py

Edge Cases Handled:

1. Socket disconnect fallback and reconnection behavior.
2. Missing progress event tolerance using last-known state.

#### 6.1.4 Search and Discovery

Feature Description:
Search combines semantic similarity and keyword matching so users can find relevant content even when terminology varies across documents.

Technical Operation:

1. Query sent to search endpoint.
2. Embedding generated for semantic matching.
3. Keyword and vector scores combined.
4. Ranked results returned with relevance metadata.

Files Involved:

1. src/components/klens/SearchDiscoveryView.tsx
2. backend-python/app/api/search.py
3. backend-python/app/models/document.py

Edge Cases Handled:

1. Empty query validation.
2. Graceful fallback when AI provider is unavailable.

#### 6.1.5 Knowledge Graph Visualization

Feature Description:
K-LENS exposes entity relationships through 2D and 3D visual interfaces for faster reasoning about process dependencies, risks, and operational context.

Technical Operation:

1. Frontend requests graph datasets.
2. API returns nodes and relationships from graph service.
3. UI renders force/directed or blueprint-like layouts.

Files Involved:

1. src/components/klens/KnowledgeGraphView.tsx
2. src/components/klens/KnowledgeGraph3D.tsx
3. backend-python/app/api/graph.py
4. backend-python/app/services/neo4j_service.py

Edge Cases Handled:

1. Demo graph fallback when API unavailable.
2. Node/edge density throttling for render performance.

#### 6.1.6 AI Chat Assistant

Feature Description:
The built-in assistant helps users ask context-aware questions and receive operationally useful responses tied to project knowledge.

Technical Operation:

1. User message and normalized history sent to /chat/.
2. Backend routes request to primary/fallback model providers.
3. Response returned and rendered in sidebar chat UI.

Files Involved:

1. src/components/klens/AIChatSidebar.tsx
2. backend-python/app/api/chat.py
3. backend-python/app/services/gemini_service.py

Edge Cases Handled:

1. Strict payload validation prevents schema drift.
2. Provider fallback avoids single-point model failure.

### 6.2 Secondary and Supporting Features

1. Dashboard analytics widgets for KPI and trend visibility.
2. Notification center with unread counts and acknowledgment states.
3. Audit trail browser for compliance-driven traceability.
4. Multilingual language context for user accessibility.
5. Theme controls for usability and preference adaptation.
6. Kiosk mode with lock screen and auto-timeout protection.
7. Voice-to-text interactions for hands-busy scenarios.

Primary supporting files:

1. src/components/klens/DashboardView.tsx
2. src/components/Notifications/NotificationBell.tsx
3. src/components/klens/AuditTrail.tsx
4. src/hooks/useVoiceToText.ts
5. src/components/klens/KioskProvider.tsx
6. src/components/klens/KioskLockScreen.tsx

### 6.3 Admin Panel Features

1. User list and profile management.
2. Role assignment and adjustment workflows.
3. Approval queue oversight.
4. Audit and compliance review tooling.
5. Operational settings management.

Files involved:

1. src/pages/Users.tsx
2. src/components/klens/RoleManagementView.tsx
3. backend-python/app/api/user_management.py
4. backend-python/app/api/roles.py
5. backend-python/app/api/approvals.py

### 6.4 Role-Based Access Control Features

Representative permissions by role:

1. ADMIN
Can: full user/role management, all operational and governance actions.
Cannot: bypass system-level invariants such as schema constraints.

2. MANAGER
Can: review operations, approve defined actions, consume strategic analytics.
Cannot: execute restricted platform-administration tasks.

3. ENGINEER
Can: upload/process technical documents, use graph/search/chat tools.
Cannot: modify global role policy assignments.

4. SAFETY_OFFICER
Can: compliance/audit operations and safety-critical review paths.
Cannot: broad user administration outside delegated scope.

5. OPERATOR
Can: consume assigned workflows and limited operational interfaces.
Cannot: access high-privilege governance or system settings.

Enforcement paths:

1. Frontend guards via permission hooks/components.
2. Backend guards via role checks and dependency validation.
3. SQL policy scripts for additional data-layer controls.

### 6.5 Planned and Future Features

1. Stronger workflow orchestration with explicit queue/retry framework.
Rationale: improve reliability for heavy ingestion volumes.

2. Expanded outbound notification channels (email/push/SMS).
Rationale: improve actionability outside active dashboard sessions.

3. Advanced graph curation and deduplication workflows.
Rationale: increase trust in relationship analytics.

4. Enterprise integration adapters for ERP/SCADA systems.
Rationale: reduce data silos and manual synchronization overhead.

5. Richer testing matrix with automated integration and e2e suites.
Rationale: reduce regression risk as feature count grows.

6. Policy-based retention and governance automation.
Rationale: simplify compliance posture in regulated environments.

### 6.6 Feature Maturity Snapshot

1. Production-leaning: auth, dashboarding, document operations, role checks.
2. Growth-stage: advanced handover intelligence and graph operationalization.
3. Roadmap-heavy: broader integrations, notification channels, deeper automation.

## 7. DevOps, Security & Miscellaneous

### 7.1 Environment Variables and Configuration Management

Representative variable catalog:

| Variable | Purpose | Example | Required |
|---|---|---|---|
| DATABASE_URL | Primary PostgreSQL connection string | postgresql://user:pass@db:5432/klens | Yes |
| REDIS_URL | Redis endpoint for rate limits/pubsub | redis://redis:6379/0 | Yes |
| NEO4J_URI | Neo4j driver URI | bolt://neo4j:7687 | Yes |
| NEO4J_USER | Neo4j username | neo4j | Yes |
| NEO4J_PASSWORD | Neo4j password | strong_generated_password | Yes |
| SUPABASE_URL | Supabase project URL | https://xyz.supabase.co | Yes |
| SUPABASE_ANON_KEY | Supabase public key | sb_public_key | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Supabase server key | sb_service_key | Yes (backend) |
| GEMINI_API_KEY | Gemini API access | gemini_key_value | Yes for AI features |
| OPENROUTER_API_KEY | OpenRouter API access | openrouter_key_value | Optional fallback path |
| JWT_SECRET | Token signing/verification secret | random_32_plus_char_secret | Yes |
| ENVIRONMENT | Runtime mode flag | development or production | Yes |
| CORS_ORIGINS | Allowed origins list | http://localhost:5173 | Yes |

Configuration practices:

1. Keep secrets outside repository and inject at runtime.
2. Use .env.example files as templates only.
3. Separate values by environment (dev, staging, production).
4. Rotate high-privilege keys on a defined schedule.

### 7.2 Docker and Containerization Setup

1. Frontend Dockerfile builds assets and serves static content via Nginx.
2. Backend Dockerfile packages FastAPI app with Python dependencies.
3. docker-compose.yml orchestrates app, database, cache, graph DB, proxy, and MQTT components.
4. docker-compose override file supports local development customization.

Service-level responsibilities:

1. frontend container: static SPA serving.
2. backend container: API routing, auth checks, AI orchestration.
3. postgres container: relational storage and vector indexing.
4. redis container: throttling and status pub/sub.
5. neo4j container: graph persistence.
6. nginx container: ingress/proxy behavior.
7. mosquitto container: MQTT message broker for IoT scenarios.

### 7.3 Cloud Deployment Model

Recommended target model:

1. Host containers on managed container platform or Kubernetes.
2. Deploy across at least one primary region with optional DR region.
3. Place Nginx or managed load balancer in front of frontend/backend routing.
4. Configure autoscaling on backend CPU/memory and request latency thresholds.
5. Use managed PostgreSQL/Redis/Neo4j offerings where operationally justified.

Deployment policy recommendations:

1. Blue/green or canary deployment for high-confidence rollout.
2. Staging parity with production for reliable verification.
3. Infrastructure-as-code for repeatable environment creation.

### 7.4 Monitoring and Logging Strategy

1. Application logs: structured JSON preferred for backend.
2. Access logs: proxy-level request traces with status/latency.
3. Metrics: request rate, error rate, p95/p99 latency, queue durations.
4. Infrastructure metrics: CPU, memory, DB connections, cache hit ratio.
5. Alerting thresholds: sustained 5xx, high latency, DB saturation, provider outage.

Operational dashboard priorities:

1. API health and endpoint failure distribution.
2. Document processing throughput and error ratio.
3. AI provider latency and fallback rates.
4. WebSocket connection health and disconnect trends.

### 7.5 Security Practices

1. Input validation on all external-facing payloads.
2. Centralized auth dependency and token validation.
3. RBAC checks at endpoint/service boundaries.
4. Row-level controls where data-scope constraints are required.
5. Rate limiting to reduce abuse and burst overload.
6. CORS allowlist policy aligned to known frontend origins.
7. TLS/HTTPS enforcement in production ingress.
8. Secret isolation via environment injection and restricted vault access.
9. Dependency vulnerability auditing in CI.
10. Audit logging for sensitive actions.

### 7.6 Performance Optimizations

1. Frontend code splitting and lazy loading of heavy views.
2. Memoization and selective rendering for large dashboards.
3. API-level pagination on list-heavy endpoints.
4. Indexed query paths for common filters.
5. pgvector index tuning for semantic search latency.
6. Redis caching for short-lived hot reads where correctness allows.
7. Graph query optimization and result-size controls for visualization endpoints.
8. WebSocket payload minimization to reduce bandwidth overhead.

### 7.7 Testing Strategy

Current baseline and recommended expansion:

1. Frontend static quality: linting and TypeScript checks.
2. Backend endpoint verification through FastAPI docs and scripted checks.
3. Health-check scripts for service readiness.
4. Target unit tests:
Cover auth helpers, permission checks, validation utilities, and core services.
5. Target integration tests:
Cover document pipeline, search API, graph endpoints, and auth-protected routes.
6. Target end-to-end tests:
Cover login, upload, search, chat, and role-restricted flows.
7. Coverage targets:
Start with realistic thresholds and increment as test maturity improves.

Suggested command surface for future standardization:

1. frontend lint and typecheck.
2. backend test runner command.
3. integration test profile against ephemeral compose environment.
### 7.8 Security and Compliance Control Matrix

Encryption:

1. At-rest: PostgreSQL volume encryption and KMS-managed keys for production disks.
2. At-rest (sensitive columns): pgcrypto for selective field encryption where required.
3. In-transit: TLS 1.2+ between client and ingress, and TLS for managed DB connections.

Audit immutability:

1. audit_logs table is append-only at application layer.
2. UPDATE/DELETE denied for non-admin break-glass role.
3. Daily hash-chain export of audit records to immutable object storage (WORM policy).

Secret rotation policy:

1. Owner: Platform/SRE.
2. JWT secrets: 90 days.
3. API keys (Gemini/OpenRouter): 60 days.
4. DB credentials: 90 days or immediate rotation on incident.
5. Secret managers: Vault or cloud secret manager, never source-controlled .env in production.

Data retention and purge:

1. Documents: retain 5 years unless legal hold applies.
2. Embeddings: purge with parent document plus 30-day recovery window.
3. Audit logs: retain 7 years in safety-critical mode.
4. Notification records: retain 12 months.

### 7.9 Test Structure, Mocks, and Coverage Targets

Recommended test layout:

```text
backend-python/tests/
  unit/
  integration/
  contract/
src/__tests__/
  unit/
  integration/
  e2e/
```

Mocking strategy:

1. Supabase: mocked auth and storage adapters.
2. Gemini/OpenRouter: deterministic fixture responses.
3. Neo4j: test container or in-memory fixture graph.
4. Redis: ephemeral container per integration suite.

Coverage targets:

1. Backend services: >= 70% line coverage.
2. Backend API contract tests: >= 80% endpoint coverage for critical routes.
3. Frontend utilities/hooks: >= 60% line coverage.
4. Critical path e2e scenarios: 100% for login, upload, RBAC check, chat call.

Example critical test cases:

1. Auth flow: expired JWT should return 401 and redirect to login.
2. Upload failure: invalid MIME should return 400 with validation code.
3. RBAC bypass attempt: OPERATOR hitting admin endpoint must return 403.
4. Chat payload guard: unexpected fields in conversationHistory should return 422.

### 7.10 CI/CD and Deployment Implementation

CI/CD platform:

1. GitHub Actions recommended for repository-native automation.

Minimal pipeline:

```yaml
name: klens-ci
on:
  push:
    branches: [main]
  pull_request:

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run lint
      - run: npm run build

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r backend-python/requirements.txt
      - run: python -m pytest backend-python/tests -q
```

Infrastructure as Code:

1. Terraform modules for network, secrets, database, and container runtime.
2. Separate state files/workspaces per environment.

Monitoring stack:

1. OpenTelemetry SDK in API service.
2. Prometheus for metrics scraping.
3. Grafana dashboards for latency/error/SLO.
4. Log aggregation via Loki or managed provider logs.

Rollback and continuity targets:

1. Blue/green rollback window: <= 10 minutes.
2. RTO: 30 minutes.
3. RPO: 15 minutes for relational data.
4. Incident rollback runbook stored with release artifacts.

### 7.11 Section Handoff

Glossary terms and changelog template are maintained in Section 8.



## 8. Glossary & Changelog

### 8.1 Glossary

1. RBAC: Role-Based Access Control.
2. RLS: Row-Level Security in SQL databases.
3. OCR: Optical Character Recognition.
4. JWT: JSON Web Token for stateless auth context.
5. pgvector: PostgreSQL extension for embedding vectors.
6. Embedding: Numeric vector representation of text semantics.
7. WebSocket: Bidirectional protocol for real-time messaging.
8. ASGI: Async server interface for Python web apps.
9. HMR: Hot Module Replacement for frontend development.
10. SLO/SLA: Service objective/agreement reliability targets.