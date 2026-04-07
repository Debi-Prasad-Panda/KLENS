# Search & Discovery Section Features

## Overview
The Search & Discovery section provides an intelligent search hub with semantic search, advanced filters, search analytics, and voice input capabilities.

## Key Components

### 1. Intelligent Search Bar
- **Premium Design**: Gradient glow effects with glassmorphism
- **Search Input**:
  - Large, prominent search field
  - Placeholder: "Ask anything about your documents..."
  - Auto-focus on page load
  - Clear button (X) to reset
- **Voice Input Button**:
  - Microphone icon
  - Real-time voice-to-text
  - Visual feedback during listening
  - Automatic search on voice completion
- **AI Search Button**: Sparkles icon for semantic search
- **Filter Toggle**: Show/hide advanced filters

### 2. Search Types

#### Semantic Search (Vector-based)
- **Technology**: sentence-transformers (all-mpnet-base-v2)
- **Embedding Dimensions**: 768
- **Similarity Metric**: Cosine similarity
- **Query Process**:
  1. Convert query to 768-dim vector
  2. Compare with document embeddings
  3. Rank by similarity score
  4. Return top 10 results
- **Use Cases**: "Find documents about pump maintenance" (understands intent)

#### Keyword Search (Full-text)
- **Technology**: PostgreSQL full-text search
- **Features**:
  - Stemming (e.g., "running" matches "run")
  - Stop word removal
  - Phrase matching
  - Wildcard support
- **Use Cases**: Exact term matching, technical codes

#### Hybrid Search (Combined)
- **Weighting**: 70% semantic + 30% keyword
- **Deduplication**: Remove duplicate results
- **Ranking**: Combined relevance score
- **Best of Both**: Captures both meaning and exact matches

### 3. Advanced Filters Panel

#### Date Range Filter
- **Options**: Today, This Week, This Month, This Year, All Time
- **Custom Range**: Date picker for custom range
- **Relative Dates**: "Last 7 days", "Last 30 days"

#### Department Filter
- **Dropdown**: Select from available departments
- **Multi-select**: Choose multiple departments
- **Department List**: Operations, Engineering, Management, Safety, Other

#### File Type Filter
- **Options**: PDF, DOCX, XLSX, TXT, All Types
- **Icon Display**: File type icons for visual clarity
- **MIME Type Filtering**: Backend filters by MIME type

#### Status Filter
- **Options**: Processed, Processing, Pending, Any Status
- **Color Coding**: Green (processed), Amber (processing), Gray (pending)

#### Match Type Filter
- **Options**: Hybrid (All), Semantic Only, Keyword Only
- **Badge Display**: Results show match type badge
- **Performance**: Semantic is slower but more accurate

### 4. Search Results Display

#### Result Cards
- **Card Layout**: Glassmorphism cards with hover effects
- **Information Displayed**:
  - Document filename
  - Content snippet (first 100 characters)
  - Match type badge (Semantic/Keyword)
  - Relevance score (percentage)
  - Upload date
- **Expandable**: Click to expand full content
- **Quick Actions**:
  - Open in Document Viewer
  - Download original file
  - Bookmark result
  - Share with team

#### Result Metrics
- **Total Results**: Count of matching documents
- **Search Time**: Query execution time
- **Relevance Distribution**: Histogram of scores
- **Match Type Breakdown**: Semantic vs Keyword count

### 5. Search History & Saved Searches

#### Recent Searches
- **Storage**: localStorage (last 10 searches)
- **Display**: List with query, filters, result count, timestamp
- **Quick Replay**: Click to re-run search
- **Clear History**: Button to clear all history

#### Saved Searches (Favorites)
- **Star Icon**: Mark searches as favorites
- **Persistent Storage**: Saved to database
- **Quick Access**: Favorite searches shown at top
- **Naming**: Custom names for saved searches
- **Sharing**: Share saved searches with team

### 6. Search Analytics Dashboard

#### Search Statistics
- **Total Searches**: Lifetime search count
- **Searches Today**: Today's search count
- **Average Results**: Mean results per search
- **Saved Searches**: Count of favorited searches

#### Top Queries
- **Most Searched**: Top 5 most frequent queries
- **Trending**: Queries with increasing frequency
- **Progress Bars**: Visual representation of query popularity

#### Searches by Department
- **Department Breakdown**: Search count per department
- **Bar Chart**: Visual comparison
- **Insights**: Identify most active departments

