# K-LENS Technical Features & Technology Stack

## Complete Technical Architecture Documentation

---

## 1. AI & Machine Learning Technologies

### 1.1 Large Language Models (LLMs)

#### Primary: Google Gemini 1.5 Flash
- **Purpose**: Document analysis, summarization, entity extraction
- **API**: Google Generative AI API
- **Model**: gemini-1.5-flash
- **Context Window**: 1 million tokens
- **Speed**: 2-3 seconds per request
- **Cost**: Free tier available (15 requests/minute)
- **Use Cases**:
  - Document summarization
  - Risk identification
  - Compliance checking
  - Entity extraction for knowledge graphs
  - Role-specific insights generation

#### Alternative: Mistral Devstral (via OpenRouter)
- **Purpose**: Backup LLM for text generation
- **API**: OpenRouter API
- **Model**: mistralai/devstral-2512:free
- **Context Window**: 32K tokens
- **Speed**: 3-5 seconds per request
- **Cost**: Free tier available
- **Use Cases**:
  - Code-focused analysis
  - Technical document processing
  - Fallback when Gemini unavailable

### 1.2 Embeddings & Vector Search

#### Sentence Transformers (all-mpnet-base-v2)
- **Purpose**: Generate semantic embeddings for documents
- **Library**: sentence-transformers
- **Model**: all-mpnet-base-v2
- **Dimensions**: 768
- **Technology**: PyTorch-based transformer model
- **Performance**: ~420MB model size, loads in 10-30 seconds (first time)
- **Caching**: Model cached in memory after first load
- **Use Cases**:
  - Semantic document search
  - Document similarity
  - Clustering and classification
  - RAG (Retrieval-Augmented Generation)

#### PostgreSQL pgvector Extension
- **Purpose**: Store and query vector embeddings
- **Technology**: PostgreSQL extension for vector operations
- **Similarity Metric**: Cosine similarity (<=>)
- **Indexing**: IVFFlat index for fast approximate search
- **Query Performance**: Sub-100ms for 10K documents
- **Use Cases**:
  - Semantic search
  - Document recommendations
  - Duplicate detection

### 1.3 Optical Character Recognition (OCR)

#### Pytesseract (Tesseract OCR)
- **Purpose**: Extract text from images and scanned PDFs
- **Engine**: Tesseract 5.x
- **Languages**: 16+ languages (English, Hindi, Tamil, etc.)
- **Accuracy**: 95%+ for clear text, 80%+ for handwritten
- **Preprocessing**:
  - Deskewing
  - Noise reduction
  - Contrast enhancement
  - Binarization
- **Performance**: 5-15 seconds per page
- **Use Cases**:
  - Scanned document processing
  - Image-based document extraction
  - Handwritten note digitization

#### PyMuPDF (fitz)
- **Purpose**: Fast PDF text extraction
- **Performance**: 10x faster than PyPDF2
- **Features**:
  - Text extraction
  - Metadata extraction
  - Page rendering
  - Annotation support
- **Use Cases**:
  - Digital PDF processing
  - Metadata extraction
  - PDF manipulation

---

## 2. Voice & Speech Technologies

### 2.1 Speech Recognition

#### Web Speech API (Browser-native)
- **Purpose**: Voice-to-text conversion
- **Technology**: Browser-native speech recognition
- **Supported Browsers**: Chrome, Edge, Safari (limited)
- **Languages**: English (US) primary, 16+ languages
- **Accuracy**: ~95% for clear speech
- **Features**:
  - Continuous listening
  - Interim results (real-time transcription)
  - Noise cancellation
  - Accent support
- **Use Cases**:
  - Voice search
  - Voice commands (Emergency Voice Mode)
  - AI chat voice input
  - Hands-free operation

### 2.2 Text-to-Speech

