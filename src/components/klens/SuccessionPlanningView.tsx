import { useState } from "react";
import {
  Users, UserPlus, Search, Filter, TrendingUp, Award, Target, Calendar,
  Briefcase, GraduationCap, Star, AlertTriangle, CheckCircle2, Clock,
  BarChart3, Activity, Zap, Shield, FileText, Download, Eye, Edit, Mail,
  Phone, MapPin, Building, Layers, Brain, Trophy, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const employees = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Senior Engineer",
    department: "Operations",
    email: "rajesh.k@klens.com",
    phone: "+91 98765 43210",
    location: "Vizag Plant",
    avatar: "RK",
    status: "active",
    performance: 92,
    experience: "8 years",
    skills: ["Boiler Operations", "Safety Compliance", "Team Leadership"],
    certifications: ["ISO 9001", "OSHA Certified"],
    successorReady: true,
    riskLevel: "low",
    projects: 12,
    completionRate: 94,
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Safety Officer",
    department: "Safety",
    email: "priya.s@klens.com",
    phone: "+91 98765 43211",
    location: "Vizag Plant",
    avatar: "PS",
    status: "active",
    performance: 88,
    experience: "5 years",
    skills: ["Risk Assessment", "Incident Management", "Training"],
    certifications: ["NEBOSH", "Fire Safety"],
    successorReady: false,
    riskLevel: "high",
    projects: 8,
    completionRate: 91,
  },
  {
    id: 3,
    name: "Amit Patel",
    role: "Maintenance Lead",
    department: "Maintenance",
    email: "amit.p@klens.com",
    phone: "+91 98765 43212",
    location: "Vizag Plant",
    avatar: "AP",
    status: "active",
    performance: 95,
    experience: "10 years",
    skills: ["Predictive Maintenance", "Equipment Repair", "Vendor Management"],
    certifications: ["Mechanical Engineering", "PMP"],
    successorReady: true,
    riskLevel: "low",
    projects: 15,
    completionRate: 96,
  },
  {
    id: 4,
    name: "Sarah Chen",
    role: "Quality Manager",
    department: "Quality",
    email: "sarah.c@klens.com",
    phone: "+91 98765 43213",
    location: "Vizag Plant",
    avatar: "SC",
    status: "active",
    performance: 90,
    experience: "6 years",
    skills: ["Quality Control", "Six Sigma", "Process Improvement"],
    certifications: ["Six Sigma Black Belt", "ISO Lead Auditor"],
    successorReady: false,
    riskLevel: "medium",
    projects: 10,
    completionRate: 93,
  },
  {
    id: 5,
    name: "Vikram Singh",
    role: "Production Supervisor",
    department: "Production",
    email: "vikram.s@klens.com",
    phone: "+91 98765 43214",
    location: "Vizag Plant",
    avatar: "VS",
    status: "active",
    performance: 87,
    experience: "7 years",
    skills: ["Production Planning", "Lean Manufacturing", "Team Management"],
    certifications: ["Lean Six Sigma", "Production Management"],
    successorReady: true,
    riskLevel: "low",
    projects: 11,
    completionRate: 89,
  },
  {
    id: 6,
    name: "Anita Desai",
    role: "HR Manager",
    department: "Human Resources",
    email: "anita.d@klens.com",
    phone: "+91 98765 43215",
    location: "Vizag Plant",
    avatar: "AD",
    status: "active",
    performance: 91,
    experience: "9 years",
    skills: ["Talent Management", "Employee Relations", "Compliance"],
    certifications: ["SHRM-CP", "HR Analytics"],
    successorReady: false,
    riskLevel: "medium",
    projects: 7,
    completionRate: 92,
  },
];

const skillsMatrix = [
  { skill: "Boiler Operations", employees: 3, demand: "high", gap: 2 },
  { skill: "Safety Compliance", employees: 5, demand: "high", gap: 0 },
  { skill: "Predictive Maintenance", employees: 2, demand: "medium", gap: 1 },
  { skill: "Quality Control", employees: 4, demand: "high", gap: 1 },
  { skill: "Team Leadership", employees: 6, demand: "high", gap: 0 },
  { skill: "Six Sigma", employees: 2, demand: "medium", gap: 0 },
];

