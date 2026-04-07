# Knowledge Graph Section Features

## Overview
The Knowledge Graph provides an interactive 2D blueprint visualization of entity relationships extracted from documents using Neo4j graph database and React Flow.

## Key Components

### 1. 2D Blueprint Visualization
- **React Flow Integration**: Professional graph visualization library
- **Auto-layout**: Dagre algorithm for optimal node positioning
- **Node Types**:
  - Document (blue): Uploaded documents
  - Risk (red): Identified risks
  - Person (purple): People mentioned in documents
  - Machine (green): Equipment and machinery
  - Department (amber): Organizational units
- **Edge Types**:
  - MENTIONS: Document mentions entity
  - AFFECTS: Risk affects entity
  - HAS_RISK: Entity has associated risk
  - MANAGES: Person manages entity

### 2. Interactive Controls

#### View Controls
- **Zoom In/Out**: Mouse wheel or buttons
- **Pan**: Click and drag canvas
- **Fit View**: Auto-center and scale to fit all nodes
- **Reset View**: Return to default zoom and position
- **Minimap**: Overview of entire graph (optional)

#### Filter Controls
- **FILTER: RISKS ONLY**: Toggle to show only risk-related nodes
- **Node Type Filter**: Show/hide specific node types
- **Search**: Find nodes by name
- **Highlight Path**: Highlight connections between selected nodes

### 3. Node Intelligence Panel
- **Click to Inspect**: Click any node to view details
- **AI-Generated Insights**:
  - Node summary
  - Related entities
  - Risk assessment
  - Recommended actions
- **Quick Actions**:
  - View source document
  - Edit node properties
  - Delete node (admin only)
  - Export node data

### 4. Graph Statistics
- **Total Nodes**: Count of all entities
- **Total Edges**: Count of all relationships
- **Node Distribution**: Breakdown by type
- **Connectivity**: Average connections per node
- **Isolated Nodes**: Entities with no connections

## Technical Implementation

### Frontend Components
- `KnowledgeGraphView.tsx`: Main graph container
- `KnowledgeGraph3D.tsx`: React Flow implementation
- Custom node components for each entity type
- Custom edge components for relationship types

### Graph Rendering
- **React Flow**: Core visualization library
- **Dagre Layout**: Hierarchical auto-layout algorithm
- **Custom Styling**: Tailwind CSS for node appearance
- **Performance**: Virtual rendering for large graphs (1000+ nodes)

### Data Fetching
- **API Endpoint**: `GET /api/graph/entities`
- **Neo4j Query**: Cypher query to fetch nodes and relationships
- **Caching**: Local cache for graph data
- **Incremental Updates**: Only fetch new/changed nodes

## Neo4j Integration

### Graph Database
- **Neo4j 5.x**: Graph database for relationship storage
- **Cypher Queries**: Graph query language
- **Indexes**: Optimized for fast lookups
- **Constraints**: Unique constraints on node IDs

### Entity Extraction
- **AI-Powered**: Gemini/Mistral extracts entities from documents
- **Entity Types**: Predefined schema for industrial entities
- **Relationship Inference**: AI infers relationships between entities
- **Confidence Scoring**: Each relationship has confidence score

### Graph Operations
- **Create Node**: `MERGE (n:NodeType {id: $id}) SET n.properties = $props`
- **Create Relationship**: `MATCH (a), (b) MERGE (a)-[r:REL_TYPE]->(b)`
- **Query Subgraph**: `MATCH (n)-[r]-(m) WHERE n.id = $id RETURN n, r, m`
- **Delete Node**: `MATCH (n {id: $id}) DETACH DELETE n`

## Graph Features

### Auto-Layout Algorithm
- **Dagre**: Directed graph layout
- **Hierarchical**: Top-to-bottom or left-to-right
- **Node Spacing**: Configurable spacing between nodes
- **Edge Routing**: Smooth bezier curves
- **Collision Detection**: Prevents node overlap

