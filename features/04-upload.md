# Upload Section Features

## Overview
The Upload section provides a comprehensive document ingestion system with drag-and-drop interface, enterprise integrations, and AI-powered processing pipeline.

## Key Components

### 1. Drag & Drop Dropzone
- **Visual Design**: Large, prominent upload area with hover effects
- **Drag Events**: Visual feedback on drag over
- **File Selection**: Click to browse alternative
- **Supported Formats**:
  - PDF (Portable Document Format)
  - DOCX (Microsoft Word)
  - XLSX (Microsoft Excel)
  - PNG, JPG (Images with OCR)
- **File Size Limit**: 50MB per file
- **Multi-file Upload**: Upload multiple files simultaneously

### 2. Enterprise Integrations

#### SharePoint Connector
- **Authentication**: OAuth 2.0 with Microsoft
- **Features**:
  - Browse SharePoint libraries
  - Select documents for import
  - Automatic metadata extraction
  - Scheduled sync (daily/weekly)
- **Status**: Requires enterprise credentials

#### Outlook Connector
- **Email Attachments**: Import attachments from emails
- **Filters**:
  - Date range
  - Sender
  - Subject keywords
- **Auto-import**: Rules-based automatic import
- **Status**: Requires Microsoft 365 account

#### WhatsApp Connector
- **Business API**: WhatsApp Business API integration
- **Features**:
  - Import shared documents
  - Media files (images, PDFs)
  - Group chat documents
- **Status**: Requires WhatsApp Business account

#### Maximo Connector
- **IBM Maximo Integration**: Asset management system
- **Features**:
  - Work order documents
  - Asset specifications
  - Maintenance records
- **Status**: Requires Maximo credentials

### 3. Recent Uploads Widget
- **Upload History**: Last 10 uploaded documents
- **Information Display**:
  - Filename
  - File size
  - Upload timestamp
  - Processing status
- **Status Indicators**:
  - Complete (green checkmark)
  - Processing (spinner)
  - Failed (red X)
- **Quick Actions**:
  - Remove from list
  - Retry failed upload
  - View in library

### 4. AI Processing Pipeline

#### Stage 1: OCR Extraction
- **Technology**: Pytesseract (Tesseract OCR engine)
- **Languages**: 16+ languages supported
- **Image Preprocessing**:
  - Deskewing
  - Noise reduction
  - Contrast enhancement
- **Output**: Plain text extraction
- **Duration**: 5-15 seconds per page

#### Stage 2: Gemini Analysis
- **AI Model**: Google Gemini 1.5 Flash (or Mistral Devstral via OpenRouter)
- **Analysis Tasks**:
  - Document summarization
  - Risk identification
  - Compliance checking (Factory Act 1948, ISO standards)
  - Entity extraction
- **Output**: Structured JSON with insights
- **Duration**: 10-20 seconds

#### Stage 3: Compliance Audit
- **Regulatory Checks**:
  - Factory Act 1948 compliance
  - OSHA 1910 standards
  - ISO 9001:2015
  - ISO 14001 (Environmental)
- **Risk Assessment**: High/Medium/Low severity
- **Action Items**: Extracted compliance tasks
- **Duration**: 5-10 seconds

#### Stage 4: Graph Linking
- **Neo4j Integration**: Create knowledge graph nodes
- **Entity Types**:
  - Documents
  - Risks
  - People (mentioned in document)
  - Machines/Equipment
  - Departments
- **Relationships**:
  - MENTIONS
  - AFFECTS
  - HAS_RISK
  - MANAGES
- **Duration**: 2-5 seconds

#### Stage 5: Complete
- **Vector Embedding**: Generate 768-dim embedding
- **Database Storage**: Save to knowledge_hub table
- **Notification**: User notified of completion
- **Indexing**: Full-text search index updated

### 5. Processing Status Display
- **Real-time Updates**: WebSocket-based live updates
- **Progress Bar**: Visual progress indicator
- **Stage Indicators**: Current stage highlighted
- **Error Handling**: Detailed error messages on failure
- **Retry Mechanism**: Automatic retry on transient errors

## Technical Implementation

