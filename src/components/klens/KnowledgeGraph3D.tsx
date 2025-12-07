import { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  MarkerType,
  Node,
  Edge,
  ConnectionLineType
} from 'reactflow';
import 'reactflow/dist/style.css';
import 'reactflow/dist/base.css';
import dagre from 'dagre';
import demoData from '../../data/demo-graph.json';

// Auto-layout with Dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR' });

  const nodeWidth = 200;
  const nodeHeight = 60;

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

// Custom Node Component
const CustomNode = ({ data }: any) => {
  let borderColor = '#333';
  let bgColor = '#111';
  let icon = '📄';
  let glow = 'none';

  switch (data.type) {
    case 'Document':
      borderColor = '#00f3ff';
      icon = '📂';
      break;
    case 'Risk':
      borderColor = '#ff0033';
      bgColor = '#330011';
      icon = '⚠️';
      glow = '0 0 15px #ff0033';
      break;
    case 'Person':
      borderColor = '#00ff66';
      icon = '👤';
      break;
    case 'Machine':
      borderColor = '#ffaa00';
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
      style={{
        padding: '10px 15px',
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
        background: bgColor,
        color: '#fff',
        minWidth: '180px',
        textAlign: 'center',
        fontFamily: 'monospace',
        boxShadow: glow,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '12px',
        transition: 'all 0.3s ease'
      }}
      className="hover:scale-105 cursor-pointer"
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start'}}>
        <span style={{color: borderColor, fontSize:'9px', fontWeight:'bold'}}>{data.type.toUpperCase()}</span>
        <span style={{fontWeight:'bold'}}>{data.label}</span>
      </div>
    </div>
  );
};

const nodeTypes = { customNode: CustomNode };

// Transform data
const initialNodes: Node[] = demoData.nodes.map(n => ({
  id: n.id,
  data: { label: n.id.replace(/_/g, ' '), type: n.group },
  position: { x: 0, y: 0 },
  type: 'customNode',
}));

const initialEdges: Edge[] = demoData.links.map((l, i) => ({
  id: `e-${l.source}-${l.target}-${i}`,
  source: l.source,
  target: l.target,
  type: 'default',
  animated: true,
  style: { 
    stroke: '#00f3ff', 
    strokeWidth: 2
  },
  markerEnd: { 
    type: MarkerType.ArrowClosed, 
    color: '#00f3ff'
  },
}));

console.log('Nodes:', initialNodes.map(n => n.id));
console.log('Edges:', initialEdges);

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges
);

const KnowledgeGraph3D = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            📊 Knowledge Graph Blueprint
          </h2>
          <p className="text-muted-foreground mt-1">
            Interactive 2D visualization of entity relationships
          </p>
        </div>
      </div>

      <div className="h-[600px] w-full bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-4 left-4 z-10 p-2 bg-black/60 border border-cyan-500/30 rounded backdrop-blur-md">
          <h3 className="text-cyan-400 font-mono text-sm font-bold">K-LENS BLUEPRINT VIEW</h3>
          <p className="text-xs text-gray-400 font-mono mt-1">MODE: LEFT-TO-RIGHT FLOW</p>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          connectionLineType={ConnectionLineType.SmoothStep}
          minZoom={0.2}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#333" gap={20} />
          <Controls style={{ fill: '#00f3ff' }} />
          <MiniMap 
            nodeColor={(n: any) => {
              if (n.data.type === 'Risk') return '#ff0033';
              if (n.data.type === 'Person') return '#00ff66';
              return '#00f3ff';
            }} 
            style={{background: '#000'}} 
          />
        </ReactFlow>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Documents', value: demoData.nodes.filter(n => n.group === 'Document').length, color: '#00f3ff' },
          { label: 'Risks', value: demoData.nodes.filter(n => n.group === 'Risk').length, color: '#ff0033' },
          { label: 'People', value: demoData.nodes.filter(n => n.group === 'Person').length, color: '#00ff66' },
          { label: 'Machines', value: demoData.nodes.filter(n => n.group === 'Machine').length, color: '#ffaa00' },
          { label: 'Connections', value: demoData.links.length, color: '#dd00ff' },
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
