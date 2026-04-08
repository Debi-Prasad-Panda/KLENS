# K-LENS Intelligence Nexus

> **🚀 Industrial AI Platform for Document Management, IoT Monitoring, and Knowledge Graphs**

A modern, real-time industrial intelligence platform powered by Python FastAPI backend and React frontend.

---

## 🚀 Quick Start (2 Commands)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- [Gemini API Key](https://makersuite.google.com/app/apikey) (free)

### Steps

**1. Get your Gemini API key** from https://makersuite.google.com/app/apikey

**2. Run the startup script:**
```bash
cd KLENS
start.bat
```

The script will:
- ✅ Create `.env` file (add your API key when prompted)
- ✅ Start all services (PostgreSQL, Redis, Neo4j, Backend, Frontend)
- ✅ Create admin user automatically
- ✅ Show login credentials

**3. Login at http://localhost**
- Email: `admin@example.com`
- Password: `Admin@123`

### Other Commands
```bash
stop.bat       # Stop all services
restart.bat    # Restart services
start-dev.bat  # Development mode (auto-reload)
```

### Development vs Production

**Production Mode** (`start.bat`):
- ✅ Everything in Docker
- ✅ One command startup
- ❌ Need to rebuild for changes
- Use for: Demos, deployment

**Development Mode** (`start-dev.bat`):
- ✅ Auto-reload on file changes
- ✅ Faster development
- ❌ Requires Node.js & Python installed
- Use for: Active development

### Access Points
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Neo4j Browser**: http://localhost:7474

---

### Option 2: Manual Setup (Development)

#### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 16 with pgvector
- Redis
- Neo4j

#### Backend Setup
```bash
# Navigate to backend
cd backend-python

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env

# Edit .env and add your Gemini API key

# Run database migrations (if needed)
# alembic upgrade head

# Start backend
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000

#### Frontend Setup
```bash
# Navigate to project root
cd KLENS

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

#### Update Frontend API URL
Edit `src/lib/api.ts`:
```typescript
const API_URL = 'http://localhost:8000/api';
```

**You're ready!** 🎉

---

## 🎯 Features

### 🔐 Authentication & Security
- JWT-based authentication with bcrypt
- Role-based access control (Admin, Manager, Engineer, Safety Officer)
- Secure session management

### 📄 AI-Powered Document Processing
- **Multi-format support**: PDF, DOCX, Excel, Images
- **OCR Engine**: Pytesseract for scanned documents
- **Fast PDF parsing**: PyMuPDF (10x faster)
- **AI Analysis**: Google Gemini 1.5 Flash
- **Background processing**: Non-blocking uploads
- **Vector embeddings**: Semantic search with pgvector

### 🧠 AI Intelligence
- Automatic document summarization
- Risk identification
- Compliance checking (Factory Act 1948)
- Entity extraction for knowledge graphs
- Multilingual support (16+ languages)

### 🕸️ Knowledge Graph (2D Blueprint)
- **React Flow visualization**: Clean 2D schematic view
- **Auto-layout**: Dagre algorithm for perfect positioning
- **Entity types**: Documents, Risks, People, Machines, Departments
- **Interactive**: Click nodes for AI intelligence panel
- **Risk filter**: Toggle to show only critical risks
- **Neo4j backend**: Graph database for relationships

### 📊 Dashboard
- Morning briefing with AI-extracted tasks
- Live telemetry ticker
- Department activity feed
- Real-time processing status

### 🛡️ Governance & Audit
- Complete audit trail
- Document versioning
- Tamper-proof logging

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Graph**: React Flow (2D Blueprint)
- **Charts**: Recharts
- **State**: TanStack Query

### Backend (Python)
- **Framework**: FastAPI (async)
- **Database**: PostgreSQL + pgvector
- **Graph DB**: Neo4j
- **Cache**: Redis
- **AI**: Google Gemini 1.5 Flash
- **PDF**: PyMuPDF (fitz)
- **OCR**: Pytesseract
- **Auth**: JWT + bcrypt

### Infrastructure
- **Containers**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Message Queue**: Redis (ready for Celery)

---

## 📁 Project Structure

```
KLENS/
├── backend-python/          # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Config, database, security
│   │   ├── models/         # SQLAlchemy models
│   │   ├── services/       # Gemini AI service
│   │   └── main.py         # FastAPI app
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── src/                     # React frontend
│   ├── components/
│   │   ├── klens/          # Core components
│   │   └── ui/             # Reusable UI (shadcn)
│   ├── lib/                # Utilities
│   ├── pages/              # Route pages
│   └── main.tsx
├── docker-compose.python.yml
├── start-python-backend.bat
└── README.md
```

---

## 🎮 Usage

### Upload Documents
1. Navigate to **Upload** tab
2. Drag & drop PDF files
3. Watch real-time processing:
   - Uploading → OCR → AI Analysis → Graph Linking → Complete

### View Knowledge Graph
1. Navigate to **Knowledge Graph** tab
2. See auto-generated 2D blueprint
3. Click nodes to see AI intelligence
4. Use **FILTER: RISKS ONLY** to focus on critical items
5. Click **RESET VIEW** to recenter

### Search Documents
1. Use semantic search (powered by pgvector)
2. Find similar documents by meaning, not just keywords

### Explore Neo4j Graph
1. Open http://localhost:7474
2. Login: `neo4j` / `klens_neo4j_2024`
3. Run Cypher queries:
```cypher
MATCH (n) RETURN n LIMIT 25
```

