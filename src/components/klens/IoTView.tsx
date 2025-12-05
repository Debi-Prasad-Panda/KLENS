import { useState, useEffect } from "react";
import { 
  Radio, 
  Thermometer, 
  Gauge, 
  Activity, 
  Wifi,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

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

  useEffect(() => {
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

    return () => clearInterval(interval);
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
      id: "vibro-monitor",
      name: "Track Vibro-Monitor",
      location: "Station 12 - Track Section",
      status: "alert",
      readings: [
        { label: "Vibration", value: `${currentVibration}g`, max: 5, current: currentVibration, unit: "g", icon: Activity, warning: currentVibration > 4 },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-time Telemetry</h2>
          <p className="text-muted-foreground mt-1">Station 12 - Live Sensor Network</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass-card">
          <Radio className="w-4 h-4 text-success animate-pulse" />
          <span className="text-sm font-mono">
            <span className="text-muted-foreground">UNS:</span>{" "}
            <span className="text-success">CONNECTED</span>
          </span>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sensors.map((sensor) => (
          <div
            key={sensor.id}
            className={`sensor-card ${sensor.status === "alert" ? "sensor-card-alert border-destructive/50" : ""}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold">{sensor.name}</h3>
                <p className="text-sm text-muted-foreground">{sensor.location}</p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                sensor.status === "online" 
                  ? "bg-success/20 text-success" 
                  : "bg-destructive/20 text-destructive"
              }`}>
                {sensor.status === "online" ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Online</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Alert</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {sensor.readings.map((reading) => (
                <div key={reading.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <reading.icon className={`w-4 h-4 ${reading.warning ? "text-destructive" : "text-primary"}`} />
                      <span className="text-sm text-muted-foreground">{reading.label}</span>
                    </div>
                    <span className={`font-mono font-semibold ${reading.warning ? "text-destructive" : "text-foreground"}`}>
                      {reading.value}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        reading.warning 
                          ? "bg-gradient-to-r from-warning to-destructive" 
                          : "bg-gradient-to-r from-primary to-success"
                      }`}
                      style={{ width: `${(reading.current / reading.max) * 100}%` }}
                    />
                  </div>
                  {reading.warning && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {reading.label} exceeds safe threshold
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Live Graph */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold">Live Sensor Data</h3>
            <p className="text-sm text-muted-foreground">Real-time streaming from Boiler B7</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Temperature</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-xs text-muted-foreground">Pressure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground">Vibration</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222 47% 6%)', 
                  border: '1px solid hsl(217 33% 17%)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="temp" 
                stroke="#22d3ee" 
                strokeWidth={2}
                dot={false}
                name="Temperature"
              />
              <Line 
                type="monotone" 
                dataKey="pressure" 
                stroke="#34d399" 
                strokeWidth={2}
                dot={false}
                name="Pressure"
              />
              <Line 
                type="monotone" 
                dataKey="vibration" 
                stroke="#f43f5e" 
                strokeWidth={2}
                dot={false}
                name="Vibration"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Sensors", value: "24", status: "success" },
          { label: "Data Points/sec", value: "1,240", status: "primary" },
          { label: "Network Latency", value: "12ms", status: "success" },
          { label: "Alerts Today", value: "3", status: "destructive" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <p className={`text-2xl font-bold font-mono text-${stat.status}`}>{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
