import { Sparkles } from "lucide-react";
import KnowledgeGraph3D from './KnowledgeGraph3D';

export function KnowledgeGraphView() {

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Knowledge Graph Blueprint
          </h2>
          <p className="text-muted-foreground mt-1">
            Interactive 2D visualization of entity relationships - Digital schematic view
          </p>
        </div>
      </div>

      {/* 2D Blueprint Graph */}
      <KnowledgeGraph3D />
    </div>
  );
}
