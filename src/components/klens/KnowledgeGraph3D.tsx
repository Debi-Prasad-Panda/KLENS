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
  useReactFlow
} from 'reactflow';
import { RotateCw, Database, RefreshCw, Loader2 } from 'lucide-react';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
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

const nodeWidth = 220;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const CustomNode = ({ data, selected }: any) => {
  let borderColor = '#333';
  let bgColor = '#0a0a0a';
  let icon = '📄';
  let shadow = 'none';

  switch (data.type) {
    case 'Document':
      borderColor = '#00f3ff';
      icon = '📂';
      break;
    case 'Risk':
      borderColor = '#ff0055';
      bgColor = '#1a0505';
      icon = '⚠️';
      shadow = '0 0 10px #ff0055';
      break;
    case 'Person':
      borderColor = '#00ff9d';
      icon = '👤';
      break;
    case 'Machine':
      borderColor = '#f0e300';
      icon = '⚙️';
      break;
    case 'Dept':
      borderColor = '#dd00ff';
      icon = '🏢';
      break;
    default:
      break;
  }

  return (
    <div
      className={`px-4 py-3 rounded-lg flex items-center gap-3 min-w-[180px] transition-all duration-300 ${selected ? 'scale-105 ring-2 ring-white' : ''}`}
      style={{
        border: `1px solid ${borderColor}`,
        background: bgColor,
        boxShadow: selected ? `0 0 20px ${borderColor}` : shadow,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: borderColor }} />

      <span className="text-2xl">{icon}</span>
      <div className="flex flex-col text-left">
        <span style={{ color: borderColor }} className="text-[9px] font-bold tracking-wider uppercase">{data.type}</span>
        <span className="text-xs font-bold text-gray-100">{data.label}</span>
      </div>

      <Handle type="source" position={Position.Right} style={{ background: borderColor }} />
    </div>
  );
};

const nodeTypes = { customNode: CustomNode };

interface GraphData {
  nodes: Array<{ id: string; group: string; val?: number }>;
  links: Array<{ source: string; target: string; type?: string }>;
  stats?: Record<string, number>;
}

