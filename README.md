<p align="center">
  <h1 align="center">K-LENS Intelligence Nexus</h1>
  <p align="center">
    <strong>Industrial AI Platform for Document Management, IoT Monitoring & Knowledge Graphs</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Python-FastAPI-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Neo4j-5-008CC1?style=flat-square&logo=neo4j" alt="Neo4j" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker" />
  </p>
</p>

---

A real-time industrial intelligence platform that combines **AI-powered document analysis**, **knowledge graph visualization**, **IoT sensor monitoring**, and **compliance tracking** — built with a Python FastAPI backend and React frontend.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Manual Setup](#-manual-setup-development)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Configuration](#-configuration)
- [Development](#-development)
- [Docker Commands](#-docker-commands)
- [Troubleshooting](#-troubleshooting)
- [Security](#-security)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Security
- **JWT authentication** with bcrypt password hashing
- **Role-Based Access Control (RBAC)** — Admin, Manager, Engineer, Safety Officer
- **Cinderella Access** — Time-bound privilege escalation with auto-expiry (Redis TTL)
- **Nuclear Keys** — Multi-signature (2-of-3) approval for high-risk operations
- Secure session management with configurable token expiration

### 📄 AI-Powered Document Processing
- **Multi-format support** — PDF, DOCX, Excel, Images
- **OCR Engine** — Pytesseract for scanned documents
- **Fast PDF parsing** — PyMuPDF (10x faster than alternatives)
- **AI Analysis** — Google Gemini 1.5 Flash for summarization, risk detection, entity extraction
- **Background processing** — Non-blocking async uploads
- **Vector embeddings** — Semantic search with pgvector (768-dim)
- **5-stage pipeline** — Upload → OCR → AI Analysis → Graph Linking → Complete

### 🧠 AI Intelligence
- Automatic document summarization
- Risk identification and scoring
- Compliance checking (Factory Act 1948, Boiler Regulations 2017, Railway Safety Standards)
- Entity extraction for knowledge graphs
- Multilingual support (16+ languages including Hindi, Tamil, Telugu, Bengali)
- **Role-specific views** — Same document, different perspective for Engineers, Managers, and Safety Officers

### 🕸️ Knowledge Graph
- **React Flow** for 2D schematic visualization with Dagre auto-layout
- **3D visualization** — Force-directed graph with Three.js/WebGL
- **Entity types** — Documents, Risks, People, Machines, Departments
- **Interactive** — Click nodes for AI intelligence panel
- **Risk filter** — Toggle to show only critical risks
- **Time Slider Forensics** — Browse document state at any past date
- **Neo4j backend** — Persistent graph database for entity relationships

### 📊 Dashboard & Analytics
- Morning briefing with AI-extracted prioritized tasks
- Kanban-style action cards (color-coded by priority)
- Live telemetry ticker
- Department activity feed with real-time charts
- Document processing status tracking

### 🛡️ Governance & Audit
- **Git-style audit trail** — Every action versioned with commit messages
- **Tamper-proof logging** — View, edit, delete, download tracking
- **Instant revert** — One-click rollback to any document version
- **Compliance Watchdog** — Auto-scan against regulatory frameworks

### 📡 IoT & Real-Time Monitoring
- Live sensor telemetry (temperature, pressure, vibration)
- Auto-triggered alerts with relevant document retrieval
- WebSocket real-time updates

### 🚀 Additional Features
- **Semantic Search** — Natural language queries via pgvector
- **AI Chat** — Conversational interface powered by Gemini
- **Emergency Voice Mode** — Voice-activated interface for field use
- **Workforce Command Center** — Team management and succession planning
- **Enterprise Connectors** (architecture ready) — SharePoint, WhatsApp, IBM Maximo, Email Gateway
- **Kiosk Mode** — Lock screen for shared terminals
- **QR Code** support
- Responsive design — mobile, tablet, desktop

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript 5.8 | UI framework |
| Vite 5 + SWC | Build tooling |
| Tailwind CSS + shadcn/ui | Styling & component library |
| React Flow + Dagre | 2D knowledge graph |
| Three.js + react-force-graph-3d | 3D graph visualization |
| Recharts | Data visualization charts |
| TanStack Query | Server state management |
| React Hook Form + Zod | Form management & validation |
| React Router DOM 6 | Client-side routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| Python 3.11 + FastAPI | Async web framework |
| SQLAlchemy + Pydantic | ORM & validation |
| PostgreSQL 16 + pgvector | Database + vector search |
| Neo4j 5 | Graph database |
| Redis 7 | Cache, rate limiting, Cinderella access |
| Google Gemini 1.5 Flash | AI analysis & embeddings |
| PyMuPDF (fitz) | PDF text extraction |
| Pytesseract | OCR for scanned documents |
| JWT + bcrypt | Authentication |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Docker + Docker Compose | Containerization |
| Nginx | Reverse proxy |
| Mosquitto | MQTT broker for IoT |

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Gemini API Key](https://makersuite.google.com/app/apikey) (free)

### Start in 2 Steps

**1. Run the startup script:**
```bash
cd KLENS
start.bat          # Windows
./start.sh         # Linux/Mac
```

The script will automatically:
- Create `.env` file (add your Gemini API key when prompted)
- Start all services (PostgreSQL, Redis, Neo4j, Backend, Frontend)
- Create the admin user
- Display login credentials

**2. Open http://localhost and login:**
| Field | Value |
|-------|-------|
| Email | `admin@example.com` |
| Password | `Admin@123` |

### Access Points
| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Neo4j Browser | http://localhost:7474 |

### Other Commands
```bash
stop.bat           # Stop all services
restart.bat        # Restart services
start-dev.bat      # Development mode (auto-reload)
check-health.bat   # Verify all services are healthy
```

---

## 🔧 Manual Setup (Development)

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 16 with pgvector extension
- Redis 7
- Neo4j 5

### Backend Setup
```bash
cd backend-python

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env         # Windows
cp .env.example .env           # Linux/Mac
# Edit .env — add your GEMINI_API_KEY

# Start backend
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
# From project root
npm install
npm run dev
```

Frontend runs at http://localhost:5173 — update `src/lib/api.ts` if needed:
```typescript
const API_URL = 'http://localhost:8000/api';
```

---

## 📁 Project Structure

```
KLENS/
├── src/                          # React Frontend
│   ├── components/
│   │   ├── klens/               # Core app components (33 files)
│   │   │   ├── DashboardView.tsx
│   │   │   ├── DocumentViewer.tsx
│   │   │   ├── KnowledgeGraphView.tsx
│   │   │   ├── KnowledgeGraph3D.tsx
│   │   │   ├── SearchDiscoveryView.tsx
│   │   │   ├── ComplianceView.tsx
│   │   │   ├── IoTView.tsx
│   │   │   ├── AuditTrail.tsx
│   │   │   ├── NuclearKeys.tsx
│   │   │   ├── RoleManagementView.tsx
│   │   │   ├── EmergencyVoiceMode.tsx
│   │   │   ├── AIChatSidebar.tsx
│   │   │   ├── UploadView.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopNav.tsx
│   │   │   └── ...more
│   │   └── ui/                  # shadcn/ui components (49 files)
│   ├── contexts/                # Auth, Language, Theme contexts
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # API client, utilities, websocket
│   ├── pages/                   # Route pages
│   ├── types/                   # TypeScript type definitions
│   ├── data/                    # Demo graph data
│   └── styles/                  # Additional styles
│
├── backend-python/              # Python FastAPI Backend
│   ├── app/
│   │   ├── api/                 # API routers (auth, documents, approvals, chat)
│   │   ├── core/                # Config, database, security
│   │   ├── models/              # SQLAlchemy models
│   │   ├── services/            # Gemini AI service
│   │   ├── middleware/          # Rate limiting, validation
│   │   ├── dependencies/        # FastAPI dependencies
│   │   └── main.py              # FastAPI application
│   ├── *.sql                    # Database schema files
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml           # Production Docker services
├── docker-compose.override.yml  # Development overrides (live-reload)
├── Dockerfile / Dockerfile.dev  # Frontend Docker images
├── nginx.conf                   # Reverse proxy config
├── start.bat / start.sh         # Production startup scripts
├── start-dev.bat / start-dev.sh # Development startup scripts
└── package.json                 # Frontend dependencies
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login (returns JWT) |
| `POST` | `/api/auth/cinderella` | Grant time-bound access |
| `GET`  | `/api/auth/cinderella` | Check Cinderella access status |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/documents/` | Upload document (triggers AI processing) |
| `GET`  | `/api/documents/` | List documents |
| `GET`  | `/api/documents/{id}` | Get document details |
| `PUT`  | `/api/documents/{id}` | Update document (creates version) |
| `POST` | `/api/documents/{id}/revert/{version}` | Revert to a specific version |
| `GET`  | `/api/documents/{id}/versions` | List document versions |

### Approvals (Nuclear Keys)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/approvals` | Create approval request |
| `POST` | `/api/approvals/{id}/approve` | Vote on approval |
| `GET`  | `/api/approvals` | List pending approvals |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Chat with K-LENS AI |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/` | API info |
| `GET`  | `/health` | Health check (DB, Redis, Neo4j status) |

> **Interactive API Docs:** http://localhost:8000/docs (Swagger UI)

---

## ⚙️ Configuration

### Backend Environment Variables (`backend-python/.env`)

```env
# Database
DATABASE_URL=postgresql://klens_user:klens_secure_password_2024@postgres:5432/klens

# Redis
REDIS_URL=redis://redis:6379

# Neo4j
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=klens_neo4j_2024

# Authentication
JWT_SECRET=klens_jwt_secret_key_change_in_production_min_32_chars

# AI
GEMINI_API_KEY=your_gemini_api_key_here

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

### Frontend API URL (`src/lib/api.ts`)
```typescript
const API_URL = 'http://localhost:8000/api';
```

---

## 💻 Development

### Frontend Commands
```bash
npm install          # Install dependencies
npm run dev          # Development server (hot reload)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Commands
```bash
cd backend-python
pip install -r requirements.txt                    # Install dependencies
uvicorn app.main:app --reload --port 8000          # Dev server (auto-reload)
uvicorn app.main:app --host 0.0.0.0 --port 8000   # Production server
```

### Development Mode (Docker)
```bash
start-dev.bat       # Windows — starts with live-reload volumes
./start-dev.sh      # Linux/Mac
```
This mounts source code as volumes so changes reflect immediately without rebuilding.

---

## 🐳 Docker Commands

```bash
# Start all services (production)
docker-compose up -d --build

# Start with dev overrides (live-reload)
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

# Stop all services
docker-compose down

# Stop and delete all data (fresh start)
docker-compose down -v

# View logs
docker-compose logs -f              # All services
docker-compose logs -f backend      # Specific service

# Restart a service
docker-compose restart backend

# Rebuild a specific service
docker-compose up -d --build backend

# Open shell in container
docker-compose exec backend sh
docker-compose exec postgres psql -U klens_user -d klens
```

---

## 🔍 Troubleshooting

### Services won't start
```bash
docker-compose down -v
docker-compose up -d --build
```

### Backend not responding
```bash
docker-compose logs -f backend
docker-compose restart backend
```

### Can't connect to database
```bash
docker-compose restart postgres
# Wait 30 seconds, then restart backend
docker-compose restart backend
```

### Neo4j connection refused
Neo4j takes ~60 seconds to initialize. Wait and retry.

### Gemini API errors
Verify your API key in `backend-python/.env` and ensure it's valid at https://makersuite.google.com/app/apikey

### Frontend can't reach API
1. Check backend is running: `curl http://localhost:8000/health`
2. Verify API URL in `src/lib/api.ts`

### Port already in use
```bash
# Windows
netstat -ano | findstr :80
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
```

### 403 Forbidden during Docker build (network/proxy issue)
- **Easiest fix:** Connect to a mobile hotspot and retry
- **Alternative:** Pull images manually first:
  ```bash
  docker pull python:3.11-slim
  docker pull node:20-alpine
  docker pull nginx:alpine
  docker pull pgvector/pgvector:pg16
  docker pull redis:7-alpine
  docker pull neo4j:5-community
  ```

---

## 🔐 Security

- All API keys are stored server-side in environment variables — never exposed to the client
- JWT tokens with configurable expiration
- bcrypt password hashing (10 rounds)
- Redis-backed rate limiting
- Input validation and sanitization (XSS prevention)
- Row-Level Security ready

For detailed API key management and rotation procedures, see **[SECURITY-API-KEYS.md](./SECURITY-API-KEYS.md)**.

---

## 🗺️ Roadmap

### ✅ Completed
- Python FastAPI backend with async processing
- AI-powered document analysis (Gemini 1.5 Flash)
- Vector search with pgvector
- Knowledge graph (Neo4j + React Flow + 3D)
- Role-based access control with Cinderella Access & Nuclear Keys
- Git-style audit trail
- IoT telemetry dashboard
- Emergency Voice Mode
- Semantic search & AI Chat

### 🔮 Planned
- [ ] Celery for distributed task processing
- [ ] WebSocket real-time updates
- [ ] Advanced graph queries and analytics
- [ ] Export reports (PDF, Excel)
- [ ] Multi-tenant architecture
- [ ] Mobile app
- [ ] Enterprise connectors (SharePoint, IBM Maximo)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is private and proprietary.

---

<p align="center">
  <strong>Built with ❤️ using Python FastAPI, React & Google Gemini AI</strong>
</p>
