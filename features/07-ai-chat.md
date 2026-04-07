# AI Chat Section Features

## Overview
The AI Chat sidebar provides an intelligent conversational interface powered by Gemini AI with RAG (Retrieval-Augmented Generation) for document-aware responses.

## Key Components

### 1. Chat Sidebar Interface
- **Slide-in Panel**: 480px wide sidebar from right
- **Fixed Position**: Overlays main content
- **Glassmorphism Design**: Premium glass effect with backdrop blur
- **Close Button**: X button to dismiss sidebar
- **Responsive**: Adapts to mobile screens

### 2. Chat Header
- **AI Avatar**: Gradient icon (primary to success)
- **Title**: "AI Assistant"
- **Subtitle**: "Powered by Gemini"
- **Status Indicator**: Online/offline status

### 3. Quick Actions Panel
- **Action Buttons**:
  - Analyze Document: Upload and analyze
  - Risk Assessment: Identify risks
  - Compliance Check: Verify compliance
  - Summarize: Generate summary
- **Icon-based**: Visual icons for each action
- **One-click**: Pre-filled prompts for common tasks

### 4. Message Display Area

#### Message Types
- **User Messages**: Right-aligned, primary color background
- **AI Messages**: Left-aligned, secondary color background
- **System Messages**: Centered, muted color
- **Error Messages**: Red background with error icon

#### Message Features
- **Markdown Support**: ReactMarkdown with remarkGfm
- **Code Highlighting**: Syntax highlighting for code blocks
- **Link Rendering**: Clickable links
- **Timestamp**: Relative time (e.g., "2 min ago")
- **Avatar**: User/AI avatar for each message

### 5. RAG (Retrieval-Augmented Generation)

#### Knowledge Hub Integration
- **Document Search**: Searches knowledge_hub table
- **Semantic Matching**: Vector similarity search
- **Top-K Retrieval**: Fetches top 3 relevant documents
- **Context Injection**: Injects document content into prompt

#### Source Attribution
- **Source Display**: Shows which documents were used
- **Clickable Links**: Click to open source document
- **File Icons**: Visual file type indicators
- **External Link Icon**: Opens in new tab

#### RAG Flow
1. **User Query**: "What are the safety procedures for Boiler B7?"
2. **Vector Search**: Convert query to embedding, search knowledge_hub
3. **Retrieve Context**: Fetch top 3 relevant document chunks
4. **Augment Prompt**: Inject context into AI prompt
5. **Generate Response**: AI generates answer using context
6. **Cite Sources**: Display source documents below response

### 6. Voice Input Integration
- **Microphone Button**: Click to start voice input
- **Real-time Transcription**: Text appears as you speak
- **Auto-send**: Automatically sends message when done
- **Visual Feedback**: Pulsing animation during listening
- **Error Handling**: Graceful fallback on voice errors

### 7. Message Input Area
- **Text Input**: Multi-line textarea
- **Placeholder**: "Ask me anything..."
- **Voice Button**: Microphone icon for voice input
- **Send Button**: Paper plane icon
- **Character Limit**: 2000 characters
- **Enter to Send**: Press Enter to send (Shift+Enter for new line)

## AI Capabilities

### Document Analysis
- **Summarization**: Generate concise summaries
- **Key Points Extraction**: Bullet-point highlights
- **Entity Recognition**: Identify people, places, equipment
- **Sentiment Analysis**: Detect tone and urgency

### Risk Assessment
- **Risk Identification**: Find potential hazards
- **Severity Scoring**: High/Medium/Low classification
- **Mitigation Suggestions**: Recommended actions
- **Compliance Mapping**: Link to regulations

### Compliance Checking
- **Regulatory Standards**: Factory Act 1948, OSHA, ISO
- **Gap Analysis**: Identify non-compliant areas
- **Action Items**: Generate compliance tasks
- **Audit Readiness**: Prepare for audits

### Question Answering
- **Factual Questions**: "What is the operating temperature?"
- **Procedural Questions**: "How do I perform maintenance?"
- **Comparative Questions**: "Compare Boiler A and Boiler B"
- **Analytical Questions**: "What are the trends in safety incidents?"

## Technical Implementation

### Frontend Components
- `AIChatSidebar.tsx`: Main chat interface
- `useVoiceToText.ts`: Voice input hook
- ReactMarkdown: Markdown rendering
- remarkGfm: GitHub Flavored Markdown support