---

## 🔧 Configuration

### Backend Environment Variables
Edit `backend-python/.env`:

```env
# Database
DATABASE_URL=postgresql://klens_user:klens_secure_password_2024@postgres:5432/klens

# Redis
REDIS_URL=redis://redis:6379

# Neo4j
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=klens_neo4j_2024

# JWT
JWT_SECRET=klens_jwt_secret_key_change_in_production_min_32_chars

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

### Frontend API URL
Edit `src/lib/api.ts`:
```typescript
const API_URL = 'http://localhost:8000/api';
```

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:8000/health
```

### Create User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@klens.local",
    "password": "Test@123",
    "name": "Test User",
    "role": "engineer",
    "department": "Engineering"
  }'
```

### Upload Document
```bash
curl -X POST http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

### Interactive API Testing
Open http://localhost:8000/docs for Swagger UI

---

## 🐛 Troubleshooting

### Services won't start?
```bash
docker-compose -f docker-compose.python.yml down -v
docker-compose -f docker-compose.python.yml up -d --build
```

### Check logs
```bash
docker-compose -f docker-compose.python.yml logs -f backend
```

### Backend not responding?
```bash
docker-compose -f docker-compose.python.yml restart backend
```

### Neo4j connection refused?
Wait 60 seconds - Neo4j takes time to initialize

### Gemini API errors?
Verify your API key in `backend-python/.env`

### Frontend can't connect?
Check that backend is running: http://localhost:8000/health

---

## 🚀 Development Commands

### Frontend Commands
```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm run test
```

### Backend Commands
```bash
# Navigate to backend
cd backend-python

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start development server (with auto-reload)
uvicorn app.main:app --reload --port 8000

# Start production server
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Run tests
pytest

# Run with coverage
pytest --cov=app
```

### Docker Commands
```bash
# Start all services
docker-compose -f docker-compose.python.yml up -d

# Stop all services
docker-compose -f docker-compose.python.yml down

# View logs
docker-compose -f docker-compose.python.yml logs -f

# View specific service logs
docker-compose -f docker-compose.python.yml logs -f backend

# Rebuild and start
docker-compose -f docker-compose.python.yml up -d --build

# Stop and remove volumes (fresh start)
docker-compose -f docker-compose.python.yml down -v

# Check service status
docker-compose -f docker-compose.python.yml ps
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Login

### Documents
- `POST /api/documents/` - Upload document
- `GET /api/documents/` - List documents
- `GET /api/documents/{id}` - Get document

### Health
- `GET /` - API info
- `GET /health` - Health check

**Full API docs**: http://localhost:8000/docs

---

## 🎬 Demo Script (For Hackathon)

1. **Show Architecture** (30 sec)
   - "Python FastAPI backend with Neo4j knowledge graph"
   - Open http://localhost:8000/docs

2. **Upload Document** (1 min)
   - Drag PDF to upload
   - Show real-time processing stages
   - "AI extracts entities in background"

3. **Show AI Analysis** (1 min)
   - Click processed document
   - "Gemini identified 3 critical risks"
   - Show compliance issues

4. **Knowledge Graph** (1 min)
   - Navigate to graph view
   - "Auto-generated from document analysis"
   - Click node → Show intelligence panel
   - Click **FILTER: RISKS ONLY**

5. **Show Neo4j** (30 sec)
   - Open http://localhost:7474
   - "Live graph database"
   - Run: `MATCH (n) RETURN n LIMIT 25`

**Total: 4 minutes**

---

## 🏆 Why This Wins

### Technical Depth
- ✅ Production-grade Python AI stack
- ✅ Vector search (cutting-edge)
- ✅ Knowledge graph database
- ✅ Async processing (scalable)
- ✅ Type-safe (Pydantic + TypeScript)

### Innovation
- ✅ Auto-entity extraction
- ✅ Semantic document search
- ✅ Real-time graph updates
- ✅ Multi-modal AI

### Practical Value
- ✅ Solves real industrial problems
- ✅ Scales to 1000s of documents
- ✅ Fast response times
- ✅ Enterprise-ready

---

## 📚 Documentation

- **[PYTHON-BACKEND-README.md](./PYTHON-BACKEND-README.md)** - Backend details
- **[PYTHON-MIGRATION-COMPLETE.md](./PYTHON-MIGRATION-COMPLETE.md)** - Migration guide
- **[GRAPH-DEMO-GUIDE.md](./GRAPH-DEMO-GUIDE.md)** - Graph demo script
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues

---

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Python FastAPI backend
- ✅ AI document analysis
- ✅ Vector search
- ✅ Knowledge graph
- ✅ 2D Blueprint visualization

### Phase 2 (Post-Hackathon)
- [ ] Celery for heavy processing
- [ ] WebSocket real-time updates
- [ ] Advanced graph queries
- [ ] Semantic search UI
- [ ] Export reports (PDF, Excel)

### Phase 3 (Production)
- [ ] Multi-tenant architecture
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Enterprise connectors (SharePoint, Maximo)
- [ ] Blockchain audit trail

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is private and proprietary.

---

## 👥 Team

Built for Vizag Hackathon 2024

---

## 🆘 Support

**Issues?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Questions?** Open an issue on GitHub

---

**Built with ❤️ using Python FastAPI, React, and AI**

🚀 **Ready to win the hackathon!**
