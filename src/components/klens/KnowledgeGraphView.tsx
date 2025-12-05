import { useState, useEffect } from "react";
import { FileText, AlertTriangle, User, Zap, Clock } from "lucide-react";

const nodes = [
  { id: 1, type: "document", label: "Safety Manual v2", x: 50, y: 30 },
  { id: 2, type: "document", label: "Boiler Specs", x: 30, y: 60 },
  { id: 3, type: "document", label: "Audit Report 2024", x: 70, y: 65 },
  { id: 4, type: "risk", label: "Fire Hazard", x: 45, y: 50 },
  { id: 5, type: "risk", label: "Pressure Variance", x: 60, y: 40 },
  { id: 6, type: "person", label: "Eng. Rajesh", x: 25, y: 35 },
  { id: 7, type: "person", label: "Safety Officer", x: 75, y: 45 },
  { id: 8, type: "document", label: "Maintenance Log", x: 40, y: 75 },
  { id: 9, type: "risk", label: "Equipment Failure", x: 55, y: 80 },
  { id: 10, type: "person", label: "Station Manager", x: 65, y: 25 },
];

const connections = [
  { from: 1, to: 4 },
  { from: 1, to: 6 },
  { from: 2, to: 5 },
  { from: 2, to: 4 },
  { from: 3, to: 7 },
  { from: 4, to: 5 },
  { from: 4, to: 7 },
  { from: 5, to: 10 },
  { from: 6, to: 2 },
  { from: 8, to: 9 },
  { from: 8, to: 6 },
  { from: 9, to: 4 },
  { from: 3, to: 10 },
];

const getNodeStyle = (type: string) => {
  switch (type) {
    case "document":
      return { bg: "bg-primary", shadow: "shadow-[0_0_30px_rgba(34,211,238,0.4)]", icon: FileText };
    case "risk":
      return { bg: "bg-destructive", shadow: "shadow-[0_0_30px_rgba(244,63,94,0.4)]", icon: AlertTriangle };
    case "person":
      return { bg: "bg-success", shadow: "shadow-[0_0_30px_rgba(52,211,153,0.4)]", icon: User };
    default:
      return { bg: "bg-muted", shadow: "", icon: Zap };
  }
};

export function KnowledgeGraphView() {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState(100);
  const [animatedNodes, setAnimatedNodes] = useState<number[]>([]);

  useEffect(() => {
    // Animate nodes appearing based on time range
    const visibleCount = Math.ceil((timeRange / 100) * nodes.length);
    setAnimatedNodes(nodes.slice(0, visibleCount).map(n => n.id));
  }, [timeRange]);

  const visibleConnections = connections.filter(
    conn => animatedNodes.includes(conn.from) && animatedNodes.includes(conn.to)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Graph</h2>
          <p className="text-muted-foreground mt-1">
            Visualize entity relationships across your document network
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 glass-card">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs">Documents</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 glass-card">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-xs">Risks</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 glass-card">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs">People</span>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div className="glass-card p-6 relative overflow-hidden" style={{ height: "500px" }}>
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {visibleConnections.map((conn, i) => {
            const fromNode = nodes.find(n => n.id === conn.from)!;
            const toNode = nodes.find(n => n.id === conn.to)!;
            const isHighlighted = hoveredNode === conn.from || hoveredNode === conn.to;
            
            return (
              <line
                key={i}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                stroke={isHighlighted ? "#22d3ee" : "#334155"}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeOpacity={isHighlighted ? 1 : 0.5}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const style = getNodeStyle(node.type);
          const isVisible = animatedNodes.includes(node.id);
          const isHovered = hoveredNode === node.id;
          const isConnected = hoveredNode && connections.some(
            c => (c.from === hoveredNode && c.to === node.id) || (c.to === hoveredNode && c.from === node.id)
          );

          return (
            <div
              key={node.id}
              className={`graph-node transition-all duration-500 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"
              }`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: `translate(-50%, -50%) ${isHovered ? "scale(1.2)" : "scale(1)"}`,
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div
                className={`relative cursor-pointer ${
                  isHovered || isConnected ? style.shadow : ""
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center transition-all duration-300 ${
                    isHovered ? "ring-2 ring-white/30" : ""
                  }`}
                >
                  <style.icon className="w-6 h-6 text-background" />
                </div>
                {(isHovered || isConnected) && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-card border border-border rounded-lg whitespace-nowrap z-10 animate-fade-in">
                    <p className="text-xs font-medium">{node.label}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{node.type}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Time Slider */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Timeline Explorer</h3>
          <span className="text-sm text-muted-foreground ml-auto">
            Jan 2024 — Dec 2025
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
        />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Jan 2024</span>
          <span>Jun 2024</span>
          <span>Dec 2024</span>
          <span>Jun 2025</span>
          <span>Dec 2025</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Entities", value: animatedNodes.length, color: "primary" },
          { label: "Connections", value: visibleConnections.length, color: "success" },
          { label: "Risk Nodes", value: animatedNodes.filter(id => nodes.find(n => n.id === id)?.type === "risk").length, color: "destructive" },
          { label: "Documents", value: animatedNodes.filter(id => nodes.find(n => n.id === id)?.type === "document").length, color: "primary" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <p className={`text-2xl font-bold font-mono text-${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
