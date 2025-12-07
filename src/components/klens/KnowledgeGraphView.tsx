import { useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import KnowledgeGraph3D from './KnowledgeGraph3D';



export function KnowledgeGraphView() {
  const [timeRange, setTimeRange] = useState(100);

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


    </div>
  );
}
