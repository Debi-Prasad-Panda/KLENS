import { Search, Glasses, Construction } from "lucide-react";

interface PlaceholderViewProps {
  type: "search" | "ar";
}

export function PlaceholderView({ type }: PlaceholderViewProps) {
  const config = {
    search: {
      icon: Search,
      title: "Search & Discovery",
      description: "AI-powered semantic search across your entire document network",
      features: ["Natural language queries", "Entity extraction", "Cross-reference discovery", "Historical context"],
    },
    ar: {
      icon: Glasses,
      title: "AR Preview",
      description: "Augmented reality overlay for field equipment identification",
      features: ["Equipment scanning", "Maintenance overlay", "Safety zones", "Real-time annotations"],
    },
  };

  const { icon: Icon, title, description, features } = config[type];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 glow-cyan animate-float">
        <Icon className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p className="text-muted-foreground max-w-md mb-8">{description}</p>
      
      <div className="glass-card p-6 max-w-sm">
        <div className="flex items-center gap-2 mb-4">
          <Construction className="w-5 h-5 text-warning" />
          <span className="text-sm font-semibold text-warning">Coming Soon</span>
        </div>
        <ul className="space-y-3 text-left">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