### Node Styling
- **Color Coding**: Each entity type has unique color
- **Size Variation**: Node size based on importance (val property)
- **Icons**: Lucide icons for each node type
- **Labels**: Truncated text with tooltip on hover
- **Glow Effects**: Highlighted nodes have glow effect

### Edge Styling
- **Animated Edges**: Optional animation for active relationships
- **Arrow Markers**: Directional arrows on edges
- **Edge Labels**: Relationship type displayed on hover
- **Color Coding**: Edge color matches relationship type
- **Thickness**: Edge thickness based on strength

### Interaction Features
- **Node Dragging**: Drag nodes to reposition
- **Multi-select**: Shift+click to select multiple nodes
- **Context Menu**: Right-click for node actions
- **Keyboard Shortcuts**:
  - Delete: Remove selected nodes
  - Ctrl+A: Select all
  - Ctrl+F: Focus search
  - Escape: Deselect all

## Risk Visualization

### Risk Nodes
- **High Severity**: Large red nodes with warning icon
- **Medium Severity**: Orange nodes
- **Low Severity**: Yellow nodes
- **Risk Metrics**: Count of affected entities

### Risk Filter Mode
- **Toggle**: Show only risk-related subgraph
- **Affected Entities**: Highlight entities connected to risks
- **Risk Paths**: Show paths from risks to critical assets
- **Risk Heatmap**: Color intensity based on risk severity

## Performance Optimization

### Large Graph Handling
- **Virtual Rendering**: Only render visible nodes
- **Level of Detail**: Simplify distant nodes
- **Clustering**: Group nearby nodes into clusters
- **Lazy Loading**: Load graph in chunks
- **Web Workers**: Offload layout calculation to worker thread

### Caching Strategy
- **Local Storage**: Cache graph data locally
- **Incremental Updates**: Only fetch changed nodes
- **Stale-While-Revalidate**: Show cached data while fetching updates
- **Cache Invalidation**: Clear cache on document upload

## Integration Points

### Backend APIs
- `GET /api/graph/entities` - Fetch all graph entities
- `GET /api/graph/subgraph/{nodeId}` - Fetch subgraph around node
- `POST /api/graph/node` - Create new node
- `PUT /api/graph/node/{id}` - Update node properties
- `DELETE /api/graph/node/{id}` - Delete node
- `POST /api/graph/relationship` - Create relationship

### Neo4j Queries
```cypher
// Fetch all nodes and relationships
MATCH (n)-[r]-(m)
RETURN n, r, m
LIMIT 1000

// Find risk-related subgraph
MATCH (risk:Risk)-[r]-(entity)
RETURN risk, r, entity

// Find shortest path between two nodes
MATCH path = shortestPath((a {id: $id1})-[*]-(b {id: $id2}))
RETURN path
```

## User Experience

### Loading States
- **Skeleton Graph**: Placeholder nodes while loading
- **Progress Indicator**: Loading percentage
- **Streaming**: Nodes appear as they load
- **Error States**: User-friendly error messages

### Responsive Design
- **Mobile**: Touch-friendly controls, simplified view
- **Tablet**: Medium-sized graph with touch gestures
- **Desktop**: Full-featured graph with mouse controls
- **Large Screens**: Expanded view with side panels

### Accessibility
- **Keyboard Navigation**: Tab through nodes
- **Screen Reader**: ARIA labels on all nodes
- **High Contrast**: Option for high contrast mode
- **Focus Indicators**: Visible focus on selected nodes

## Future Enhancements
- **3D Graph View**: Three.js for 3D visualization
- **Time-based Animation**: Show graph evolution over time
- **Graph Comparison**: Compare graphs from different time periods
- **Collaborative Editing**: Multiple users edit graph simultaneously
- **Graph Templates**: Pre-built graph templates for common scenarios
- **Export Options**: Export as PNG, SVG, JSON, GraphML
- **Graph Analytics**: Centrality, clustering coefficient, PageRank
- **AI Recommendations**: Suggest missing relationships