const KnowledgeGraph3D = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [riskFilter, setRiskFilter] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNeo4jConnected, setIsNeo4jConnected] = useState(false);
  const [graphStats, setGraphStats] = useState<Record<string, number>>({});

  const { token } = useAuth();
  const { toast } = useToast();

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

          const rawNodes: Node[] = data.nodes.map(n => ({
            id: n.id,
            data: { label: n.id.replace(/_/g, ' '), type: n.group },
            position: { x: 0, y: 0 },
            type: 'customNode',
          }));

          const rawEdges: Edge[] = data.links.map((l, i) => ({
            id: `e${i}`,
            source: l.source,
            target: l.target,
            animated: true,
            type: 'smoothstep',
            style: { stroke: '#555', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#555' },
          }));

          const { nodes: layoutNodes, edges: layoutEdges } = getLayoutedElements(rawNodes, rawEdges);
          setNodes(layoutNodes);
          setEdges(layoutEdges);

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
  }, [token, setNodes, setEdges, toast]);

  // Load demo data
  const loadDemoData = useCallback(() => {
    const rawNodes: Node[] = demoData.nodes.map(n => ({
      id: n.id,
      data: { label: n.id.replace(/_/g, ' '), type: n.group },
      position: { x: 0, y: 0 },
      type: 'customNode',
    }));

    const rawEdges: Edge[] = demoData.links.map((l, i) => ({
      id: `e${i}`,
      source: l.source,
      target: l.target,
      animated: true,
      type: 'smoothstep',
      style: { stroke: '#555', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#555' },
    }));

    const { nodes: layoutNodes, edges: layoutEdges } = getLayoutedElements(rawNodes, rawEdges);
    setNodes(layoutNodes);
    setEdges(layoutEdges);

    setGraphStats({
      documents: demoData.nodes.filter(n => n.group === 'Document').length,
      risks: demoData.nodes.filter(n => n.group === 'Risk').length,
      people: demoData.nodes.filter(n => n.group === 'Person').length,
      machines: demoData.nodes.filter(n => n.group === 'Machine').length,
      total_connections: demoData.links.length
    });

    setIsLoading(false);
  }, [setNodes, setEdges]);

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
        // Reload graph
        loadGraphData();
      } else {
        toast({ title: "Failed to seed data", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Neo4j connection error", variant: "destructive" });
    }
  };

  useEffect(() => {
    // Always start with demo data - user can click REFRESH to load from Neo4j
    loadDemoData();
  }, []);


  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (riskFilter && node.data.type !== 'Risk' && node.data.type !== 'Document') {
          return { ...node, hidden: true };
        }
        return { ...node, hidden: false };
      })
    );
  }, [riskFilter, setNodes]);

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
  };

  const handleReset = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    }
    setSelectedNode(null);
    setRiskFilter(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative h-[600px] w-full bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex">

        <div className="flex-1 h-full relative">
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <div className="p-2 bg-black/60 border border-cyan-500/30 rounded backdrop-blur-md flex items-center gap-2">
              <h3 className="text-cyan-400 font-mono text-sm font-bold">K-LENS BLUEPRINT</h3>
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
            <button
              onClick={() => setRiskFilter(!riskFilter)}
              className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${riskFilter ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-black/60 border-gray-700 text-gray-400 hover:text-white'}`}
            >
              {riskFilter ? '🔴 SHOW ALL' : '⭕ FILTER: RISKS ONLY'}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 rounded text-xs font-bold border bg-black/60 border-gray-700 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <RotateCw className="w-3 h-3" />
              RESET VIEW
            </button>
            <button
              onClick={() => loadDemoData()}
              className="px-3 py-1 rounded text-xs font-bold border bg-black/60 border-yellow-700 text-yellow-400 hover:text-white transition-colors flex items-center gap-2"
            >
              📂 DEMO DATA
            </button>
            {token && (
              <button
                onClick={() => loadGraphData()}
                disabled={isLoading}
                className="px-3 py-1 rounded text-xs font-bold border bg-black/60 border-green-700 text-green-400 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
                LOAD NEO4J
              </button>
            )}
            {token && !isNeo4jConnected && (
              <button
                onClick={seedDemoData}
                className="px-3 py-1 rounded text-xs font-bold border bg-black/60 border-purple-700 text-purple-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <Database className="w-3 h-3" />
                SEED NEO4J
              </button>
            )}
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
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            attributionPosition="bottom-right"
          >
            <Background color="#222" gap={25} />
            <Controls style={{ fill: '#00f3ff', borderRadius: '4px', borderColor: '#333' }} />
          </ReactFlow>
        </div>

        <div className={`w-80 border-l border-gray-800 bg-[#0a0a0a] transition-all duration-300 transform ${selectedNode ? 'translate-x-0' : 'translate-x-full'} absolute right-0 top-0 bottom-0 z-20 shadow-2xl`}>
          {selectedNode && (
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-mono border border-gray-600 px-2 rounded text-gray-400">
                  ID: {selectedNode.id.substring(0, 8)}...
                </span>
                <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <h2 className="text-xl font-bold text-white mb-2 leading-tight">
                {selectedNode.data.label}
              </h2>
              <div className={`h-1 w-full mb-6 rounded ${selectedNode.data.type === 'Risk' ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-cyan-500'}`}></div>

              <div className="space-y-6 flex-1">
                <div className="bg-gray-900/50 p-4 rounded border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                  <p className="text-sm font-mono text-white">
                    {NODE_DETAILS[selectedNode.id]?.status || 'ACTIVE_NORMAL'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-2">AI Analysis</p>
                  <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-gray-700 pl-3">
                    {NODE_DETAILS[selectedNode.id]?.details || 'Entity detected in document scan. Cross-referenced with compliance database. No anomalies found.'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-2">Assignee</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">👤</div>
                    <span className="text-sm text-white">{NODE_DETAILS[selectedNode.id]?.assignee || 'Admin'}</span>
                  </div>
                </div>
              </div>

              <button className={`w-full py-3 rounded font-bold text-black mt-auto transition-transform active:scale-95 ${selectedNode.data.type === 'Risk' ? 'bg-red-500 hover:bg-red-400' : 'bg-cyan-500 hover:bg-cyan-400'}`}>
                {NODE_DETAILS[selectedNode.id]?.action || 'VIEW DETAILS'}
              </button>
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Documents', value: graphStats.documents || 0, color: '#00f3ff' },
          { label: 'Risks', value: graphStats.risks || 0, color: '#ff0033' },
          { label: 'People', value: graphStats.people || 0, color: '#00ff66' },
          { label: 'Machines', value: graphStats.machines || 0, color: '#ffaa00' },
          { label: 'Connections', value: graphStats.total_connections || 0, color: '#dd00ff' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <p className="text-3xl font-bold font-mono" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeGraph3D;
