# Graph Report - .  (2026-04-23)

## Corpus Check
- 193 files · ~122,153 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1288 nodes · 2582 edges · 66 communities detected
- Extraction: 73% EXTRACTED · 27% INFERRED · 0% AMBIGUOUS · INFERRED: 695 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]

## God Nodes (most connected - your core abstractions)
1. `IndustrialUser` - 187 edges
2. `StrictBaseModel` - 62 edges
3. `ApiClient` - 47 edges
4. `UserProfile` - 40 edges
5. `ShiftStatus` - 37 edges
6. `EmergencySOSLog` - 37 edges
7. `ShiftHandover` - 37 edges
8. `SupabaseService` - 31 edges
9. `User` - 30 edges
10. `Approval` - 29 edges

## Surprising Connections (you probably didn't know these)
- `Extract client IP from request headers` --uses--> `IndustrialUser`  [INFERRED]
  F:\All\CORDING\KLENS-V2\KLENS\backend-python\app\api\audit.py → F:\All\CORDING\KLENS-V2\KLENS\backend-python\app\dependencies\auth.py
- `Create a new audit log entry.     Called automatically by frontend when user pe` --uses--> `IndustrialUser`  [INFERRED]
  F:\All\CORDING\KLENS-V2\KLENS\backend-python\app\api\audit.py → F:\All\CORDING\KLENS-V2\KLENS\backend-python\app\dependencies\auth.py
- `Get audit logs with filtering.     Supports pagination, filtering by action/cat` --uses--> `IndustrialUser`  [INFERRED]
  F:\All\CORDING\KLENS-V2\KLENS\backend-python\app\api\audit.py → F:\All\CORDING\KLENS-V2\KLENS\backend-python\app\dependencies\auth.py
- `Get audit statistics for dashboard.` --uses--> `IndustrialUser`  [INFERRED]
  F:\All\CORDING\KLENS-V2\KLENS\backend-python\app\api\audit.py → F:\All\CORDING\KLENS-V2\KLENS\backend-python\app\dependencies\auth.py
- `Get recent security-related audit logs (CRITICAL and ERROR severity).` --uses--> `IndustrialUser`  [INFERRED]
  F:\All\CORDING\KLENS-V2\KLENS\backend-python\app\api\audit.py → F:\All\CORDING\KLENS-V2\KLENS\backend-python\app\dependencies\auth.py