### Frontend Components
- `UploadView.tsx`: Main upload interface
- `DocumentProcessor.tsx`: Upload and processing logic
- `EnterpriseConnectors.tsx`: External system integrations

### Upload Flow
1. **File Selection**: User selects files via drag-and-drop or file picker
2. **Validation**: Check file type, size, and permissions
3. **Upload**: POST to `/api/documents/` with multipart/form-data
4. **Processing**: Backend triggers async processing pipeline
5. **Status Updates**: WebSocket sends real-time progress
6. **Completion**: Document appears in library

### Backend Processing
- **FastAPI Endpoint**: `POST /api/documents/`
- **File Storage**: S3 bucket (klens-documents)
- **Background Tasks**: Celery for async processing
- **Queue**: Redis-based task queue
- **Workers**: Multiple workers for parallel processing

### Permission System
- **DOC_UPLOAD Permission**: Required to access upload page
- **Role Check**: Frontend validates user role
- **Access Denied UI**: Informative error message with role display
- **Allowed Roles**: ADMIN, ENGINEER

## Security Features

### File Validation
- **MIME Type Check**: Verify actual file type
- **Magic Number Validation**: Check file headers
- **Virus Scanning**: ClamAV integration (optional)
- **Size Limits**: Enforce 50MB limit
- **Extension Whitelist**: Only allowed extensions

### Upload Security
- **CSRF Protection**: Token-based CSRF prevention
- **Rate Limiting**: Max 10 uploads per minute
- **Authentication**: JWT token required
- **Authorization**: Role-based access control
- **Audit Logging**: All uploads logged

### Data Privacy
- **Encryption in Transit**: HTTPS/TLS 1.3
- **Encryption at Rest**: S3 server-side encryption
- **PII Detection**: Automatic PII masking
- **Data Retention**: Configurable retention policies
- **GDPR Compliance**: Right to deletion

## Integration Points

### Backend APIs
- `POST /api/documents/` - Upload document
- `GET /api/documents/status/{id}` - Check processing status
- `POST /api/integrations/sharepoint/connect` - Connect SharePoint
- `POST /api/integrations/outlook/import` - Import from Outlook
- `POST /api/integrations/whatsapp/sync` - Sync WhatsApp docs
- `POST /api/integrations/maximo/fetch` - Fetch Maximo records

### External Services
- **AWS S3**: Document storage
- **Google Gemini API**: AI analysis
- **OpenRouter API**: Alternative LLM
- **Tesseract OCR**: Text extraction
- **Neo4j**: Knowledge graph
- **Redis**: Task queue

## User Experience

### Loading States
- **Upload Progress**: Percentage and speed display
- **Processing Stages**: Visual pipeline with current stage
- **Estimated Time**: Time remaining calculation
- **Cancel Button**: Abort upload in progress

### Error Handling
- **Network Errors**: Retry with exponential backoff
- **File Errors**: Clear error messages (e.g., "File too large")
- **Processing Errors**: Detailed error logs for debugging
- **Fallback**: Graceful degradation on service failure

### Accessibility
- **Keyboard Upload**: Spacebar/Enter to trigger file picker
- **Screen Reader**: ARIA labels on all elements
- **Focus Management**: Logical tab order
- **Error Announcements**: Screen reader alerts on errors

## Performance Optimization

### Frontend
- **Chunked Upload**: Large files uploaded in chunks
- **Parallel Uploads**: Multiple files uploaded concurrently
- **Progress Streaming**: Real-time progress updates
- **Compression**: Client-side compression before upload

### Backend
- **Async Processing**: Non-blocking upload handling
- **Worker Scaling**: Auto-scale workers based on queue depth
- **Caching**: Cache OCR results for duplicate files
- **Database Pooling**: Connection pooling for efficiency

## Future Enhancements
- **Batch Upload**: Upload entire folders
- **Resume Upload**: Resume interrupted uploads
- **Duplicate Detection**: Warn before uploading duplicates
- **Auto-tagging**: AI-based automatic tagging
- **Version Control**: Track document versions
- **Collaborative Upload**: Multiple users upload to shared folder
- **Mobile Upload**: Camera capture for mobile devices
- **Email-to-Upload**: Email documents to upload address
