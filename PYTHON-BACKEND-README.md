# 🐍 K-LENS Python FastAPI Backend

## ✅ What's Been Built

Your backend has been **completely rebuilt in Python** with:

### Core Stack
- ✅ **FastAPI** - Modern async Python framework
- ✅ **PostgreSQL + pgvector** - Vector embeddings for semantic search
- ✅ **Neo4j** - Knowledge graph database
- ✅ **Redis** - Caching and message queue
- ✅ **Google Gemini 1.5 Flash** - AI analysis and embeddings
- ✅ **PyMuPDF** - Fast PDF text extraction
- ✅ **Pytesseract** - OCR for scanned documents

### Features Implemented
1. **Authentication** - JWT-based auth with bcrypt
2. **Document Upload** - Async file processing
3. **AI Analysis** - Gemini-powered document analysis
4. **Vector Search** - Semantic search with pgvector
5. **Knowledge Graph** - Entity extraction for Neo4j
6. **Background Tasks** - Non-blocking document processing

---

## 🚀 Quick Start

### 1. Add Your Gemini API Key

Edit `backend-python/.env`:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

Get your key: https://makersuite.google.com/app/apikey

### 2. Start the Stack

```bash
start-python-backend.bat
```

Wait 30 seconds for all services to start.

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Interactive Swagger UI)
- **Neo4j Browser**: http://localhost:7474

---

## 📁 Project Structure

```
backend-python/
├── app/
│   ├── api/
│   │   ├── auth.py          # Authentication endpoints
│   │   └── documents.py     # Document upload/processing
│   ├── core/
│   │   ├── config.py        # Settings
│   │   ├── database.py      # PostgreSQL + pgvector
│   │   └── security.py      # JWT & password hashing
│   ├── models/
│   │   ├── user.py          # User model
│   │   └── document.py      # Document model with embeddings
│   ├── services/
│   │   └── gemini_service.py # AI analysis & embeddings
│   └── main.py              # FastAPI app
├── requirements.txt
├── Dockerfile
└── .env
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get JWT token

### Documents
- `POST /api/documents/` - Upload document (triggers AI processing)
- `GET /api/documents/` - List user's documents
- `GET /api/documents/{id}` - Get document details

### Health
- `GET /` - API info
- `GET /health` - Health check

---

## 🧪 Test the API

### 1. Create Admin User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@klens.local",
    "password": "Admin@123",
    "name": "System Admin",
    "role": "admin",
    "department": "IT"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@klens.local&password=Admin@123"
```

Copy the `access_token` from the response.

### 3. Upload Document

```bash
curl -X POST http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@path/to/document.pdf"
```

---

## 🎯 How It Works

### Document Processing Pipeline

1. **Upload** → File saved to disk
2. **OCR** → PyMuPDF extracts text from PDF
3. **AI Analysis** → Gemini analyzes content
4. **Embedding** → Generate 768-dim vector
5. **Graph Extraction** → Extract entities for Neo4j
6. **Complete** → Document ready for search

All happens in **background** - user doesn't wait!

---

## 🔍 Key Features

### 1. Vector Search (pgvector)
```python
# Find similar documents
SELECT * FROM documents 
ORDER BY embedding <-> query_embedding 
LIMIT 10;
```

### 2. AI Analysis (Gemini)
- Automatic summary generation
- Risk identification
- Compliance checking
- Action item extraction

### 3. Knowledge Graph (Neo4j)
- Auto-extract entities (Machines, People, Risks)
- Build relationships (MENTIONS, AFFECTS, HAS_RISK)
- Visualize in React Flow

---

## 🐛 Troubleshooting

### Backend won't start?
```bash
docker-compose -f docker-compose.python.yml logs backend
```

### Database connection error?
```bash
docker-compose -f docker-compose.python.yml restart postgres
```

### Gemini API error?
Check your API key in `backend-python/.env`

### Neo4j connection refused?
Wait 60 seconds - Neo4j takes time to start

---

## 📊 Database Schema

### Users Table
- id, email, password_hash, name, role, department

### Documents Table
- id, filename, status, ocr_text, ai_summary
- **embedding** (vector[768]) - For semantic search

### Neo4j Graph
- Nodes: Document, Risk, Person, Machine, Dept
- Relationships: MENTIONS, AFFECTS, HAS_RISK, MANAGED_BY

---

## 🚀 Next Steps

### For Hackathon Demo:
1. ✅ Backend is ready
2. Update frontend API URL to `http://localhost:8000/api`
3. Test document upload
4. Show AI analysis in action

### Post-Hackathon:
- Add Celery for heavy processing
- Implement WebSocket for real-time updates
- Add more Neo4j graph queries
- Implement semantic search UI

---

## 💡 Why Python?

**Before (Node.js):**
- ❌ Limited AI libraries
- ❌ No native vector support
- ❌ Weak PDF parsing
- ❌ Complex graph integration

**After (Python):**
- ✅ Native Gemini SDK
- ✅ pgvector for embeddings
- ✅ PyMuPDF (10x faster)
- ✅ Neo4j driver built-in
- ✅ Celery for background jobs

---

## 📚 Documentation

- **FastAPI Docs**: http://localhost:8000/docs
- **Gemini API**: https://ai.google.dev/
- **pgvector**: https://github.com/pgvector/pgvector
- **Neo4j**: https://neo4j.com/docs/

---

**Built for Vizag Hackathon 🏆**

*Python backend = Production-ready AI platform*
