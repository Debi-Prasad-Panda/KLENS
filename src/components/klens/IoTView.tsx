import { useState, useEffect, useRef } from "react";
import { 
  Radio, Thermometer, Gauge, Activity, Wifi, AlertTriangle, CheckCircle2,
  Settings, Bell, Lock, Zap, Signal, Power, TrendingUp, BarChart3, Cpu,
  Server, Database, Cloud, Shield, Eye, Layers, Box, Droplets, Wind, Zap as Lightning,
  Battery, Waves, Fan
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { usePermissions } from "@/hooks/usePermissions";
import { toast } from "@/hooks/use-toast";

const generateData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: `${i}s`,
    temp: 100 + Math.random() * 10 + Math.sin(i / 3) * 5,
    pressure: 395 + Math.random() * 15,
    vibration: 2 + Math.random() * 3,
  }));
};

export function IoTView() {
  const [data, setData] = useState(generateData);
  const [currentTemp, setCurrentTemp] = useState(105);
  const [currentPressure, setCurrentPressure] = useState(402);
  const [currentVibration, setCurrentVibration] = useState(4.2);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { can, roleDisplayName } = usePermissions();
  const canCalibrate = can('IOT_CALIBRATE');
  const canViewAlerts = can('IOT_ALERTS_VIEW');
  
  const handleCalibrate = (sensorId: string) => {
    if (!canCalibrate) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: `Your role (${roleDisplayName}) cannot calibrate sensors.`,
      });
      return;
    }
    toast({
      title: "Calibration Started",
      description: `Calibrating sensor ${sensorId}...`,
    });
  };
  
  const handleAcknowledgeAlert = () => {
    if (!canViewAlerts) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Only Safety Officers can acknowledge alerts.",
      });
      return;
    }
    toast({
      title: "Alert Acknowledged",
      description: "Alert has been logged and acknowledged.",
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    const interval = setInterval(() => {
      setData(prev => {
        const newPoint = {
          time: `${prev.length}s`,
          temp: 100 + Math.random() * 10 + Math.sin(prev.length / 3) * 5,
          pressure: 395 + Math.random() * 15,
          vibration: 2 + Math.random() * 3,
        };
        setCurrentTemp(Math.round(newPoint.temp));
        setCurrentPressure(Math.round(newPoint.pressure));
        setCurrentVibration(Number(newPoint.vibration.toFixed(1)));
        return [...prev.slice(1), newPoint];
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const sensors = [
    {
      id: "boiler-b7",
      name: "Boiler B7 Sensor",
      location: "Station 12 - Zone A",
      status: "online",
      readings: [
        { label: "Temperature", value: `${currentTemp}°C`, max: 120, current: currentTemp, unit: "°C", icon: Thermometer, warning: currentTemp > 105 },
        { label: "Pressure", value: `${currentPressure} PSI`, max: 500, current: currentPressure, unit: "PSI", icon: Gauge, warning: false },
      ],
    },
    {
      id: "pump-p3",
      name: "Hydraulic Pump P3",
      location: "Station 12 - Pump House",
      status: "online",
      readings: [
        { label: "Flow Rate", value: `${Math.round(450 + Math.random() * 50)} L/min`, max: 600, current: 475, unit: "L/min", icon: Droplets, warning: false },
        { label: "Pressure", value: `${Math.round(85 + Math.random() * 10)} PSI`, max: 120, current: 90, unit: "PSI", icon: Gauge, warning: false },
      ],
    },
    {
      id: "turbine-t1",
      name: "Steam Turbine T1",
      location: "Station 12 - Power Gen",
      status: "online",
      readings: [
        { label: "RPM", value: `${Math.round(3500 + Math.random() * 100)}`, max: 4000, current: 3550, unit: "RPM", icon: Fan, warning: false },
        { label: "Temperature", value: `${Math.round(420 + Math.random() * 30)}°C`, max: 500, current: 435, unit: "°C", icon: Thermometer, warning: false },
      ],
    },
    {
      id: "compressor-c2",
      name: "Air Compressor C2",
      location: "Station 12 - Utility",
      status: "alert",
      readings: [
        { label: "Pressure", value: `${Math.round(145 + Math.random() * 10)} PSI`, max: 150, current: 148, unit: "PSI", icon: Gauge, warning: true },
        { label: "Vibration", value: `${currentVibration}g`, max: 5, current: currentVibration, unit: "g", icon: Activity, warning: currentVibration > 4 },
      ],
    },
    {
      id: "transformer-tr5",
      name: "Transformer TR5",
      location: "Station 12 - Substation",
      status: "online",
      readings: [
        { label: "Load", value: `${Math.round(750 + Math.random() * 100)} kVA`, max: 1000, current: 800, unit: "kVA", icon: Lightning, warning: false },
        { label: "Temperature", value: `${Math.round(65 + Math.random() * 10)}°C`, max: 90, current: 70, unit: "°C", icon: Thermometer, warning: false },
      ],
    },
    {
      id: "motor-m8",
      name: "Induction Motor M8",
      location: "Station 12 - Conveyor",
      status: "online",
      readings: [
        { label: "Current", value: `${Math.round(45 + Math.random() * 5)} A`, max: 60, current: 48, unit: "A", icon: Zap, warning: false },
        { label: "Vibration", value: `${(1.5 + Math.random() * 0.5).toFixed(1)}g`, max: 3, current: 1.8, unit: "g", icon: Activity, warning: false },
      ],
    },
  ];

  const radarData = [
    { metric: 'Performance', value: 92 },
    { metric: 'Reliability', value: 88 },
    { metric: 'Efficiency', value: 95 },
    { metric: 'Safety', value: 85 },
    { metric: 'Uptime', value: 98 },
  ];

  return (
    <div ref={containerRef} className="relative space-y-6 animate-fade-in p-6 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>
      
      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
            opacity: 0.3 + Math.random() * 0.4
          }}
        />
      ))}
      
      <style>{`
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(5px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.15); }
          50% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.25); }
        }
        @keyframes rotate-3d {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(360deg); }
        }
      `}</style>
      {/* Holographic Header */}
      <div className="relative glass-card p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-success/5 to-transparent shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-cyan-400 to-success flex items-center justify-center shadow-lg">
              <Radio className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-cyan-300 to-success bg-clip-text text-transparent">
                IoT Command Center
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                <Layers className="w-3 h-3" />
                Station 12 - Industrial Intelligence Network
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-success/10 rounded-xl border border-success/30 flex items-center gap-2 backdrop-blur-sm">
              <Signal className="w-4 h-4 text-success" />
              <div>
                <span className="text-xs text-success/70 block">System Status</span>
                <span className="text-sm font-bold text-success">ONLINE</span>
              </div>
            </div>
            
            <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-xs text-muted-foreground block">Network</span>
                  <span className="text-sm font-bold text-primary">12ms</span>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-2 bg-cyan-500/10 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs text-muted-foreground block">Throughput</span>
                  <span className="text-sm font-bold text-cyan-400">1.2K/s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((sensor, idx) => {
          const isSelected = selectedSensor === sensor.id;
          const isAlert = sensor.status === "alert";
          
          return (
          <div
            key={sensor.id}
            onClick={() => setSelectedSensor(isSelected ? null : sensor.id)}
            className={`relative group cursor-pointer glass-card p-4 rounded-xl border transition-all duration-500 ${
              isAlert 
                ? "border-destructive/40 bg-gradient-to-br from-destructive/5 to-transparent" 
                : "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
            } ${
              isSelected ? 'scale-[1.02] shadow-xl ring-2 ring-primary/30' : 'hover:scale-[1.01] hover:shadow-lg'
            }`}
            style={{ 
              animationDelay: `${idx * 100}ms`,
              transform: isSelected ? 'perspective(1000px) rotateX(2deg)' : 'perspective(1000px) rotateX(0deg)',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            <div className="relative flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`relative w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                  isAlert ? "bg-gradient-to-br from-destructive to-red-600" : "bg-gradient-to-br from-success to-emerald-600"
                }`}>
                  {sensor.status === "online" ? (
                    <Wifi className="w-5 h-5 text-white" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{sensor.name}</h3>
                  <p className="text-xs text-muted-foreground">{sensor.location}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className={`px-2 py-1 rounded-lg text-xs font-bold uppercase backdrop-blur-sm ${
                  sensor.status === "online" 
                    ? "bg-success/20 text-success border border-success/40" 
                    : "bg-destructive/20 text-destructive border border-destructive/40 animate-pulse"
                }`}>
                  {sensor.status}
                </div>
                {isSelected && (
                  <div className="px-3 py-1 rounded-lg bg-primary/20 border border-primary/40 text-xs text-primary font-semibold animate-fade-in">
                    <Eye className="w-3 h-3 inline mr-1" />
                    Monitoring
                  </div>
                )}
              </div>
            </div>

            <div className="relative space-y-3">
              {sensor.readings.map((reading, rIdx) => {
                const percentage = Math.round((reading.current / reading.max) * 100);
                return (
                <div key={reading.label} className="relative glass-card p-3 rounded-lg border border-border/30 bg-gradient-to-br from-background/50 to-transparent backdrop-blur-sm overflow-hidden group"
                  style={{ animationDelay: `${rIdx * 100}ms` }}>

                  
                  <div className="relative flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        reading.warning ? "bg-destructive/15 border border-destructive/30" : "bg-primary/15 border border-primary/30"
                      }`}>
                        <reading.icon className={`w-4 h-4 ${reading.warning ? "text-destructive" : "text-primary"}`} />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground">{reading.label}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold font-mono block ${
                        reading.warning ? "text-destructive" : "text-foreground"
                      }`}>
                        {reading.value}
                      </span>
                      <span className="text-xs text-muted-foreground">{percentage}%</span>
                    </div>
                  </div>
                  
                  <div className="relative space-y-2">
                    <div className="h-2 bg-secondary/50 rounded-full overflow-hidden border border-border/50 relative">
                      <div
                        className={`h-full rounded-full transition-all duration-700 relative ${
                          reading.warning 
                            ? "bg-gradient-to-r from-orange-500 via-red-500 to-destructive" 
                            : "bg-gradient-to-r from-primary via-cyan-400 to-success"
                        }`}
                        style={{ 
                          width: `${percentage}%`,
                          boxShadow: reading.warning 
                            ? '0 0 10px rgba(239, 68, 68, 0.3)' 
                            : '0 0 10px rgba(34, 211, 238, 0.3)'
                        }}
                      >

                      </div>
                    </div>
                  </div>
                  
                  {reading.warning && (
                    <div className="mt-2 p-2 bg-gradient-to-r from-destructive/15 to-red-500/15 rounded-lg border border-destructive/30">
                      <p className="text-xs text-destructive font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Exceeds threshold
                      </p>
                    </div>
                  )}
                </div>
              )})}
            </div>
            
            <div className="relative flex gap-2 mt-4 pt-4 border-t border-border/30">
              <button
                onClick={(e) => { e.stopPropagation(); handleCalibrate(sensor.id); }}
                className={`relative flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 overflow-hidden ${
                  canCalibrate 
                    ? 'bg-gradient-to-r from-primary/30 to-success/30 hover:from-primary/40 hover:to-success/40 text-primary border-2 border-primary/50 shadow-lg hover:shadow-xl hover:scale-105' 
                    : 'bg-secondary/50 text-muted-foreground cursor-not-allowed border-2 border-border'
                }`}
              >
                {canCalibrate && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />}
                {canCalibrate ? <Settings className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span className="relative">Calibrate</span>
              </button>
              
              {sensor.status === "alert" && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleAcknowledgeAlert(); }}
                  className={`relative flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 overflow-hidden ${
                    canViewAlerts 
                      ? 'bg-gradient-to-r from-warning/30 to-destructive/30 hover:from-warning/40 hover:to-destructive/40 text-warning border-2 border-warning/50 shadow-lg hover:shadow-xl hover:scale-105' 
                      : 'bg-secondary/50 text-muted-foreground cursor-not-allowed border-2 border-border'
                  }`}
                >
                  {canViewAlerts && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />}
                  {canViewAlerts ? <Bell className="w-4 h-4 animate-pulse" /> : <Lock className="w-4 h-4" />}
                  <span className="relative">Acknowledge</span>
                </button>
              )}
            </div>
          </div>
        );})}
      </div>

      {/* Dual Analytics Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Telemetry Stream */}
        <div className="lg:col-span-2 relative glass-card p-6 rounded-2xl border border-primary/20 shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
          
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-cyan-400 to-success flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Live Telemetry Stream</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Activity className="w-3 h-3 animate-pulse" />
                  Real-time sensor data • Updated every 1s
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/20 rounded-xl border border-primary/30">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary">Temperature</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-success/20 rounded-xl border border-success/30">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-semibold text-success">Pressure</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-destructive/20 rounded-xl border border-destructive/30">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-xs font-semibold text-destructive">Vibration</span>
              </div>
            </div>
          </div>
          
          <div className="relative h-64 rounded-xl bg-background/30 p-4 border border-border/30">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVibration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(222 47% 11%)', 
                    border: '2px solid hsl(217 33% 17%)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    padding: '12px'
                  }}
                />
                <Area type="monotone" dataKey="temp" stroke="#22d3ee" strokeWidth={3} fill="url(#colorTemp)" />
                <Area type="monotone" dataKey="pressure" stroke="#34d399" strokeWidth={3} fill="url(#colorPressure)" />
                <Area type="monotone" dataKey="vibration" stroke="#f43f5e" strokeWidth={3} fill="url(#colorVibration)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* System Performance Radar */}
        <div className="relative glass-card p-6 rounded-2xl border border-success/20 shadow-lg overflow-hidden">
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-success/5 rounded-full blur-3xl" />
          
          <div className="relative mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold">System Health</h3>
                <p className="text-xs text-muted-foreground">Performance metrics</p>
              </div>
            </div>
          </div>
          
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" strokeWidth={1} />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Performance" dataKey="value" stroke="#34d399" fill="#34d399" fillOpacity={0.3} strokeWidth={3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="relative mt-4 space-y-2">
            {radarData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-background/30 border border-border/30">
                <span className="text-xs font-medium text-muted-foreground">{item.metric}</span>
                <span className="text-sm font-bold text-success">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "Active Sensors", value: "6", status: "success", icon: Wifi, subtitle: "Online" },
          { label: "Data Points/sec", value: "1,240", status: "primary", icon: TrendingUp, subtitle: "Throughput" },
          { label: "Network Latency", value: "12ms", status: "success", icon: Zap, subtitle: "Response" },
          { label: "Alerts", value: "2", status: "destructive", icon: AlertTriangle, subtitle: "Active" },
          { label: "Uptime", value: "99.8%", status: "success", icon: CheckCircle2, subtitle: "Reliability" },
          { label: "Power", value: "850kW", status: "primary", icon: Battery, subtitle: "Consumption" },
        ].map((stat, idx) => {
          const bgClass = stat.status === 'success' ? 'from-success/20 to-emerald-600/20' : stat.status === 'primary' ? 'from-primary/20 to-cyan-500/20' : 'from-destructive/20 to-red-600/20';
          const borderClass = stat.status === 'success' ? 'border-success/40' : stat.status === 'primary' ? 'border-primary/40' : 'border-destructive/40';
          const textClass = stat.status === 'success' ? 'text-success' : stat.status === 'primary' ? 'text-primary' : 'text-destructive';
          const iconBg = stat.status === 'success' ? 'from-success to-emerald-600' : stat.status === 'primary' ? 'from-primary to-cyan-500' : 'from-destructive to-red-600';
          
          return (
            <div 
              key={stat.label} 
              className={`relative group glass-card p-5 rounded-2xl border ${borderClass} text-center transition-all duration-500 hover:scale-[1.02] hover:shadow-lg overflow-hidden cursor-pointer`}
              style={{ 
                animationDelay: `${idx * 100}ms`,
                transform: 'perspective(1000px) rotateX(0deg)'
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${bgClass} opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/3 rounded-full blur-2xl transition-all duration-500" />
              
              <div className="relative">
                <div className="flex justify-center mb-4">
                  <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <p className={`text-3xl font-bold font-mono ${textClass} mb-2 group-hover:scale-105 transition-transform duration-300`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${textClass} bg-background/50 border ${borderClass}`}>
                  {stat.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      

    </div>
  );
}
