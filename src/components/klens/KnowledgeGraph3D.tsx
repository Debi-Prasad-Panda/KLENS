import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  Node,
  Edge,
} from 'reactflow';
import { RotateCw, Database, RefreshCw, Loader2, Search, X } from 'lucide-react';
import 'reactflow/dist/style.css';
import demoData from '../../data/demo-graph.json';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const NODE_DETAILS: Record<string, any> = {
  'Boiler_B7': {
    status: 'CRITICAL FAILURE',
    details: 'Pressure sensor reading 450 PSI (Limit: 300). Variance detected in log #492.',
    action: 'Dispatch Maintenance Team',
    assignee: 'Eng. Rajesh'
  },
  'Safety_Officer': {
    status: 'ON DUTY',
    details: 'Shift Lead, Sector 4. Currently active on radio channel 2.',
    action: 'Send WhatsApp Alert',
    assignee: 'HR Dept'
  },
  'Boiler_B7_Specs': {
    status: 'PROCESSED',
    details: 'Uploaded 10 mins ago. Contains 3 critical warnings regarding valves.',
    action: 'Open Original PDF',
    assignee: 'System'
  }
};

// Enhanced color palette - more vibrant and distinguishable
const NODE_COLORS = {
  Document: { border: '#00d4ff', bg: '#001a24', shadow: '0 0 15px rgba(0,212,255,0.4)' },
  Risk: { border: '#ff1744', bg: '#2a0a0e', shadow: '0 0 20px rgba(255,23,68,0.6)' },
  Person: { border: '#00ff88', bg: '#0a2a1a', shadow: '0 0 15px rgba(0,255,136,0.4)' },
  Machine: { border: '#ffd600', bg: '#2a2400', shadow: '0 0 15px rgba(255,214,0,0.4)' },
  Dept: { border: '#d500f9', bg: '#1a0024', shadow: '0 0 15px rgba(213,0,249,0.4)' },
  Entity: { border: '#64b5f6', bg: '#0d1b2a', shadow: '0 0 10px rgba(100,181,246,0.3)' }
};

const NODE_ICONS = {
  Document: '📄',
  Risk: '⚠️',
  Person: '👤',
  Machine: '⚙️',
  Dept: '🏢',
  Entity: '📦'
};

// Calculate node size based on connections
const getNodeSize = (connections: number) => {
  return Math.max(180, Math.min(280, 180 + connections * 10));
};

