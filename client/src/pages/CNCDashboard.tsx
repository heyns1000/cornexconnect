import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Cpu,
  Play,
  Square,
  Home,
  Zap,
  ZapOff,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

type MachineStatus = "idle" | "running" | "stopped" | "homing";

interface CNCProfile {
  id: string;
  code: string;
  label: string;
  fullName: string;
  category: string;
  dimensions: string;
  tapFile: string | null;
  available: boolean;
}

interface RunLogEntry {
  time: string;
  message: string;
  type: "start" | "stop" | "home" | "complete" | "info" | "select";
}

const CATEGORY_COLORS: Record<string, string> = {
  "XPS 2M": "border-l-blue-500",
  "CASA 110mm": "border-l-emerald-500",
  "CASA 140mm": "border-l-amber-500",
  "Specialty": "border-l-purple-500",
  "Premium": "border-l-rose-500",
};

const CATEGORY_BG: Record<string, string> = {
  "XPS 2M": "bg-blue-500",
  "CASA 110mm": "bg-emerald-500",
  "CASA 140mm": "bg-amber-500",
  "Specialty": "bg-purple-500",
  "Premium": "bg-rose-500",
};

const CNC_PROFILES: CNCProfile[] = [
  { id: "CAS-BR01", code: "CAS-BR01", label: "BR01", fullName: "BR01 XPS CONICE 2M 95X95X130MM", category: "XPS 2M", dimensions: "95x95x130mm", tapFile: null, available: false },
  { id: "CAS-BR02", code: "CAS-BR02", label: "BR02", fullName: "BR02 XPS CONICE 2M 80X80X110MM", category: "XPS 2M", dimensions: "80x80x110mm", tapFile: null, available: false },
  { id: "CAS-BR03", code: "CAS-BR03", label: "BR03", fullName: "BR03 XPS CONICE 2M 85X85X115MM", category: "XPS 2M", dimensions: "85x85x115mm", tapFile: null, available: false },
  { id: "CAS-BR04", code: "CAS-BR04", label: "BR04", fullName: "BR04 XPS CONICE 2M 90X90X120MM", category: "XPS 2M", dimensions: "90x90x120mm", tapFile: null, available: false },
  { id: "CAS-BR06", code: "CAS-BR06", label: "BR06", fullName: "BR06 XPS CONICE 2M 75X75X105MM", category: "XPS 2M", dimensions: "75x75x105mm", tapFile: null, available: false },
  { id: "CAS-BR07", code: "CAS-BR07", label: "BR07", fullName: "BR07 XPS CONICE 2M 80X80X110MM", category: "XPS 2M", dimensions: "80x80x110mm", tapFile: null, available: false },
  { id: "CAS-BR08", code: "CAS-BR08", label: "BR08", fullName: "BR08 XPS CONICE 2M 80X80X110MM", category: "XPS 2M", dimensions: "80x80x110mm", tapFile: null, available: false },
  { id: "CAS-BR09", code: "CAS-BR09", label: "BR09", fullName: "BR09 XPS CONICE 2M 100X100X140MM", category: "XPS 2M", dimensions: "100x100x140mm", tapFile: null, available: false },
  { id: "CAS-BR10", code: "CAS-BR10", label: "BR10", fullName: "BR10 XPS CONICE 2M 100X100X140MM", category: "XPS 2M", dimensions: "100x100x140mm", tapFile: null, available: false },
  { id: "CAS-BR11", code: "CAS-BR11", label: "BR11", fullName: "BR11 XPS CONICE 2M 130X130X170MM", category: "XPS 2M", dimensions: "130x130x170mm", tapFile: null, available: false },
  { id: "CAS-BR12", code: "CAS-BR12", label: "BR12", fullName: "BR12 XPS CONICE 2M 60X60X85MM", category: "XPS 2M", dimensions: "60x60x85mm", tapFile: null, available: false },
  { id: "CAS-BR13", code: "CAS-BR13", label: "BR13", fullName: "BR13 XPS CONICE 2M 60X60X85MM", category: "XPS 2M", dimensions: "60x60x85mm", tapFile: null, available: false },
  { id: "CAS02", code: "CAS02", label: "PERONI", fullName: "EPS CORNICE PERONI CUT 110MM", category: "CASA 110mm", dimensions: "80x80x110mm", tapFile: null, available: false },
  { id: "CAS03", code: "CAS03", label: "MAGIC", fullName: "EPS CORNICE MAGIC CUT 110MM", category: "CASA 110mm", dimensions: "80x80x110mm", tapFile: null, available: false },
  { id: "CAS04", code: "CAS04", label: "G-ONE", fullName: "EPS CORNICE G-ONE CUT 110MM", category: "CASA 110mm", dimensions: "80x80x110mm", tapFile: null, available: false },
  { id: "CAS05", code: "CAS05", label: "ALINA", fullName: "EPS CORNICE ALINA CUT 110MM", category: "CASA 110mm", dimensions: "80x80x110mm", tapFile: null, available: false },
  { id: "CAS12", code: "CAS12", label: "COLONIAL", fullName: "EPS CORNICE COLONIAL CUT 110MM", category: "CASA 110mm", dimensions: "80x80x110mm", tapFile: null, available: false },
  { id: "CAS13", code: "CAS13", label: "TAMARA", fullName: "EPS CORNICE TAMARA CUT 110MM", category: "CASA 110mm", dimensions: "80x80x110mm", tapFile: null, available: false },
  { id: "CAS06", code: "CAS06", label: "BIANCE", fullName: "EPS CORNICE BIANCE CUT 140MM", category: "CASA 140mm", dimensions: "100x100x140mm", tapFile: null, available: false },
  { id: "CAS07", code: "CAS07", label: "P40/EVE", fullName: "EPS CORNICE P40/EVE CUT 140MM", category: "CASA 140mm", dimensions: "100x100x140mm", tapFile: null, available: false },
  { id: "CAS08", code: "CAS08", label: "TAMARA", fullName: "EPS CORNICE TAMARA CUT 140MM", category: "CASA 140mm", dimensions: "100x100x140mm", tapFile: null, available: false },
  { id: "CAS11", code: "CAS11", label: "TROY", fullName: "EPS CORNICE TROY CUT 140MM", category: "CASA 140mm", dimensions: "100x100x140mm", tapFile: null, available: false },
  { id: "CAS15", code: "CAS15", label: "ALINA", fullName: "EPS CORNICE ALINA 140MM", category: "CASA 140mm", dimensions: "100x100x140mm", tapFile: null, available: false },
  { id: "CAS01", code: "CAS01", label: "COVE", fullName: "EPS CORNICE COVE CUT 85MM", category: "Specialty", dimensions: "55x55x85mm", tapFile: null, available: false },
  { id: "CAS10", code: "CAS10", label: "SANTE", fullName: "EPS CORNICE SANTE CUT 75MM", category: "Specialty", dimensions: "50x50x75mm", tapFile: null, available: false },
  { id: "CAS14", code: "CAS14", label: "EC-03", fullName: "EPS CORNICE EC-03 CUT 75MM", category: "Specialty", dimensions: "50x50x75mm", tapFile: null, available: false },
  { id: "NT108", code: "NT108", label: "NT108", fullName: "NT108 EPS 110MM WAVE PROFILE", category: "Premium", dimensions: "110mm Y-axis", tapFile: "NT108_EPS.tap", available: true },
];