#### Web Speech Synthesis API
- **Purpose**: Text-to-voice conversion
- **Technology**: Browser-native TTS
- **Voices**: System voices (varies by OS)
- **Languages**: 50+ languages
- **Features**:
  - Rate control (speed)
  - Pitch control
  - Volume control
  - Voice selection
- **Use Cases**:
  - Voice feedback for commands
  - Emergency alerts
  - Accessibility (screen reader alternative)

### 2.3 Audio Generation

#### Web Audio API
- **Purpose**: Generate alarm sounds programmatically
- **Technology**: Browser-native audio synthesis
- **Features**:
  - Oscillator nodes (sine, square, sawtooth, triangle)
  - Frequency modulation
  - Gain control
  - Audio routing
- **Use Cases**:
  - Evacuation alarm siren
  - Notification sounds
  - Audio feedback

---

## 3. Data Extraction & Processing

### 3.1 Document Processing Pipeline

#### Stage 1: Upload & Storage
- **Technology**: AWS S3 (or compatible)
- **Format**: Multipart/form-data
- **Validation**: MIME type, file size, extension
- **Storage Path**: `{year}/{month}/{filename}`
- **Encryption**: Server-side encryption (SSE-S3)

#### Stage 2: OCR Extraction
- **Technology**: Pytesseract + PyMuPDF
- **Process**:
  1. Detect if PDF is digital or scanned
  2. Digital: Use PyMuPDF for fast extraction
  3. Scanned: Use Tesseract OCR
  4. Combine results
- **Output**: Plain text
- **Duration**: 5-15 seconds per page

#### Stage 3: AI Analysis
- **Technology**: Gemini 1.5 Flash / Mistral Devstral
- **Process**:
  1. Send text to LLM with analysis prompt
  2. Extract summary, risks, compliance issues
  3. Generate role-specific insights
  4. Parse JSON response
- **Output**: Structured JSON
- **Duration**: 10-20 seconds

#### Stage 4: Embedding Generation
- **Technology**: sentence-transformers
- **Process**:
  1. Chunk text into 8000-character segments
  2. Generate 768-dim embedding per chunk
  3. Store in PostgreSQL with pgvector
- **Output**: Vector embeddings
- **Duration**: 2-5 seconds

#### Stage 5: Graph Entity Extraction
- **Technology**: Gemini AI + Neo4j
- **Process**:
  1. LLM extracts entities (people, machines, risks)
  2. LLM infers relationships
  3. Create nodes and edges in Neo4j
- **Output**: Knowledge graph
- **Duration**: 5-10 seconds

### 3.2 Metadata Extraction
- **File Metadata**: Size, type, creation date
- **Document Metadata**: Author, title, subject, keywords
- **Content Metadata**: Page count, word count, language
- **Custom Metadata**: Department, category, tags

---

## 4. Search Technologies

### 4.1 Semantic Search (Vector-based)
- **Technology**: PostgreSQL pgvector + sentence-transformers
- **Process**:
  1. Convert query to 768-dim embedding
  2. Calculate cosine similarity with document embeddings
  3. Rank by similarity score
  4. Return top K results
- **Query**: `SELECT *, embedding <=> $query_embedding AS distance FROM knowledge_hub ORDER BY distance LIMIT 10`
- **Performance**: ~50-100ms for 10K documents
- **Accuracy**: High for conceptual queries

### 4.2 Keyword Search (Full-text)
- **Technology**: PostgreSQL full-text search (FTS)
- **Features**:
  - Stemming (e.g., "running" → "run")
  - Stop word removal
  - Phrase matching
  - Wildcard support
  - Ranking (ts_rank)
- **Query**: `SELECT *, ts_rank(to_tsvector(content), plainto_tsquery($query)) AS rank FROM knowledge_hub WHERE to_tsvector(content) @@ plainto_tsquery($query) ORDER BY rank DESC`
- **Performance**: ~10-50ms
- **Accuracy**: High for exact term matching