const successionPlan = [
  { position: "Senior Engineer", incumbent: "Rajesh Kumar", successor: "Amit Patel", readiness: 85, timeline: "6 months" },
  { position: "Safety Officer", incumbent: "Priya Sharma", successor: "Not Identified", readiness: 0, timeline: "Critical" },
  { position: "Quality Manager", incumbent: "Sarah Chen", successor: "Vikram Singh", readiness: 60, timeline: "12 months" },
];

export default function SuccessionPlanningView() {
  const [selectedTab, setSelectedTab] = useState<"directory" | "skills" | "succession" | "performance">("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    department: "",
    email: "",
    phone: "",
    location: "Vizag Plant",
  });

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Modern Header */}
      <div className="glass-card p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Workforce Management
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Employee directory, skills tracking, and succession planning
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-success/10 rounded-xl border border-success/30">
              <span className="text-xs text-muted-foreground block">Total Employees</span>
              <span className="text-lg font-bold text-success">{employees.length}</span>
            </div>
            <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/30">
              <span className="text-xs text-muted-foreground block">Avg Performance</span>
              <span className="text-lg font-bold text-primary">90.5%</span>
            </div>
            <button 
              onClick={() => setShowAddEmployee(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 flex items-center gap-2 font-semibold"
            >
              <UserPlus className="w-4 h-4" />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 glass-card p-2 rounded-xl border border-border/50">
        {[
          { id: "directory", label: "Employee Directory", icon: Users },
          { id: "skills", label: "Skills Matrix", icon: Brain },
          { id: "succession", label: "Succession Plan", icon: Target },
          { id: "performance", label: "Performance", icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              selectedTab === tab.id
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Employee Directory Tab */}
      {selectedTab === "directory" && (
        <>
          {/* Search Bar */}
          <div className="glass-card p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search employees by name, role, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button className="px-4 py-2 bg-secondary/50 border border-border rounded-lg hover:bg-secondary flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          {/* Employee Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="glass-card p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                      {emp.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold">{emp.name}</h4>
                      <p className="text-xs text-muted-foreground">{emp.role}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    emp.riskLevel === "high" ? "bg-destructive/20 text-destructive" :
                    emp.riskLevel === "medium" ? "bg-warning/20 text-warning" :
                    "bg-success/20 text-success"
                  }`}>
                    {emp.riskLevel === "high" ? "⚠️ High Risk" : emp.riskLevel === "medium" ? "⚡ Medium" : "✓ Low Risk"}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="w-3 h-3" />
                    {emp.department}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {emp.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {emp.experience}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Performance</span>
                    <span className="font-bold text-primary">{emp.performance}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                      style={{ width: `${emp.performance}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                  <button className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 text-xs font-semibold flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                  <button className="flex-1 px-3 py-2 bg-secondary/50 rounded-lg hover:bg-secondary text-xs font-semibold flex items-center justify-center gap-1">
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Skills Matrix Tab */}
      {selectedTab === "skills" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillsMatrix.map((skill) => (
              <div key={skill.skill} className="glass-card p-5 rounded-xl border border-border/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      skill.gap > 0 ? "bg-warning/20" : "bg-success/20"
                    }`}>
                      <GraduationCap className={`w-5 h-5 ${
                        skill.gap > 0 ? "text-warning" : "text-success"
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-bold">{skill.skill}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        skill.demand === "high" ? "bg-destructive/20 text-destructive" :
                        "bg-primary/20 text-primary"
                      }`}>
                        {skill.demand.toUpperCase()} DEMAND
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Employees</span>
                    <span className="text-2xl font-bold">{skill.employees}</span>
                  </div>
                  {skill.gap > 0 && (
                    <div className="p-3 bg-warning/10 rounded-lg border border-warning/30">
                      <p className="text-xs text-warning font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Skill Gap: {skill.gap} needed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Succession Plan Tab */}
      {selectedTab === "succession" && (
        <div className="space-y-4">
          {successionPlan.map((plan, idx) => (
            <div key={idx} className="glass-card p-6 rounded-xl border border-border/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-lg">{plan.position}</h4>
                  <p className="text-sm text-muted-foreground">Incumbent: {plan.incumbent}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  plan.readiness === 0 ? "bg-destructive/20 text-destructive" :
                  plan.readiness < 70 ? "bg-warning/20 text-warning" :
                  "bg-success/20 text-success"
                }`}>
                  {plan.readiness === 0 ? "⚠️ Critical" : `${plan.readiness}% Ready`}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Identified Successor</p>
                  <p className="font-semibold text-lg">{plan.successor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Timeline</p>
                  <p className="font-semibold text-lg">{plan.timeline}</p>
                </div>
              </div>

              {plan.readiness > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Readiness Level</span>
                    <span className="font-bold">{plan.readiness}%</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        plan.readiness < 70 ? "bg-warning" : "bg-success"
                      }`}
                      style={{ width: `${plan.readiness}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Performance Tab */}
      {selectedTab === "performance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div key={emp.id} className="glass-card p-5 rounded-xl border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {emp.avatar}
                </div>
                <div>
                  <h4 className="font-bold">{emp.name}</h4>
                  <p className="text-xs text-muted-foreground">{emp.role}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Performance</span>
                  <span className="text-xl font-bold text-primary">{emp.performance}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                    style={{ width: `${emp.performance}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Projects</p>
                    <p className="text-lg font-bold">{emp.projects}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completion</p>
                    <p className="text-lg font-bold text-success">{emp.completionRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 max-w-2xl w-full rounded-2xl border border-primary/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Add New Employee</h3>
              </div>
              <button
                onClick={() => setShowAddEmployee(false)}
                className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Role *</label>
                  <input
                    type="text"
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    placeholder="Senior Engineer"
                    className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Department *</label>
                  <select
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Department</option>
                    <option value="Operations">Operations</option>
                    <option value="Safety">Safety</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Quality">Quality</option>
                    <option value="Production">Production</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Location</label>
                  <input
                    type="text"
                    value={newEmployee.location}
                    onChange={(e) => setNewEmployee({ ...newEmployee, location: e.target.value })}
                    className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Email *</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="john.doe@klens.com"
                    className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddEmployee(false)}
                  className="flex-1 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newEmployee.name || !newEmployee.role || !newEmployee.department || !newEmployee.email) {
                      toast({
                        variant: "destructive",
                        title: "Missing Fields",
                        description: "Please fill in all required fields (*)",
                      });
                      return;
                    }
                    toast({
                      title: "Employee Added",
                      description: `${newEmployee.name} has been added to the workforce.`,
                    });
                    setShowAddEmployee(false);
                    setNewEmployee({
                      name: "",
                      role: "",
                      department: "",
                      email: "",
                      phone: "",
                      location: "Vizag Plant",
                    });
                  }}
                  className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
                >
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 max-w-2xl w-full rounded-2xl border border-primary/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {selectedEmployee.avatar}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80"
              >
                Close
              </button>
            </div>

            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedEmployee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedEmployee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedEmployee.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedEmployee.location}</span>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-success" />
                  Certifications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.certifications.map((cert, idx) => (
                    <span key={idx} className="px-3 py-1 bg-success/10 text-success rounded-lg text-sm font-medium">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-xl">
                  <p className="text-3xl font-bold text-primary">{selectedEmployee.performance}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Performance</p>
                </div>
                <div className="text-center p-4 bg-success/10 rounded-xl">
                  <p className="text-3xl font-bold text-success">{selectedEmployee.projects}</p>
                  <p className="text-xs text-muted-foreground mt-1">Projects</p>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-xl">
                  <p className="text-3xl font-bold text-purple-500">{selectedEmployee.completionRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Completion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