const NT108_GCODE = `(FILENAME: NT108_EPS.tap)
(FULL 28 UNIT PRODUCTION - SPEED F600)
G90 G80 G49
G92 X0.0000 Y0.0000
M3
F600.000

(UNIT 1)
G0 X10.0 Y0.0
G1 X0.0 Y15.0
G1 X0.0 Y29.0
G1 X10.0 Y79.0
G1 X10.0 Y97.0
G1 X0.0 Y110.0
G1 X10.0 Y110.0
G1 X20.0 Y97.0
G1 X20.0 Y79.0
G1 X10.0 Y29.0
G1 X10.0 Y15.0
G1 X20.0 Y0.0

(UNIT 2)
G0 X35.0 Y0.0
G1 X25.0 Y15.0
G1 X25.0 Y29.0
G1 X35.0 Y79.0
G1 X35.0 Y97.0
G1 X25.0 Y110.0
G1 X35.0 Y110.0
G1 X45.0 Y97.0
G1 X45.0 Y79.0
G1 X35.0 Y29.0
G1 X35.0 Y15.0
G1 X45.0 Y0.0

(UNIT 3)
G0 X60.0 Y0.0
G1 X50.0 Y15.0
G1 X50.0 Y29.0
G1 X60.0 Y79.0
G1 X60.0 Y97.0
G1 X50.0 Y110.0
G1 X60.0 Y110.0
G1 X70.0 Y97.0
G1 X70.0 Y79.0
G1 X60.0 Y29.0
G1 X60.0 Y15.0
G1 X70.0 Y0.0

(UNIT 4 - 28 CONTINUED...)
M5 (Wire Heat Off)
G0 X0 Y0 (Home)
M30 (Program End)`;

