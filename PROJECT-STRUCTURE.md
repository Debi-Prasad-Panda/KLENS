# K-LENS Project Structure

## 📁 Root Directory

```
KLENS/
├── 🚀 START-HERE.md              # Begin here!
├── 📖 README.md                  # Project overview
├── 📖 README-QUICK-START.md      # Quick start guide
├── 🔧 SETUP.md                   # Detailed setup instructions
├── 🚢 DEPLOYMENT.md              # Production deployment guide
├── 📚 FEATURES.md                # Complete feature documentation
│
├── 🐳 Docker Files
│   ├── docker-compose.yml        # Docker services configuration
│   ├── Dockerfile                # Frontend Docker image
│   ├── nginx.conf                # Nginx reverse proxy config
│   ├── mosquitto.conf            # MQTT broker config
│   └── .dockerignore             # Docker build exclusions
│
├── 🎬 Startup Scripts
│   ├── start-docker.bat          # Windows Docker startup
│   ├── start-docker.sh           # Linux/Mac Docker startup
│   ├── start-local.bat           # Windows local startup
│   ├── start-local.sh            # Linux/Mac local startup
│   ├── check-health.bat          # Windows health check
│   └── check-health.sh           # Linux/Mac health check
│
├── ⚙️ Configuration
│   ├── .env.example              # Docker environment template
│   ├── .env.local.example        # Local environment template
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
│   │   │   ├── EnterpriseConnectors.tsx
│   │   │   ├── RoleBasedView.tsx
│   │   │   ├── NuclearKeys.tsx
│   │   │   ├── AuditTrail.tsx
│   │   │   ├── FeaturesShowcase.tsx
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
│   │   ├── websocket.ts          # WebSocket client
│   │   └── utils.ts              # Utility functions
│   ├── types/
│   │   └── auth.ts               # TypeScript types
│   ├── pages/
│   │   ├── Index.tsx             # Main page
│   │   └── NotFound.tsx          # 404 page
│   └── hooks/                    # Custom React hooks
│
└── 🔧 Backend (backend/)
    ├── package.json              # Backend dependencies
    ├── tsconfig.json             # TypeScript config
    ├── Dockerfile                # Backend Docker image
    ├── .env.example              # Environment template
    │
    └── src/
        ├── server.ts             # Main server file
        │
        ├── config/
        │   └── database.ts       # PostgreSQL & Redis setup
        │
        ├── controllers/
        │   ├── auth.controller.ts      # Authentication
        │   ├── document.controller.ts  # Document management
        │   └── approval.controller.ts  # Nuclear Keys approvals
        │
        ├── services/
        │   ├── ocr.service.ts          # Tesseract OCR
        │   ├── ai.service.ts           # Google Gemini AI
        │   └── mqtt.service.ts         # IoT MQTT broker
        │
        ├── middleware/
        │   └── auth.ts                 # JWT authentication
        │
        └── routes/
            └── index.ts                # API routes
```

## 🎯 Key Files Explained

### Startup Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `start-docker.bat/sh` | Start with Docker | Recommended for everyone |
| `start-local.bat/sh` | Start without Docker | If Docker fails |
| `check-health.bat/sh` | Verify all services | After starting |

### Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Docker environment variables |
| `backend/.env` | Backend configuration |
| `docker-compose.yml` | Docker services definition |
| `mosquitto.conf` | MQTT broker settings |
| `nginx.conf` | Reverse proxy configuration |

### Documentation Files

| File | Purpose |
|------|---------|
| `START-HERE.md` | Quick start guide |
| `SETUP.md` | Detailed setup instructions |
| `DEPLOYMENT.md` | Production deployment |
| `FEATURES.md` | Feature documentation |
| `README.md` | Project overview |

## 🔄 Data Flow