#### Peak Hours
- **Hourly Heatmap**: Search activity by hour of day
- **Visual**: 24-hour bar chart
- **Insights**: Identify peak usage times

## Voice Search Integration

### Voice-to-Text Technology
- **Web Speech API**: Browser-native speech recognition
- **Supported Browsers**: Chrome, Edge, Safari (limited)
- **Languages**: English (US) primary, 16+ languages supported
- **Accuracy**: ~95% for clear speech

### Voice Search Flow
1. **Activation**: Click microphone button or say "Hey K-LENS"
2. **Listening**: Visual feedback (pulsing animation)
3. **Transcription**: Real-time text display
4. **Confirmation**: User can edit before search
5. **Execution**: Automatic search on completion

### Voice Features
- **Continuous Listening**: Stays active until user stops
- **Noise Cancellation**: Filters background noise
- **Accent Support**: Handles various English accents
- **Error Handling**: Graceful fallback on recognition errors

## Technical Implementation

### Frontend Components
- `SearchDiscoveryView.tsx`: Main search interface
- `useVoiceToText.ts`: Custom hook for voice input
- Search result components
- Filter panel components

### Search API Integration
- **Endpoint**: `POST /api/search/hybrid`
- **Request Body**:
  ```json
  {
    "query": "pump maintenance",
    "limit": 10,
    "filters": {
      "dateRange": "month",
      "department": "Engineering",
      "fileType": "pdf"
    }
  }
  ```
- **Response**:
  ```json
  {
    "results": [
      {
        "id": "doc-123",
        "file_name": "Pump Manual.pdf",
        "content_chunk": "...",
        "score": 0.87,
        "match_type": "vector",
        "s3_url": "https://..."
      }
    ],
    "total": 15,
    "search_time_ms": 234
  }
  ```

### Performance Optimization
- **Debounced Search**: 300ms delay before search
- **Caching**: Cache results for 5 minutes
- **Pagination**: Load 10 results at a time
- **Lazy Loading**: Load more on scroll
- **Index Optimization**: Database indexes on searchable fields

## Integration Points

### Backend APIs
- `POST /api/search/hybrid` - Hybrid search
- `POST /api/search/semantic` - Semantic search only
- `POST /api/search/keyword` - Keyword search only
- `GET /api/search/history` - User's search history
- `POST /api/search/save` - Save search as favorite
- `GET /api/search/analytics` - Search analytics data

### Database Queries
```sql
-- Semantic search
SELECT *, embedding <=> $query_embedding AS distance
FROM knowledge_hub
ORDER BY distance
LIMIT 10;

-- Keyword search
SELECT *, ts_rank(to_tsvector(content_chunk), plainto_tsquery($query)) AS rank
FROM knowledge_hub
WHERE to_tsvector(content_chunk) @@ plainto_tsquery($query)
ORDER BY rank DESC
LIMIT 10;
```

## User Experience

### Loading States
- **Search Spinner**: Animated spinner during search
- **Skeleton Results**: Placeholder cards while loading
- **Progress Bar**: For long-running searches
- **Estimated Time**: "Searching... ~2 seconds"

### Error Handling
- **No Results**: Helpful message with suggestions
- **Network Error**: Retry button with error details
- **Voice Error**: Fallback to text input
- **Timeout**: Cancel long-running searches

### Accessibility
- **Keyboard Shortcuts**:
  - `/` - Focus search bar
  - `Ctrl+K` - Open search
  - `Escape` - Clear search
  - `Enter` - Execute search
- **Screen Reader**: ARIA labels on all elements
- **Focus Management**: Logical tab order
- **Voice Announcements**: Search results announced

## Security & Privacy

### Search Privacy
- **No Logging**: Sensitive searches not logged
- **Encrypted**: Search queries encrypted in transit
- **Access Control**: Users only search accessible documents
- **Audit Trail**: Admin searches logged for compliance

### Data Protection
- **PII Masking**: Personal information masked in results
- **Department Isolation**: Users only see their department's docs
- **Role-Based Results**: Results filtered by user role
- **Secure Embeddings**: Embeddings stored securely

## Future Enhancements
- **Natural Language Queries**: "Show me all safety documents from last month"
- **Query Suggestions**: Auto-complete based on popular searches
- **Search Filters UI**: Visual filter builder
- **Multi-language Search**: Search in multiple languages simultaneously
- **Image Search**: Search by uploading similar images
- **Graph-based Search**: Search using knowledge graph relationships
- **Federated Search**: Search across multiple data sources
- **AI Query Refinement**: AI suggests better search queries