### 4.3 Hybrid Search
- **Technology**: Combination of semantic + keyword
- **Weighting**: 70% semantic + 30% keyword
- **Process**:
  1. Run semantic search
  2. Run keyword search
  3. Merge results with weighted scoring
  4. Deduplicate
  5. Re-rank by combined score
- **Performance**: ~100-150ms
- **Accuracy**: Best of both worlds

---

## 5. Knowledge Graph & Memory

### 5.1 Neo4j Graph Database
- **Purpose**: Store entity relationships
- **Version**: Neo4j 5.x
- **Query Language**: Cypher
- **Node Types**:
  - Document
  - Risk
  - Person
  - Machine
  - Department
- **Relationship Types**:
  - MENTIONS
  - AFFECTS
  - HAS_RISK
  - MANAGES
  - CONTAINS
- **Indexing**: Indexes on node IDs and names
- **Performance**: Sub-100ms for subgraph queries

### 5.2 Knowledge Attrition Prevention
- **Technology**: Neo4j + User-Asset relationships
- **Features**:
  - Track who manages what equipment
  - Identify orphaned assets (single point of failure)
  - Silent handover planning
  - Dependency graph visualization
- **Use Cases**:
  - Succession planning
  - Knowledge transfer
  - Risk mitigation

### 5.3 RAG (Retrieval-Augmented Generation)
- **Purpose**: Provide context-aware AI responses
- **Technology**: pgvector + Gemini/Mistral
- **Process**:
  1. User asks question
  2. Convert question to embedding
  3. Search knowledge_hub for relevant documents
  4. Inject top 3 documents into LLM prompt
  5. LLM generates answer using context
  6. Cite source documents
- **Context Window**: 8000 tokens
- **Accuracy**: High for document-specific questions

---

## 6. Authentication & Authorization

### 6.1 Authentication Technologies

#### JWT (JSON Web Tokens)
- **Purpose**: Stateless authentication
- **Library**: PyJWT (Python), jose (JavaScript)
- **Algorithm**: HS256 (HMAC-SHA256)
- **Expiration**: 24 hours (access token), 7 days (refresh token)
- **Claims**: user_id, email, role, exp, iat
- **Storage**: httpOnly cookies (secure)

#### Bcrypt Password Hashing
- **Purpose**: Secure password storage
- **Library**: bcrypt
- **Rounds**: 12 (2^12 iterations)
- **Salt**: Unique per password
- **Verification**: Constant-time comparison

#### Supabase Auth (Optional)
- **Purpose**: Alternative authentication provider
- **Features**:
  - Email/password
  - OAuth (Google, GitHub, etc.)
  - Magic links
  - Phone authentication
- **Integration**: Supabase client library

### 6.2 Authorization (RBAC)

#### Role-Based Access Control
- **Roles**: ADMIN, MANAGER, ENGINEER, SAFETY_OFFICER, OPERATOR
- **Permissions**: 50+ granular permissions
- **Categories**: Documents, Users, System, Security, Compliance
- **Enforcement**:
  - Frontend: Hide unauthorized UI elements
  - Backend: Middleware validates permissions
  - Database: Row-level security (RLS)

#### Permission System
- **Storage**: PostgreSQL (role_permissions table)
- **Caching**: Redis cache for fast lookups
- **Validation**: Decorator-based permission checks
- **Hierarchy**: Admin has all permissions

---

## 7. Real-time Communication