## Hyperedges (group relationships)
- **Data & Storage Layer** —  [INFERRED]
- **AI & LLM Services** —  [INFERRED]
- **Infrastructure & DevOps** —  [INFERRED]
- **Frontend Feature Set** —  [INFERRED]
- **Document Intelligence Pipeline** —  [INFERRED]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (114): ChatMessage, ChatRequest, ChatResponse, format_context_for_prompt(), generate_ai_response(), Chat request with strict validation, Retrieve relevant documents from knowledge_hub for RAG., Format retrieved documents into context for the AI prompt. (+106 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (113): IndustrialUser, User with industrial context for route handlers., BaseModel, complete_handover(), compute_time_remaining(), Config, EmergencySOSRequest, EmergencySOSResponse (+105 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (72): Audit Logging, FastAPI Backend, Chat Interface, Operational Dashboard, Docker Compose, Document AI Analysis, Document Processing Pipeline, Vector Embeddings (+64 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (62): Approval, ApprovalStatus, Nuclear Keys approval system - multi-signature approval for critical actions., ApprovalCreate, ApprovalResponse, ApprovalVote, approve_action(), ApproverInfo (+54 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (44): Authentication & RBAC, AuthProvider(), transformIndustrialContext(), transformUser(), useAuth(), DigitalBadgeHeader(), DocumentLibrary(), Shift Handover Workflow (+36 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (48): check_cinderella_access(), CinderellaGrantRequest, CinderellaResponse, get_current_user(), get_optional_user(), grant_cinderella_access(), login(), normalize_role() (+40 more)

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (32): HandoverService, Calculate risk level based on orphaned assets and expertise.         Returns: ', Generates "Legacy Pack" reports for departing employees.     Captures tacit kno, Generate a basic report when Gemini is unavailable., Get list of users who are sole managers of critical assets.         Used for sh, Generate a comprehensive handover report for a departing user., Insert a document chunk into knowledge_hub table.                  Args:, Unified Supabase client for:     - Storage: Upload/download PDFs to S3-compatib (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.0
Nodes (11): handleSend(), ApiClient, connectWebSocket(), handleDragOver(), handleDrop(), handleFileUpload(), handleStartUpload(), processFile() (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.0
Nodes (37): fetchAuditLogs(), formatFullTimestamp(), formatTimestamp(), generateMockLogs(), handleExport(), handleApprove(), handleDeleteAttempt(), getSpecIcon() (+29 more)

### Community 9 - "Community 9"
Cohesion: 0.0
Nodes (36): AccessLevel, AccessRules, AccessRulesRequest, Config, Access Rules - Pydantic models for Granular Access Control. Supports 4 access l, Access levels for documents:     - public: Everyone in the company can access, Access rules for document uploads.     These are stored in the metadata JSONB c, Convert access rules to metadata dictionary for storage.         Includes uploa (+28 more)

### Community 10 - "Community 10"
Cohesion: 0.0
Nodes (30): AlertService, Alert Service - Industrial-Grade Notification Engine Handles notification creat, Get count of unread notifications for a user., Mark a notification as read., Manages industrial alert/notification lifecycle:     - Create notifications (IN, Mark all notifications as read for a user., Acknowledge a critical alert. Records who and when.                  Args:, Find CRITICAL alerts that haven't been acknowledged after N minutes.         Us (+22 more)

### Community 11 - "Community 11"
Cohesion: 0.0
Nodes (36): AuditAction, AuditCategory, AuditLogCreate, AuditLogResponse, AuditSeverity, AuditStatsResponse, create_audit_log(), get_audit_logs() (+28 more)

### Community 12 - "Community 12"
Cohesion: 0.0
Nodes (25): GeminiService, AI Service - Uses OpenRouter API with Mistral Devstral (free) for LLM completion, Generate embedding using sentence-transformers (local, no API needed), Generate role-specific AI insights for a document., Hybrid AI service:     - Uses OpenRouter (Mistral Devstral) for text generation, Call OpenRouter API with the given prompt., Analyze document and extract key information, Extract entities and relationships for knowledge graph (+17 more)

### Community 13 - "Community 13"
Cohesion: 0.0
Nodes (13): CertStatus(), ComplianceScorecard(), EfficiencyChart(), KnowledgeGaps(), LiveAnomalyFeed(), formatCurrency(), formatNumber(), formatTimeAgo() (+5 more)

### Community 14 - "Community 14"
Cohesion: 0.0
Nodes (9): ConnectionManager, get_redis(), publish_status_sync(), WebSocket endpoint for real-time document processing status updates. Uses Redis, Manages WebSocket connections for document processing updates., broadcast message to all connections watching this document., Synchronous publish for use in background tasks., WebSocket endpoint for document processing status updates.          Clients co (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.0
Nodes (8): handleClear(), handleKeyDown(), handleKeypadClick(), handleLogout(), handlePinChange(), handleVerify(), handleLogout(), handleNavigateProfile()

### Community 16 - "Community 16"
Cohesion: 0.0
Nodes (9): CertIndicator(), confirmArchive(), fetchData(), getToken(), handleArchive(), handlePromote(), handleRestore(), RoleIcon() (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.0
Nodes (7): clearFilters(), generateRecentSearches(), generateSearchAnalytics(), handleKeyDown(), toggleBookmark(), toggleFavoriteSearch(), toggleResultExpand()

### Community 18 - "Community 18"
Cohesion: 0.0
Nodes (6): get_pomodoro_settings(), get_pomodoro_stats(), PomodoroSettingsResponse, PomodoroStatsResponse, Compatibility endpoint for legacy frontend builds that still request     /api/v, Compatibility endpoint for legacy frontend builds that still request     /api/v

### Community 19 - "Community 19"
Cohesion: 0.0
Nodes (6): clearSearch(), handleClickOutside(), handleLanguageChange(), handleResultClick(), handleSearchKeyDown(), toggleAIChat()

### Community 20 - "Community 20"
Cohesion: 0.0
Nodes (5): Pagination(), PaginationEllipsis(), PaginationLink(), PaginationNext(), PaginationPrevious()

### Community 21 - "Community 21"
Cohesion: 0.0
Nodes (5): canBypassShift(), getRolePermissions(), hasAllPermissions(), hasAnyPermission(), hasPermission()

### Community 22 - "Community 22"
Cohesion: 0.0
Nodes (5): addEmail(), handleAccessLevelChange(), handleDepartmentChange(), handleKeyDown(), removeEmail()

### Community 23 - "Community 23"
Cohesion: 0.0
Nodes (3): Toaster(), ThemeProvider(), useTheme()

### Community 24 - "Community 24"
Cohesion: 0.0
Nodes (4): formatDate(), getStatusStyles(), handleRenew(), handleUpload()

### Community 25 - "Community 25"
Cohesion: 0.0
Nodes (3): formatTimeAgo(), getTaskIcon(), getTaskType()

### Community 26 - "Community 26"
Cohesion: 0.0
Nodes (3): getDueStatusIcon(), getPriorityStyle(), getTaskIcon()

### Community 27 - "Community 27"
Cohesion: 0.0
Nodes (3): generateMockActivityData(), getActivityColor(), getShiftStatusStyle()

### Community 28 - "Community 28"
Cohesion: 0.0
Nodes (3): handleSave(), handleTestVoice(), updatePref()

### Community 29 - "Community 29"
Cohesion: 0.0
Nodes (3): Drawer(), DrawerFooter(), DrawerHeader()

### Community 30 - "Community 30"
Cohesion: 0.0
Nodes (3): cn(), handleKeyDown(), useSidebar()

### Community 31 - "Community 31"
Cohesion: 0.0
Nodes (2): CustomNode(), getNodeSize()

### Community 32 - "Community 32"
Cohesion: 0.0
Nodes (2): getActivityColor(), getActivityIcon()

### Community 33 - "Community 33"
Cohesion: 0.0
Nodes (2): getSafetyScoreColor(), getStatusStyle()

### Community 34 - "Community 34"
Cohesion: 0.0
Nodes (2): handleNavigateProfile(), handleNavigateSettings()

### Community 35 - "Community 35"
Cohesion: 0.0
Nodes (2): handleSetPin(), handleToggleKiosk()

### Community 36 - "Community 36"
Cohesion: 0.0
Nodes (1): AnalyticsLayout()

### Community 37 - "Community 37"
Cohesion: 0.0
Nodes (1): getProgressColor()

### Community 38 - "Community 38"
Cohesion: 0.0
Nodes (1): getSeverityConfig()

### Community 39 - "Community 39"
Cohesion: 0.0
Nodes (1): getTrendIcon()

### Community 40 - "Community 40"
Cohesion: 0.0
Nodes (1): simulateMeltdown()

### Community 41 - "Community 41"
Cohesion: 0.0
Nodes (1): getStatusColor()

### Community 42 - "Community 42"
Cohesion: 0.0
Nodes (1): CustomTooltip()

### Community 43 - "Community 43"
Cohesion: 0.0
Nodes (1): CustomTooltip()

### Community 44 - "Community 44"
Cohesion: 0.0
Nodes (1): handleKeyDown()

### Community 45 - "Community 45"
Cohesion: 0.0
Nodes (1): handleConnect()

### Community 46 - "Community 46"
Cohesion: 0.0
Nodes (1): FeaturesShowcase()

### Community 47 - "Community 47"
Cohesion: 0.0
Nodes (1): KnowledgeGraphView()

### Community 48 - "Community 48"
Cohesion: 0.0
Nodes (1): PlaceholderView()

### Community 49 - "Community 49"
Cohesion: 0.0
Nodes (1): ProfileTabs()

### Community 50 - "Community 50"
Cohesion: 0.0
Nodes (1): ProfileView()

### Community 51 - "Community 51"
Cohesion: 0.0
Nodes (1): SidebarAndHeader()

### Community 52 - "Community 52"
Cohesion: 0.0
Nodes (1): Calendar()

### Community 53 - "Community 53"
Cohesion: 0.0
Nodes (1): useCarousel()

### Community 54 - "Community 54"
Cohesion: 0.0
Nodes (1): useChart()

### Community 55 - "Community 55"
Cohesion: 0.0
Nodes (1): useFormField()

### Community 56 - "Community 56"
Cohesion: 0.0
Nodes (1): useLanguage()

### Community 57 - "Community 57"
Cohesion: 0.0
Nodes (1): useIsMobile()

### Community 58 - "Community 58"
Cohesion: 0.0
Nodes (1): useDashboardStats()

### Community 59 - "Community 59"
Cohesion: 0.0
Nodes (1): useDocumentInsights()

### Community 60 - "Community 60"
Cohesion: 0.0
Nodes (1): useVoiceToText()

### Community 61 - "Community 61"
Cohesion: 0.0
Nodes (1): cn()

### Community 62 - "Community 62"
Cohesion: 0.0
Nodes (1): NotFound()

### Community 63 - "Community 63"
Cohesion: 0.0
Nodes (1): Users()

### Community 75 - "Community 75"
Cohesion: 0.0
Nodes (1): Lazy initialization of Neo4j driver.

### Community 76 - "Community 76"
Cohesion: 0.0
Nodes (1): Lazy initialization of Supabase client.

## Knowledge Gaps
- **138 isolated node(s):** `Generate a random date within the past N days.`, `Seed resolution memory with demo problem resolutions.`, `Seed activity logs showing what users have been working on.`, `Print Cypher commands to run in Neo4j to create user-asset relationships.`, `Seed demo users into Supabase demo_users table.` (+133 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 31`** (4 nodes): `KnowledgeGraph3D.tsx`, `CustomNode()`, `getNodeSize()`, `KnowledgeGraph3D.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (4 nodes): `getActivityColor()`, `getActivityIcon()`, `ActivityFeed.tsx`, `ActivityFeed.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (4 nodes): `TeamStatus.tsx`, `TeamStatus.tsx`, `getSafetyScoreColor()`, `getStatusStyle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (4 nodes): `Index.tsx`, `handleNavigateProfile()`, `handleNavigateSettings()`, `Index.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (4 nodes): `Settings.tsx`, `handleSetPin()`, `handleToggleKiosk()`, `Settings.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (3 nodes): `AnalyticsLayout()`, `AnalyticsLayout.tsx`, `AnalyticsLayout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (3 nodes): `getProgressColor()`, `AuditReadiness.tsx`, `AuditReadiness.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (3 nodes): `IncidentHistory.tsx`, `getSeverityConfig()`, `IncidentHistory.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (3 nodes): `KpiGrid.tsx`, `getTrendIcon()`, `KpiGrid.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (3 nodes): `MissionControl.tsx`, `simulateMeltdown()`, `MissionControl.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (3 nodes): `RiskPulse.tsx`, `getStatusColor()`, `RiskPulse.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (3 nodes): `CustomTooltip()`, `AdoptionCurve.tsx`, `AdoptionCurve.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (3 nodes): `ShiftRadar.tsx`, `CustomTooltip()`, `ShiftRadar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (3 nodes): `handleKeyDown()`, `EmergencyVoiceMode.tsx`, `EmergencyVoiceMode.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (3 nodes): `handleConnect()`, `EnterpriseConnectors.tsx`, `EnterpriseConnectors.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (3 nodes): `FeaturesShowcase.tsx`, `FeaturesShowcase()`, `FeaturesShowcase.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (3 nodes): `KnowledgeGraphView.tsx`, `KnowledgeGraphView()`, `KnowledgeGraphView.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (3 nodes): `PlaceholderView.tsx`, `PlaceholderView()`, `PlaceholderView.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (3 nodes): `ProfileTabs.tsx`, `ProfileTabs()`, `ProfileTabs.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (3 nodes): `ProfileView.tsx`, `ProfileView()`, `ProfileView.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (3 nodes): `SidebarAndHeader.tsx`, `SidebarAndHeader()`, `SidebarAndHeader.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (3 nodes): `Calendar()`, `calendar.tsx`, `calendar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (3 nodes): `useCarousel()`, `carousel.tsx`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (3 nodes): `useChart()`, `chart.tsx`, `chart.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (3 nodes): `form.tsx`, `useFormField()`, `form.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (3 nodes): `LanguageContext.tsx`, `useLanguage()`, `LanguageContext.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (3 nodes): `use-mobile.tsx`, `use-mobile.tsx`, `useIsMobile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (3 nodes): `useDashboardStats.ts`, `useDashboardStats.ts`, `useDashboardStats()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (3 nodes): `useDocumentInsights.ts`, `useDocumentInsights.ts`, `useDocumentInsights()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (3 nodes): `useVoiceToText.ts`, `useVoiceToText.ts`, `useVoiceToText()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (3 nodes): `utils.ts`, `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (3 nodes): `NotFound.tsx`, `NotFound()`, `NotFound.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (3 nodes): `Users.tsx`, `Users.tsx`, `Users()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (1 nodes): `Lazy initialization of Neo4j driver.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (1 nodes): `Lazy initialization of Supabase client.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.