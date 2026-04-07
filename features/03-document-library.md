# Document Library Section Features

## Overview
The Document Library is the central hub for browsing, searching, and managing all documents in the K-LENS system with AI-powered search capabilities.

## Key Components

### 1. Document Grid View
- **Card-Based Layout**: Visual document cards with metadata
- **Document Information**:
  - Filename and original name
  - File type icon (PDF, DOCX, XLSX)
  - Processing status badge
  - Upload date and time
  - Uploader information
- **Status Indicators**:
  - Complete (green): Fully processed
  - Processing (amber): AI analysis in progress
  - Failed (red): Processing error

### 2. Search & Filter System

#### Basic Search
- **Text Search**: Search by filename or content
- **Real-time Results**: Instant filtering as you type
- **Search History**: Recent searches saved locally
- **Clear Button**: Quick reset of search query

#### AI-Powered Search
- **Hybrid Search**: Combines semantic and keyword search
- **Semantic Understanding**: Finds documents by meaning, not just keywords
- **Vector Embeddings**: 768-dimensional embeddings using all-mpnet-base-v2
- **Relevance Scoring**: Results ranked by similarity score
- **Match Type Badges**:
  - Semantic (blue): Vector similarity match
  - Keyword (green): Text-based match

#### Advanced Filters
- **Date Range**: Today, This Week, This Month, All Time
- **Department**: Filter by owning department
- **File Type**: PDF, DOCX, XLSX, TXT
- **Status**: Complete, Processing, Pending
- **Match Type**: Hybrid, Semantic Only, Keyword Only

### 3. Category Tabs
- **All Documents**: Complete document collection
- **Uploaded by Me**: User's own uploads
- **Shared with Me**: Documents shared by others
- **Document Counts**: Real-time count per category

### 4. Knowledge Hub Integration
- **Supabase Backend**: Documents stored in knowledge_hub table
- **Chunked Storage**: Large documents split into searchable chunks
- **Metadata Tracking**:
  - Upload time
  - File size
  - S3 URL for original file
  - Processing status
- **Content Chunks**: Text extracted via OCR for search

### 5. Upload Modal
- **Drag & Drop**: Intuitive file upload interface
- **Multi-file Support**: Upload multiple documents at once
- **Progress Tracking**: Real-time upload progress bars
- **Format Support**: PDF, DOCX, XLSX, PNG, JPG
- **Size Limit**: 50MB per file
- **Enterprise Connectors**: Integration with SharePoint, Outlook, WhatsApp, Maximo

## Technical Implementation

### Frontend Components
- `DocumentLibrary.tsx`: Main library container
- `DocumentProcessor.tsx`: Upload and processing UI
- `EnterpriseConnectors.tsx`: External system integrations
- `DocumentViewer.tsx`: Document preview modal

### Search Technology

#### Vector Search (Semantic)
- **Model**: sentence-transformers/all-mpnet-base-v2
- **Dimensions**: 768
- **Similarity**: Cosine similarity
- **Database**: PostgreSQL with pgvector extension
- **Query**: `SELECT * FROM knowledge_hub ORDER BY embedding <=> query_embedding LIMIT 10`

#### Keyword Search (Full-Text)
- **PostgreSQL FTS**: Full-text search with tsvector
- **Ranking**: ts_rank for relevance scoring
- **Stemming**: English language stemmer
- **Stop Words**: Common words filtered out

#### Hybrid Search
- **Combination**: Merges vector and keyword results
- **Weighted Scoring**: 70% semantic, 30% keyword
- **Deduplication**: Removes duplicate results
- **Final Ranking**: Combined relevance score

### Data Management
- **API Integration**: RESTful endpoints for CRUD operations
- **Caching**: Local storage for recent searches
- **Pagination**: Load more on scroll (infinite scroll)
- **Lazy Loading**: Images loaded on demand

## Search Features

### Search Results Display
- **Result Cards**: Document preview with snippet
- **Highlighted Matches**: Search terms highlighted in content
- **Relevance Score**: Percentage match displayed
- **Match Type Badge**: Semantic vs Keyword indicator
- **Quick Actions**:
  - Open in viewer
  - Download original
  - Share with team
  - Add to favorites

### Search Analytics
- **Search History**: Last 10 searches saved
- **Popular Queries**: Most searched terms
- **Search Performance**: Average response time
- **Result Click-through**: Track which results are opened

## Permission System

### Role-Based Access
- **Admin**: View and manage all documents
- **Manager**: Department-level access
- **Engineer**: Upload and view technical documents
- **Safety Officer**: Safety-related documents only
- **Operator**: Read-only access to operational docs

### Upload Permissions
- **DOC_UPLOAD Permission**: Required to upload files
- **Permission Check**: Frontend validates before showing upload button
- **Error Handling**: Graceful error message if permission denied
- **Role Display**: Shows user's role in error messages

### Document Visibility
- **Row-Level Security (RLS)**: Supabase RLS policies
- **Department Filtering**: Users see only their department's docs
- **Shared Documents**: Explicit sharing mechanism
- **Public Documents**: Marked as accessible to all

## Integration Points

### Backend APIs
- `GET /api/documents/` - List documents with pagination
- `POST /api/documents/` - Upload new document
- `GET /api/documents/{id}` - Get document details
- `DELETE /api/documents/{id}` - Delete document (admin only)
- `POST /api/search/hybrid` - Hybrid search endpoint
- `GET /api/knowledge-hub/documents` - Fetch from knowledge hub

### Database Schema
- **knowledge_hub table**:
  - id (primary key)
  - file_name (text)
  - s3_url (text)
  - content_chunk (text)
  - embedding (vector(768))
  - metadata (jsonb)
  - created_at (timestamp)

### S3 Storage
- **Bucket**: klens-documents
- **Path Structure**: `{year}/{month}/{filename}`
- **Access**: Pre-signed URLs for secure download
- **Retention**: 7-year retention policy

## User Experience

### Loading States
- **Skeleton Screens**: Placeholder cards while loading
- **Progress Indicators**: Spinners for async operations
- **Error States**: User-friendly error messages
- **Empty States**: Helpful messages when no results

### Responsive Design
- **Mobile**: Single column, stacked cards
- **Tablet**: 2-column grid
- **Desktop**: 3-column grid
- **Large Desktop**: 4-column grid

### Accessibility
- **Keyboard Navigation**: Tab through all documents
- **Screen Reader**: ARIA labels on all interactive elements
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant

## Performance Optimization

### Frontend
- **Virtual Scrolling**: Only render visible documents
- **Image Lazy Loading**: Load images on scroll
- **Debounced Search**: 300ms delay before search
- **Memoization**: React.memo for document cards

### Backend
- **Database Indexing**: B-tree and GiST indexes
- **Query Optimization**: Efficient SQL queries
- **Caching**: Redis cache for frequent queries
- **CDN**: CloudFront for static assets

## Future Enhancements
- **Bulk Operations**: Select multiple documents for batch actions
- **Advanced Filters**: Custom filter builder
- **Saved Searches**: Save and reuse complex queries
- **Document Comparison**: Side-by-side document comparison
- **Version History**: Track document revisions
- **Collaborative Annotations**: Team comments on documents
- **OCR Improvements**: Better accuracy for handwritten text
- **Multi-language Search**: Search in multiple languages