### 7.1 WebSocket Technology
- **Purpose**: Real-time bidirectional communication
- **Library**: FastAPI WebSocket support
- **Protocol**: WebSocket (ws:// or wss://)
- **Use Cases**:
  - Live document processing updates
  - Team presence notifications
  - Alert broadcasting
  - Chat messages

### 7.2 Server-Sent Events (SSE)
- **Purpose**: Server-to-client streaming
- **Use Cases**:
  - Progress updates
  - Live logs
  - Notification streams

---

## 8. Database Technologies

### 8.1 PostgreSQL (Primary Database)
- **Version**: 16.x
- **Extensions**:
  - pgvector: Vector similarity search
  - pg_trgm: Trigram similarity
  - uuid-ossp: UUID generation
- **Tables**:
  - users, user_profiles
  - documents, document_versions
  - knowledge_hub (with vector embeddings)
  - audit_logs, approvals
  - roles, permissions, role_permissions
- **Performance**:
  - Connection pooling (SQLAlchemy)
  - Indexes on frequently queried columns
  - Materialized views for analytics

### 8.2 Redis (Cache & Queue)
- **Purpose**: Caching and task queue
- **Use Cases**:
  - Session storage
  - API response caching
  - Rate limiting
  - Celery task queue
- **Data Structures**: Strings, hashes, lists, sets, sorted sets
- **Expiration**: TTL-based cache invalidation

### 8.3 Neo4j (Graph Database)
- **Purpose**: Knowledge graph storage
- **Version**: 5.x
- **Use Cases**:
  - Entity relationships
  - Knowledge graph visualization
  - Dependency tracking
  - Path finding

### 8.4 Supabase (Optional Backend)
- **Purpose**: Alternative backend-as-a-service
- **Features**:
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Storage (S3-compatible)
  - Row-level security (RLS)

---

## 9. Frontend Technologies

### 9.1 Core Framework
- **React 18**: Component-based UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server

### 9.2 UI Libraries
- **shadcn/ui**: Accessible component library
- **Radix UI**: Unstyled accessible primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library

### 9.3 Data Fetching
- **TanStack Query**: Data fetching and caching
- **Axios**: HTTP client
- **WebSocket**: Real-time communication

### 9.4 Visualization
- **Recharts**: Chart library (line, bar, pie, area)
- **React Flow**: Graph visualization (knowledge graph)
- **Dagre**: Graph layout algorithm

### 9.5 State Management
- **React Context**: Global state (auth, theme, language)
- **Local State**: Component-level state (useState, useReducer)
- **TanStack Query**: Server state caching

---

## 10. Backend Technologies

### 10.1 Core Framework
- **FastAPI**: Modern async Python web framework
- **Python 3.11+**: Programming language
- **Uvicorn**: ASGI server

### 10.2 Database ORM
- **SQLAlchemy**: SQL toolkit and ORM
- **Alembic**: Database migrations
- **Asyncpg**: Async PostgreSQL driver

### 10.3 Background Tasks
- **Celery**: Distributed task queue
- **Redis**: Message broker
- **Flower**: Celery monitoring

### 10.4 API Documentation
- **OpenAPI**: API specification
- **Swagger UI**: Interactive API docs
- **ReDoc**: Alternative API docs

---

## 11. Infrastructure & DevOps

### 11.1 Containerization
- **Docker**: Container platform
- **Docker Compose**: Multi-container orchestration
- **Dockerfile**: Container definitions

### 11.2 Reverse Proxy
- **Nginx**: HTTP server and reverse proxy
- **Features**:
  - Load balancing
  - SSL termination
  - Static file serving
  - Gzip compression

### 11.3 Cloud Services
- **AWS S3**: Object storage for documents
- **CloudFront**: CDN for static assets
- **Route 53**: DNS management
- **EC2**: Virtual servers (optional)

### 11.4 Monitoring & Logging
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **ELK Stack**: Elasticsearch, Logstash, Kibana (logs)
- **Sentry**: Error tracking

---

## 12. Security Technologies

### 12.1 Encryption
- **HTTPS/TLS 1.3**: Transport encryption
- **AES-256**: Data-at-rest encryption
- **Bcrypt**: Password hashing
- **JWT**: Token-based authentication

### 12.2 Security Headers
- **CORS**: Cross-Origin Resource Sharing
- **CSP**: Content Security Policy
- **HSTS**: HTTP Strict Transport Security
- **X-Frame-Options**: Clickjacking protection

### 12.3 Rate Limiting
- **Redis-based**: Token bucket algorithm
- **Limits**: 100 requests/minute per user
- **Endpoints**: All API endpoints

### 12.4 Input Validation
- **Pydantic**: Request validation (backend)
- **Zod**: Schema validation (frontend)
- **Sanitization**: HTML/SQL injection prevention

---

## 13. Testing Technologies

### 13.1 Backend Testing
- **Pytest**: Python testing framework
- **Coverage.py**: Code coverage
- **Factory Boy**: Test data generation
- **Faker**: Fake data generation

### 13.2 Frontend Testing
- **Vitest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **MSW**: API mocking

---

## 14. Performance Optimization

### 14.1 Frontend
- **Code Splitting**: Dynamic imports
- **Lazy Loading**: Load on demand
- **Memoization**: React.memo, useMemo
- **Virtual Scrolling**: Render only visible items
- **Image Optimization**: WebP, lazy loading

### 14.2 Backend
- **Connection Pooling**: Reuse database connections
- **Query Optimization**: Indexes, efficient queries
- **Caching**: Redis for frequent queries
- **Async Processing**: Non-blocking I/O
- **Load Balancing**: Distribute traffic

---

## 15. Compliance & Audit

### 15.1 Audit Logging
- **Technology**: PostgreSQL + Blockchain-style hashing
- **Features**:
  - Immutable logs
  - Cryptographic hashing (SHA-256)
  - Tamper detection
  - User attribution

### 15.2 Compliance Standards
- **ISO 9001:2015**: Quality management
- **OSHA 1910**: Occupational safety
- **Factory Act 1948**: Indian labor law
- **ISO 14001**: Environmental management
- **GDPR**: Data privacy (EU)

---

## Technology Summary

| Category | Technology | Purpose |
|----------|-----------|---------|
| **AI/ML** | Gemini 1.5 Flash | Document analysis, summarization |
| **AI/ML** | Mistral Devstral | Alternative LLM |
| **AI/ML** | sentence-transformers | Semantic embeddings |
| **AI/ML** | Pytesseract | OCR text extraction |
| **Voice** | Web Speech API | Voice-to-text |
| **Voice** | Web Speech Synthesis | Text-to-speech |
| **Voice** | Web Audio API | Audio generation |
| **Search** | pgvector | Vector similarity search |
| **Search** | PostgreSQL FTS | Full-text search |
| **Graph** | Neo4j | Knowledge graph |
| **Database** | PostgreSQL 16 | Primary database |
| **Database** | Redis | Cache & queue |
| **Auth** | JWT | Authentication |
| **Auth** | Bcrypt | Password hashing |
| **Frontend** | React 18 | UI framework |
| **Frontend** | TypeScript | Type safety |
| **Frontend** | Tailwind CSS | Styling |
| **Frontend** | React Flow | Graph visualization |
| **Backend** | FastAPI | API framework |
| **Backend** | Python 3.11+ | Programming language |
| **Backend** | SQLAlchemy | ORM |
| **Backend** | Celery | Background tasks |
| **Infrastructure** | Docker | Containerization |
| **Infrastructure** | Nginx | Reverse proxy |
| **Infrastructure** | AWS S3 | Object storage |
| **Security** | HTTPS/TLS | Encryption |
| **Security** | CORS | Cross-origin security |

---

**Total Technologies Used**: 40+

**Key Differentiators**:
1. **Hybrid AI**: Multiple LLMs for redundancy
2. **Advanced Search**: Semantic + keyword hybrid
3. **Voice Integration**: Hands-free operation
4. **Knowledge Graph**: Neo4j for relationships
5. **Real-time**: WebSocket for live updates
6. **Security**: Multi-layer security (JWT, RBAC, encryption)
7. **Scalability**: Async processing, caching, load balancing