```
User Browser
    ↓
Nginx (Port 80)
    ↓
Frontend (React)
    ↓
Backend API (Port 3000)
    ↓
├── PostgreSQL (Database)
├── Redis (Cache)
├── Gemini AI (Analysis)
└── MQTT (IoT Sensors)
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
├── file_type
├── uploaded_by (FK → users)
├── status (processing/complete/error)
├── ocr_text
├── ai_summary
└── metadata (JSON)

document_versions
├── id (PK)
├── document_id (FK → documents)
├── version
├── content
├── changed_by (FK → users)
└── commit_message

audit_logs
├── id (PK)
├── user_id (FK → users)
├── action (view/edit/delete/revert)
├── resource_type
├── resource_id
└── details (JSON)

approvals (Nuclear Keys)
├── id (PK)
├── action_type
├── required_approvals
├── approvers (JSON)
├── status (pending/approved/rejected)
└── created_by (FK → users)

iot_sensors
├── id (PK)
├── sensor_id
├── name
├── location
├── sensor_type
└── thresholds (JSON)

iot_readings
├── id (PK)
├── sensor_id (FK → iot_sensors)
├── reading_type
├── value
└── timestamp
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/cinderella` - Grant time-bound access
- `GET /api/auth/cinderella` - Check Cinderella access

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document
- `PUT /api/documents/:id` - Update document
- `POST /api/documents/:id/revert/:version` - Revert version

### Approvals (Nuclear Keys)
- `POST /api/approvals` - Create approval request
- `POST /api/approvals/:id/approve` - Approve/reject
- `GET /api/approvals` - List pending approvals

## 🌐 WebSocket Events

### Client → Server
- `subscribe` - Subscribe to sensor updates

### Server → Client
- `reading` - New sensor reading
- `alert` - Threshold violation alert

## 🎨 UI Components

### Core Views
- **DashboardView** - Main dashboard with analytics
- **MorningBriefing** - Personalized task list
- **DocumentViewer** - Document display with AI analysis
- **IoTView** - Real-time sensor telemetry
- **KnowledgeGraphView** - Interactive entity graph
- **ComplianceView** - Compliance monitoring

### Advanced Features
- **RoleBasedView** - Engineer/Manager/Safety Officer perspectives
- **NuclearKeys** - Multi-signature approval system
- **AuditTrail** - Git-style version history
- **DocumentProcessor** - Upload with processing stages
- **EnterpriseConnectors** - Integration UI

## 🔐 Security Features

1. **JWT Authentication** - Stateless token-based auth
2. **bcrypt Password Hashing** - Secure password storage
3. **RBAC** - Role-based access control
4. **Cinderella Access** - Time-bound privilege escalation
5. **Nuclear Keys** - Multi-signature approvals
6. **Audit Logging** - Complete action trail
7. **Version Control** - Immutable document history

## 📊 Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- Recharts (data visualization)
- TanStack Query (state management)

### Backend
- Node.js 20 + Express
- TypeScript
- PostgreSQL 16 (database)
- Redis 7 (cache)
- Tesseract.js (OCR)
- Google Gemini AI
- MQTT (IoT)
- WebSocket (real-time)

### Infrastructure
- Docker & Docker Compose
- Nginx (reverse proxy)
- Mosquitto (MQTT broker)

## 🚀 Deployment Options

1. **Docker Compose** - Single server deployment
2. **Kubernetes** - Multi-server orchestration
3. **AWS** - ECS, RDS, ElastiCache, IoT Core
4. **Azure** - AKS, PostgreSQL, Redis, IoT Hub
5. **GCP** - GKE, Cloud SQL, Memorystore, IoT Core

## 📈 Scalability

- **Horizontal Scaling** - Multiple backend instances
- **Load Balancing** - Nginx upstream
- **Database Replication** - PostgreSQL streaming
- **Redis Clustering** - Distributed cache
- **CDN** - Static asset delivery

## 🔧 Development Workflow

1. **Local Development** - `npm run dev`
2. **Build** - `npm run build`
3. **Docker Build** - `docker-compose build`
4. **Deploy** - `docker-compose up -d`
5. **Monitor** - `docker-compose logs -f`

---

**For detailed instructions, see [START-HERE.md](./START-HERE.md)**