const UNIT1_PATH: [number, number][] = [
  [10, 0], [0, 15], [0, 29], [10, 79], [10, 97], [0, 110],
  [10, 110], [20, 97], [20, 79], [10, 29], [10, 15], [20, 0],
];

function ProfileSVG({ className }: { className?: string }) {
  const points = UNIT1_PATH.map(([x, y]) => `${x * 4 + 10},${(110 - y) * 1.6 + 10}`).join(" ");
  return (
    <svg viewBox="0 0 100 190" className={cn("w-full h-full", className)}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="10" y1="186" x2="90" y2="186" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <text x="50" y="195" textAnchor="middle" fill="currentColor" fontSize="6" opacity="0.5">0mm</text>
      <line x1="10" y1="10" x2="90" y2="10" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <text x="50" y="7" textAnchor="middle" fill="currentColor" fontSize="6" opacity="0.5">110mm</text>
    </svg>
  );
}

function getTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-ZA", { hour12: false });
}

const STATUS_CONFIG: Record<MachineStatus, { label: string; color: string; bg: string; icon: typeof Activity }> = {
  idle: { label: "IDLE", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/50", icon: CheckCircle },
  running: { label: "RUNNING", color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/50", icon: Activity },
  stopped: { label: "STOPPED", color: "text-red-400", bg: "bg-red-500/20 border-red-500/50", icon: XCircle },
  homing: { label: "HOMING", color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/50", icon: Home },
};

export default function CNCDashboard() {
  const { toast } = useToast();
  const [machineStatus, setMachineStatus] = useState<MachineStatus>("idle");
  const [selectedProfile, setSelectedProfile] = useState<CNCProfile | null>(null);
  const [runLog, setRunLog] = useState<RunLogEntry[]>([]);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = useCallback((message: string, type: RunLogEntry["type"]) => {
    setRunLog(prev => [{ time: getTimestamp(), message, type }, ...prev].slice(0, 50));
  }, []);

  const clearSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => clearSimulation(), [clearSimulation]);

  const handleSelectProfile = (profile: CNCProfile) => {
    if (!profile.available) {
      toast({ title: "TAP File Pending", description: `${profile.label} — file not yet loaded`, variant: "destructive" });
      return;
    }
    setSelectedProfile(profile);
    addLog(`Selected: ${profile.label} (${profile.fullName})`, "select");
    toast({ title: "Profile Selected", description: `${profile.label} — ${profile.dimensions}` });
  };

  const handleStart = () => {
    if (!selectedProfile || machineStatus === "running") return;
    setMachineStatus("running");
    setSimulationProgress(0);
    addLog(`START — ${selectedProfile.label} @ F600`, "start");
    toast({ title: "Machine Starting", description: `Cutting ${selectedProfile.label} at F600 mm/min` });

    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += 2;
      setSimulationProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearSimulation();
        setMachineStatus("idle");
        setSimulationProgress(100);
        addLog(`COMPLETE — 28 units cut successfully`, "complete");
      }
    }, 200);
  };

  const handleStop = () => {
    if (machineStatus !== "running") return;
    clearSimulation();
    setMachineStatus("stopped");
    setSimulationProgress(0);
    addLog("EMERGENCY STOP", "stop");
    toast({ title: "EMERGENCY STOP", description: "Machine halted", variant: "destructive" });
  };

  const handleHome = () => {
    clearSimulation();
    setMachineStatus("homing");
    setSimulationProgress(0);
    addLog("HOME — Returning to origin", "home");
    toast({ title: "Homing", description: "Machine returning to X0 Y0" });
    setTimeout(() => setMachineStatus("idle"), 1500);
  };

  const statusCfg = STATUS_CONFIG[machineStatus];
  const StatusIcon = statusCfg.icon;
  const categories = useMemo(() => [...new Set(CNC_PROFILES.map(p => p.category))], []);

  const currentUnit = machineStatus === "running" ? Math.min(Math.ceil((simulationProgress / 100) * 28), 28) : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-950 border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-xl border border-white/10">
              <Cpu className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter uppercase">CNC HOT WIRE CUTTER</h1>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Silverton Workshop — Mach3 Control Interface</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={cn("flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all", statusCfg.bg)}>
              <StatusIcon className={cn("w-6 h-6", statusCfg.color, machineStatus === "running" && "animate-pulse")} />
              <span className={cn("text-lg font-black uppercase tracking-wider", statusCfg.color)}>{statusCfg.label}</span>
            </div>
            <div className="bg-slate-800 px-4 py-3 rounded-xl border border-white/10 text-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase block">Speed</span>
              <span className="text-xl font-black text-orange-400 italic">F600</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Profile Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black uppercase tracking-tighter italic">Select Profile</h2>
              <div className="flex gap-2 ml-4">
                {categories.map(cat => (
                  <span key={cat} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    <span className={cn("w-2.5 h-2.5 rounded-sm", CATEGORY_BG[cat])} />
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {CNC_PROFILES.map(profile => {
                const isSelected = selectedProfile?.id === profile.id;
                return (
                  <button
                    key={profile.id}
                    onClick={() => handleSelectProfile(profile)}
                    className={cn(
                      "relative text-left p-4 rounded-xl border-l-4 transition-all min-h-[88px]",
                      CATEGORY_COLORS[profile.category],
                      profile.available
                        ? "bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-white/20 cursor-pointer"
                        : "bg-slate-800/40 border border-white/5 opacity-50 cursor-pointer",
                      isSelected && "ring-2 ring-emerald-400 bg-emerald-950/30 scale-[1.03] shadow-lg shadow-emerald-500/10"
                    )}
                  >
                    <div className="font-black text-lg tracking-tight uppercase leading-none mb-1">
                      {profile.label}
                    </div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase truncate">{profile.dimensions}</div>
                    {!profile.available && (
                      <span className="absolute top-2 right-2 text-[7px] font-black bg-slate-600 text-slate-300 px-1.5 py-0.5 rounded uppercase">
                        PENDING
                      </span>
                    )}
                    {profile.available && (
                      <span className="absolute top-2 right-2 text-[7px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase">
                        READY
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* G-code Viewer */}
            <Card className="bg-slate-950 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  G-CODE VIEWER
                  {selectedProfile && (
                    <Badge variant="outline" className="ml-2 text-emerald-400 border-emerald-500/30">
                      {selectedProfile.tapFile || "No file"}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px] rounded-lg">
                  {selectedProfile?.available ? (
                    <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap p-4">
                      {NT108_GCODE}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[260px] text-slate-600">
                      <ZapOff className="w-12 h-12 mb-4" />
                      <span className="text-sm font-bold uppercase tracking-widest">
                        {selectedProfile ? "TAP FILE PENDING" : "SELECT A PROFILE"}
                      </span>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right: Status + Preview + Log */}
          <div className="space-y-6">
            {/* Machine Status Card */}
            <Card className="bg-slate-800 border-white/10">
              <CardContent className="p-6">
                <div className="text-center">
                  <StatusIcon className={cn("w-16 h-16 mx-auto mb-4", statusCfg.color, machineStatus === "running" && "animate-pulse")} />
                  <h3 className={cn("text-3xl font-black uppercase tracking-tighter mb-2", statusCfg.color)}>
                    {statusCfg.label}
                  </h3>
                  {machineStatus === "running" && (
                    <div className="mt-4 space-y-3">
                      <Progress value={simulationProgress} className="h-3 bg-slate-700" />
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-amber-400">Unit {currentUnit}/28</span>
                        <span className="text-slate-400">{simulationProgress}%</span>
                      </div>
                    </div>
                  )}
                  {machineStatus === "idle" && simulationProgress === 100 && (
                    <div className="mt-4 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      28 UNITS COMPLETE
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selected Profile */}
            {selectedProfile && (
              <Card className="bg-slate-800 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Active Profile</span>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter mt-1">{selectedProfile.label}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{selectedProfile.fullName}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge className={cn("text-[8px]", CATEGORY_BG[selectedProfile.category], "text-white border-0")}>
                          {selectedProfile.category}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate-500">{selectedProfile.dimensions}</span>
                      </div>
                    </div>
                    {selectedProfile.available && (
                      <div className="w-20 h-28 text-emerald-400">
                        <ProfileSVG />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SVG Profile Preview */}
            {selectedProfile?.available && (
              <Card className="bg-slate-950 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    CUT PROFILE PREVIEW — UNIT 1
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] text-emerald-400 flex items-center justify-center">
                    <ProfileSVG className="h-full w-auto" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Run Log */}
            <Card className="bg-slate-800 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  RUN LOG
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  {runLog.length === 0 ? (
                    <div className="text-center text-slate-600 text-sm font-bold uppercase py-8">No activity</div>
                  ) : (
                    <div className="space-y-2">
                      {runLog.map((entry, i) => (
                        <div key={i} className="flex items-start gap-3 text-[11px] font-mono">
                          <span className="text-slate-600 shrink-0">{entry.time}</span>
                          <span className={cn(
                            "font-bold",
                            entry.type === "start" && "text-emerald-400",
                            entry.type === "complete" && "text-emerald-300",
                            entry.type === "stop" && "text-red-400",
                            entry.type === "home" && "text-blue-400",
                            entry.type === "select" && "text-slate-400",
                            entry.type === "info" && "text-slate-500",
                          )}>
                            {entry.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950 border-t-2 border-white/10 px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex items-center justify-center gap-6">
          <Button
            onClick={handleHome}
            className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white text-lg font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95"
          >
            <Home className="w-7 h-7 mr-3" />
            HOME
          </Button>

          <Button
            onClick={handleStart}
            disabled={!selectedProfile?.available || machineStatus === "running"}
            className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-lg font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95"
          >
            <Play className="w-7 h-7 mr-3" />
            START
          </Button>

          <Button
            onClick={handleStop}
            disabled={machineStatus !== "running"}
            className="h-16 px-10 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-lg font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95"
          >
            <Square className="w-7 h-7 mr-3" />
            STOP
          </Button>

          <div className="ml-6 bg-slate-800 px-5 py-3 rounded-xl border border-orange-500/30">
            <span className="text-[8px] font-bold text-slate-500 uppercase block">FEED RATE</span>
            <span className="text-xl font-black text-orange-400 italic">F600</span>
            <span className="text-[8px] font-bold text-slate-500 block">LOCKED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
