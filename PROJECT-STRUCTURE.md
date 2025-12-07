# K-LENS Project Structure

## 📁 Root Directory

```
KLENS/
├── 🚀 START-HERE.md              # Begin here!
├── 📖 README.md                  # Project overview
├── 🔧 SETUP.md                   # Detailed setup instructions
├── 🚢 DEPLOYMENT.md              # Production deployment guide
│
├── 🐳 Docker Files
│   ├── docker-compose.yml        # Main Docker services (production)
│   ├── docker-compose.override.yml # Development overrides (live-reload)
│   ├── Dockerfile                # Frontend Docker image
│   ├── Dockerfile.dev            # Frontend dev image (hot-reload)
│   ├── nginx.conf                # Nginx reverse proxy config
│   └── .dockerignore             # Docker build exclusions
│
├── 🎬 Startup Scripts
│   ├── start.bat / start.sh      # Production startup
│   ├── start-dev.bat / start-dev.sh # Development with live-reload
│   ├── stop.bat / stop.sh        # Stop all services
│   └── restart.bat               # Restart services
│
├── ⚙️ Configuration
│   ├── .env                      # Environment variables
│   ├── package.json              # Frontend dependencies
│   ├── tsconfig.json             # TypeScript config
│   ├── tailwind.config.ts        # Tailwind CSS config
│   └── vite.config.ts            # Vite build config
│
├── 🎨 Frontend (src/)
│   ├── components/
│   │   ├── klens/                # Core application components
│   │   │   ├── DashboardView.tsx
│   │   │   ├── MorningBriefing.tsx
│   │   │   ├── DocumentProcessor.tsx
│   │   │   ├── RoleBasedView.tsx
│   │   │   ├── NuclearKeys.tsx
│   │   │   ├── AuditTrail.tsx
│   │   │   ├── IoTView.tsx
│   │   │   ├── KnowledgeGraphView.tsx
│   │   │   ├── ComplianceView.tsx
│   │   │   ├── DocumentViewer.tsx
│   │   │   ├── UploadView.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopNav.tsx
│   │   └── ui/                   # Reusable UI components (shadcn)
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication state
│   ├── lib/
│   │   ├── api.ts                # API client
│   │   └── utils.ts              # Utility functions
│   ├── types/
│   │   └── auth.ts               # TypeScript types
│   └── pages/
│       ├── Index.tsx             # Main page
│       └── NotFound.tsx          # 404 page
│
└── 🔧 Backend (backend-python/)
    ├── Dockerfile                # Backend Docker image
    ├── requirements.txt          # Python dependencies
    ├── .env                      # Backend configuration
    │
    └── app/
        ├── main.py               # FastAPI application
        │
        ├── api/                  # API Routers
        │   ├── auth.py           # Authentication + Cinderella Access
        │   ├── documents.py      # Document management + versioning
        │   ├── approvals.py      # Nuclear Keys approval system
        │   └── chat.py           # AI Chat with Gemini
        │
        ├── core/                 # Core configuration
        │   ├── config.py         # Settings
        │   ├── database.py       # PostgreSQL + pgvector
        │   └── security.py       # JWT + bcrypt
        │
        ├── models/               # SQLAlchemy models
        │   ├── user.py           # User model
        │   ├── document.py       # Document model
        │   ├── document_version.py # Version control
        │   ├── approval.py       # Nuclear Keys
        │   └── audit_log.py      # Audit trail
        │
        └── services/             # Business logic
            └── gemini_service.py # Google Gemini AI
```

## 🎯 Key Files Explained

### Startup Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `start.bat/sh` | Start in production mode | Demos, deployment |
| `start-dev.bat/sh` | Start with live reload | Active development |
| `stop.bat/sh` | Stop all services | Shutdown |

### Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Root environment variables |
| `backend-python/.env` | Backend configuration (Gemini API key) |
| `docker-compose.yml` | Docker services definition |
| `docker-compose.override.yml` | Development overrides |

## 🔄 Data Flow

```
User Browser
    ↓
Nginx (Port 80)
    ↓
Frontend (React/Vite)
    ↓
Backend API (Port 8000, FastAPI)
    ↓
├── PostgreSQL + pgvector (Database)
├── Redis (Cache + Cinderella Access)
├── Neo4j (Knowledge Graph)
└── Gemini AI (Analysis)
```

## 🗄️ Database Schema

```sql
users
├── id (PK)
├── email
├── password_hash
├── name
├── role (admin/manager/engineer/safety_officer)
└── department

documents
├── id (PK)
├── filename
├── original_name
├── file_type
├── file_size
├── uploaded_by (FK → users)
├── status (processing/ocr/analyzing/complete/failed)
├── ocr_text
├── ai_summary
├── embedding (vector)
└── metadata (JSON)

document_versions
├── id (PK)
├── document_id (FK → documents)
├── version
├── content
├── changed_by (FK → users)
├── commit_message
└── created_at

audit_logs
├── id (PK)
├── user_id (FK → users)
├── action (view/edit/delete/revert/upload)
├── resource_type
├── resource_id
├── details (JSON)
└── created_at

approvals (Nuclear Keys)
├── id (PK)
├── action_type
├── resource_id
├── required_approvals
├── approvers (JSON)
├── status (pending/approved/rejected)
├── created_by (FK → users)
├── created_at
└── completed_at
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login (OAuth2 form)
- `POST /api/auth/cinderella` - Grant time-bound access
- `GET /api/auth/cinderella` - Check Cinderella access

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document
- `PUT /api/documents/:id` - Update document (creates version)
- `POST /api/documents/:id/revert/:version` - Revert to version
- `GET /api/documents/:id/versions` - List versions

### Approvals (Nuclear Keys)
- `POST /api/approvals` - Create approval request
- `POST /api/approvals/:id/approve` - Vote on approval
- `GET /api/approvals` - List pending approvals

### Chat
- `POST /api/chat` - Chat with K-LENS AI

### Health
- `GET /` - API info
- `GET /health` - Health check

## 📊 Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- Recharts (data visualization)
- TanStack Query (state management)
- React Flow (Knowledge Graph)

### Backend
- Python 3.11 + FastAPI
- SQLAlchemy + Pydantic
- PostgreSQL 16 + pgvector
- Redis 7 (cache)
- Neo4j 5 (graph database)
- Google Gemini AI
- PyMuPDF (PDF processing)
- bcrypt + JWT (auth)

### Infrastructure
- Docker & Docker Compose
- Nginx (reverse proxy)

## 🔐 Security Features

1. **JWT Authentication** - Stateless token-based auth
2. **bcrypt Password Hashing** - Secure password storage
3. **RBAC** - Role-based access control
4. **Cinderella Access** - Time-bound privilege escalation (Redis TTL)
5. **Nuclear Keys** - Multi-signature approvals
6. **Audit Logging** - Complete action trail
7. **Version Control** - Immutable document history

## 🚀 Development Workflow

1. **Start Dev Mode** - `start-dev.bat` (live reload enabled)
2. **Make Changes** - Edit Python/React files
3. **Auto-Reload** - Changes reflect immediately
4. **Build Production** - `start.bat`

---

**For detailed instructions, see [START-HERE.md](./START-HERE.md)**