const CustomNode = ({ data, selected }: any) => {
  const nodeType = data.type || 'Entity';
  const colors = NODE_COLORS[nodeType] || NODE_COLORS.Entity;
  const icon = NODE_ICONS[nodeType] || NODE_ICONS.Entity;
  const size = data.size || 200;

  return (
    <div
      className={`px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-300 ${
        selected ? 'scale-110 ring-2 ring-white z-50' : 'hover:scale-105'
      }`}
      style={{
        border: `2px solid ${colors.border}`,
        background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(0,0,0,0.95) 100%)`,
        boxShadow: selected ? `0 0 30px ${colors.border}` : colors.shadow,
        minWidth: `${size}px`,
      }}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ 
          background: colors.border, 
          width: 10, 
          height: 10,
          border: `2px solid ${colors.bg}`
        }} 
      />

      <span className="text-3xl">{icon}</span>
      <div className="flex flex-col text-left">
        <span 
          style={{ color: colors.border }} 
          className="text-[10px] font-bold tracking-wider uppercase opacity-80"
        >
          {nodeType}
        </span>
        <span className="text-sm font-bold text-white leading-tight">
          {data.label}
        </span>
        {data.connections > 0 && (
          <span className="text-[9px] text-gray-500 mt-0.5">
            {data.connections} connections
          </span>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ 
          background: colors.border, 
          width: 10, 
          height: 10,
          border: `2px solid ${colors.bg}`
        }} 
      />
    </div>
  );
};

const nodeTypes = { customNode: CustomNode };

interface GraphData {
  nodes: Array<{ id: string; group: string; val?: number }>;
  links: Array<{ source: string; target: string; type?: string }>;
  stats?: Record<string, number>;
}

// Force-directed layout using D3-like physics simulation
const getForceLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const width = 1400;
  const height = 800;
  
  // Initialize positions randomly with some spacing
  const layoutedNodes = nodes.map((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI;
    const radius = Math.min(width, height) * 0.3;
    
    return {
      ...node,
      position: {
        x: width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 100,
        y: height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 100,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const KnowledgeGraph3D = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNeo4jConnected, setIsNeo4jConnected] = useState(false);
  const [graphStats, setGraphStats] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());

  const { token } = useAuth();
  const { toast } = useToast();

  // Search functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setHighlightedNodes(new Set());
      return;
    }

    const matches = new Set<string>();
    nodes.forEach(node => {
      if (node.data.label.toLowerCase().includes(term.toLowerCase()) ||
          node.data.type.toLowerCase().includes(term.toLowerCase())) {
        matches.add(node.id);
      }
    });
    setHighlightedNodes(matches);

    // Focus on first match
    if (matches.size > 0 && reactFlowInstance) {
      const firstMatch = Array.from(matches)[0];
      const node = nodes.find(n => n.id === firstMatch);
      if (node) {
        reactFlowInstance.setCenter(node.position.x, node.position.y, { zoom: 1.2, duration: 800 });
      }
    }
  };

  // Fetch graph data from API or use demo
  const loadGraphData = useCallback(async (useDemoFallback = true) => {
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/graph/data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: GraphData = await response.json();

        if (data.nodes && data.nodes.length > 0) {
          setIsNeo4jConnected(true);
          setGraphStats(data.stats || {});
          processGraphData(data);
          toast({ title: "Graph loaded from Neo4j", description: `${data.nodes.length} nodes, ${data.links.length} connections` });
          return;
        }
      }
    } catch (error) {
      console.log('Neo4j API not available, using demo data');
    }

    // Fallback to demo data
    if (useDemoFallback) {
      setIsNeo4jConnected(false);
      loadDemoData();
    }

    setIsLoading(false);
  }, [token, toast]);

  // Process graph data with enhanced styling
  const processGraphData = (data: GraphData) => {
    // Calculate connection counts
    const connectionCounts = new Map<string, number>();
    data.links.forEach(link => {
      connectionCounts.set(link.source, (connectionCounts.get(link.source) || 0) + 1);
      connectionCounts.set(link.target, (connectionCounts.get(link.target) || 0) + 1);
    });

    const rawNodes: Node[] = data.nodes.map(n => ({
      id: n.id,
      data: { 
        label: n.id.replace(/_/g, ' '), 
        type: n.group,
        connections: connectionCounts.get(n.id) || 0,
        size: getNodeSize(connectionCounts.get(n.id) || 0)
      },
      position: { x: 0, y: 0 },
      type: 'customNode',
    }));

    const rawEdges: Edge[] = data.links.map((l, i) => {
      const sourceType = data.nodes.find(n => n.id === l.source)?.group || 'Entity';
      const edgeColor = NODE_COLORS[sourceType]?.border || '#555';
      
      return {
        id: `e${i}`,
        source: l.source,
        target: l.target,
        animated: sourceType === 'Risk',
        type: 'smoothstep',
        style: { 
          stroke: edgeColor, 
          strokeWidth: 2.5,
          opacity: 0.7
        },
        markerEnd: { 
          type: MarkerType.ArrowClosed, 
          color: edgeColor,
          width: 20,
          height: 20
        },
        label: l.type !== 'RELATED_TO' ? l.type.replace(/_/g, ' ') : undefined,
        labelStyle: { fill: edgeColor, fontSize: 10, fontWeight: 600 },
        labelBgStyle: { fill: '#000', fillOpacity: 0.7 }
      };
    });

    const { nodes: layoutNodes, edges: layoutEdges } = getForceLayoutedElements(rawNodes, rawEdges);
    setNodes(layoutNodes);
    setEdges(layoutEdges);
    setIsLoading(false);
  };

  // Load demo data
  const loadDemoData = useCallback(() => {
    const demoGraphData: GraphData = {
      nodes: demoData.nodes,
      links: demoData.links,
      stats: {
        documents: demoData.nodes.filter(n => n.group === 'Document').length,
        risks: demoData.nodes.filter(n => n.group === 'Risk').length,
        people: demoData.nodes.filter(n => n.group === 'Person').length,
        machines: demoData.nodes.filter(n => n.group === 'Machine').length,
        total_connections: demoData.links.length
      }
    };

    setGraphStats(demoGraphData.stats!);
    processGraphData(demoGraphData);
  }, []);

  // Seed demo data to Neo4j
  const seedDemoData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/graph/seed-demo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Demo data seeded to Neo4j!",
          description: `Created ${result.nodes_created} nodes, ${result.relationships_created} relationships`
        });
        loadGraphData();
      } else {
        toast({ title: "Failed to seed data", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Neo4j connection error", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadDemoData();
  }, []);

  // Filter nodes by type
  useEffect(() => {
    if (activeFilter) {
      setNodes(nds =>
        nds.map(node => ({
          ...node,
          hidden: node.data.type !== activeFilter,
        }))
      );
    } else {
      setNodes(nds =>
        nds.map(node => ({
          ...node,
          hidden: false,
        }))
      );
    }
  }, [activeFilter, setNodes]);

  // Highlight searched nodes
  useEffect(() => {
    setNodes(nds =>
      nds.map(node => ({
        ...node,
        style: {
          ...node.style,
          opacity: highlightedNodes.size === 0 ? 1 : (highlightedNodes.has(node.id) ? 1 : 0.3),
        }
      }))
    );
  }, [highlightedNodes, setNodes]);

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
  };

  const handleReset = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }
    setSelectedNode(null);
    setActiveFilter(null);
    setSearchTerm('');
    setHighlightedNodes(new Set());
  };

  const filterTypes = [
    { type: 'Document', icon: '📄', color: '#00d4ff', count: graphStats.documents || 0 },
    { type: 'Machine', icon: '⚙️', color: '#ffd600', count: graphStats.machines || 0 },
    { type: 'Risk', icon: '⚠️', color: '#ff1744', count: graphStats.risks || 0 },
    { type: 'Person', icon: '👤', color: '#00ff88', count: graphStats.people || 0 },
    { type: 'Dept', icon: '🏢', color: '#d500f9', count: graphStats.departments || 0 },
  ];

  return (
    <div className="space-y-4">
      <div className="relative h-[700px] w-full bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex">

        <div className="flex-1 h-full relative">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 items-center">
            <div className="p-2 bg-black/80 border border-cyan-500/30 rounded backdrop-blur-md flex items-center gap-2">
              <h3 className="text-cyan-400 font-mono text-sm font-bold">K-LENS KNOWLEDGE GRAPH</h3>
              {isNeo4jConnected ? (
                <span className="flex items-center gap-1 text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded">
                  <Database className="w-3 h-3" /> Neo4j
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded">
                  📂 Demo
                </span>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search nodes..."
                className="w-full pl-10 pr-10 py-2 bg-black/80 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-2 rounded text-xs font-bold border bg-black/80 border-gray-700 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <RotateCw className="w-3 h-3" />
              RESET
            </button>
            <button
              onClick={() => loadDemoData()}
              className="px-3 py-2 rounded text-xs font-bold border bg-black/80 border-yellow-700 text-yellow-400 hover:text-white transition-colors flex items-center gap-2"
            >
              📂 DEMO
            </button>
            {token && (
              <>
                <button
                  onClick={() => loadGraphData()}
                  disabled={isLoading}
                  className="px-3 py-2 rounded text-xs font-bold border bg-black/80 border-green-700 text-green-400 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
                  LOAD NEO4J
                </button>
                {!isNeo4jConnected && (
                  <button
                    onClick={seedDemoData}
                    className="px-3 py-2 rounded text-xs font-bold border bg-black/80 border-purple-700 text-purple-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Database className="w-3 h-3" />
                    SEED NEO4J
                  </button>
                )}
              </>
            )}
          </div>

          {/* Filter Pills */}
          <div className="absolute top-20 left-4 z-10 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                !activeFilter 
                  ? 'bg-white text-black border-white' 
                  : 'bg-black/70 border-gray-600 text-gray-300 hover:border-white'
              }`}
            >
              ALL ({nodes.length})
            </button>
            {filterTypes.map(({ type, icon, color, count }) => (
              <button
                key={type}
                onClick={() => setActiveFilter(activeFilter === type ? null : type)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  activeFilter === type
                    ? 'text-black border-2'
                    : 'bg-black/70 border-gray-700 hover:border-2'
                }`}
                style={{
                  backgroundColor: activeFilter === type ? color : undefined,
                  borderColor: activeFilter === type ? color : undefined,
                  color: activeFilter === type ? '#000' : color,
                }}
              >
                <span>{icon}</span>
                {type} ({count})
              </button>
            ))}
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2, duration: 800 }}
            minZoom={0.1}
            maxZoom={2.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
            attributionPosition="bottom-right"
          >
            <Background color="#1a1a1a" gap={20} size={1} />
            <Controls 
              style={{ 
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
              }} 
              showInteractive={false}
            />
            <MiniMap 
              nodeColor={(node) => {
                const type = node.data?.type || 'Entity';
                return NODE_COLORS[type]?.border || '#555';
              }}
              maskColor="rgba(0, 0, 0, 0.8)"
              style={{
                background: '#0a0a0a',
                border: '1px solid #333',
              }}
            />
          </ReactFlow>
        </div>

        {/* Enhanced Sidebar */}
        <div className={`w-96 border-l border-gray-800 bg-gradient-to-b from-[#0a0a0a] to-[#000] transition-all duration-300 transform ${selectedNode ? 'translate-x-0' : 'translate-x-full'} absolute right-0 top-0 bottom-0 z-20 shadow-2xl overflow-y-auto`}>
          {selectedNode && (
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <span className="text-[10px] font-mono border border-gray-600 px-2 py-1 rounded text-gray-400 inline-block mb-2">
                    NODE ID: {selectedNode.id.substring(0, 12)}...
                  </span>
                  <h2 className="text-2xl font-bold text-white mb-1 leading-tight">
                    {selectedNode.data.label}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{NODE_ICONS[selectedNode.data.type]}</span>
                    <span 
                      className="text-sm font-bold"
                      style={{ color: NODE_COLORS[selectedNode.data.type]?.border }}
                    >
                      {selectedNode.data.type}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)} 
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div 
                className="h-1 w-full mb-6 rounded-full"
                style={{ 
                  background: NODE_COLORS[selectedNode.data.type]?.border,
                  boxShadow: `0 0 10px ${NODE_COLORS[selectedNode.data.type]?.border}`
                }}
              />

              <div className="space-y-6 flex-1 overflow-y-auto">
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 p-4 rounded-lg border border-gray-800">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Status
                  </p>
                  <p className="text-sm font-mono text-white">
                    {NODE_DETAILS[selectedNode.id]?.status || 'ACTIVE_OPERATIONAL'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold mb-3">AI Analysis</p>
                  <div className="bg-gradient-to-br from-gray-900/50 to-transparent p-4 rounded-lg border-l-2" style={{ borderColor: NODE_COLORS[selectedNode.data.type]?.border }}>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {NODE_DETAILS[selectedNode.id]?.details || 'Entity detected in document scan. Cross-referenced with compliance database. No anomalies found. All systems nominal.'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold mb-2">Connections</p>
                  <div className="bg-gray-900/50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-white">{selectedNode.data.connections || 0}</p>
                    <p className="text-xs text-gray-500">Related entities</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold mb-2">Assigned To</p>
                  <div className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{NODE_DETAILS[selectedNode.id]?.assignee || 'System Admin'}</p>
                      <p className="text-xs text-gray-500">Primary Contact</p>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                className="w-full py-3 rounded-lg font-bold text-black mt-6 transition-all active:scale-95 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${NODE_COLORS[selectedNode.data.type]?.border} 0%, ${NODE_COLORS[selectedNode.data.type]?.border}dd 100%)`,
                  boxShadow: `0 4px 20px ${NODE_COLORS[selectedNode.data.type]?.border}66`
                }}
              >
                {NODE_DETAILS[selectedNode.id]?.action || 'VIEW DETAILS'}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Documents', value: graphStats.documents || 0, color: '#00d4ff', icon: '📄' },
          { label: 'Risks', value: graphStats.risks || 0, color: '#ff1744', icon: '⚠️' },
          { label: 'People', value: graphStats.people || 0, color: '#00ff88', icon: '👤' },
          { label: 'Machines', value: graphStats.machines || 0, color: '#ffd600', icon: '⚙️' },
          { label: 'Connections', value: graphStats.total_connections || 0, color: '#d500f9', icon: '🔗' },
        ].map((stat) => (
          <div 
            key={stat.label} 
            className="glass-card p-4 text-center group hover:scale-105 transition-transform cursor-pointer border"
            style={{ borderColor: `${stat.color}33` }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <p 
                className="text-3xl font-bold font-mono" 
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeGraph3D;