### Chat API Integration
- **Endpoint**: `POST /api/chat/message`
- **Request Body**:
  ```json
  {
    "message": "What are the safety procedures?",
    "history": [
      {"role": "user", "content": "Hello"},
      {"role": "assistant", "content": "Hi! How can I help?"}
    ]
  }
  ```
- **Response**:
  ```json
  {
    "message": "The safety procedures include...",
    "sources": [
      {
        "file_name": "Safety Manual.pdf",
        "s3_url": "https://...",
        "match_type": "vector"
      }
    ]
  }
  ```

### RAG Implementation
- **Vector Search**: PostgreSQL pgvector extension
- **Embedding Model**: sentence-transformers/all-mpnet-base-v2
- **Context Window**: 8000 tokens
- **Source Limit**: Top 3 most relevant documents
- **Prompt Template**:
  ```
  You are K-LENS AI Assistant. Answer based on these documents:
  
  [Document 1]: {content}
  [Document 2]: {content}
  [Document 3]: {content}
  
  User Question: {query}
  
  Answer:
  ```

### Conversation Management
- **Message History**: Stored in component state
- **Context Preservation**: Last 10 messages sent to AI
- **Session Persistence**: Save to localStorage
- **Clear History**: Button to reset conversation

## AI Models

### Primary: Google Gemini 1.5 Flash
- **Speed**: Fast responses (~2-3 seconds)
- **Context Window**: 1M tokens
- **Capabilities**: Text, code, reasoning
- **Cost**: Free tier available

### Alternative: Mistral Devstral (OpenRouter)
- **Speed**: Moderate (~3-5 seconds)
- **Context Window**: 32K tokens
- **Capabilities**: Code-focused, technical
- **Cost**: Free tier available

### Fallback: Local Model
- **Model**: Llama 2 7B (optional)
- **Speed**: Slower (~10-15 seconds)
- **Privacy**: Fully local, no API calls
- **Requirements**: GPU with 8GB+ VRAM

## User Experience

### Loading States
- **Typing Indicator**: Three dots animation
- **Streaming**: Tokens appear as generated
- **Progress Bar**: For long responses
- **Cancel Button**: Stop generation mid-stream

### Error Handling
- **Network Errors**: Retry with exponential backoff
- **API Errors**: User-friendly error messages
- **Rate Limiting**: Queue messages if rate limited
- **Timeout**: Cancel after 60 seconds

### Accessibility
- **Keyboard Navigation**: Tab through all elements
- **Screen Reader**: ARIA labels on all messages
- **Focus Management**: Focus input after sending
- **Voice Announcements**: New messages announced

## Performance Optimization

### Frontend
- **Virtual Scrolling**: Only render visible messages
- **Lazy Loading**: Load old messages on scroll
- **Debounced Input**: 300ms delay before typing indicator
- **Memoization**: React.memo for message components

### Backend
- **Caching**: Cache RAG results for 5 minutes
- **Connection Pooling**: Reuse database connections
- **Async Processing**: Non-blocking AI calls
- **Rate Limiting**: 10 messages per minute per user

## Security & Privacy

### Data Protection
- **Encryption**: All messages encrypted in transit
- **No Logging**: Sensitive conversations not logged
- **PII Masking**: Personal information masked
- **Access Control**: Users only access their conversations

### Content Filtering
- **Profanity Filter**: Block inappropriate language
- **Injection Prevention**: Sanitize user input
- **Output Validation**: Verify AI responses
- **Abuse Detection**: Flag suspicious patterns

## Integration Points

### Backend APIs
- `POST /api/chat/message` - Send message
- `GET /api/chat/history` - Fetch conversation history
- `DELETE /api/chat/history` - Clear history
- `POST /api/chat/feedback` - Submit feedback on response

### External Services
- **Google Gemini API**: Primary AI model
- **OpenRouter API**: Alternative AI model
- **PostgreSQL**: RAG document storage
- **Redis**: Message queue and caching

## Future Enhancements
- **Multi-modal Input**: Upload images for analysis
- **Voice Output**: Text-to-speech for responses
- **Conversation Branching**: Fork conversations
- **Collaborative Chat**: Multiple users in same chat
- **Chat Templates**: Pre-built conversation starters
- **Export Chat**: Download conversation as PDF/TXT
- **AI Personas**: Different AI personalities (formal, casual, technical)
- **Proactive Suggestions**: AI suggests relevant questions
