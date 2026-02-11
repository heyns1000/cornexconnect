import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  createCNCjsClient,
  getCNCjsClient,
  loadCNCjsSettings,
  saveCNCjsSettings,
  type CNCjsConfig,
  type MachineState,
} from "@/lib/cncjs";
import {
  Play,
  Pause,
  RotateCcw,
  Upload,
  Square,
  CheckCircle2,
  Cpu,
  Wifi,
  WifiOff,
  Settings,
  X,
  ChevronLeft,
  Loader2,
  Home,
  Unlock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

// ===== MASTER PROFILE REGISTRY =====
interface CNCProfile {
  id: string;
  name: string;
  displayName: string;
  filename: string;
  height: number;
  material: "EPS" | "XPS" | "EPS Thin";
  lengths: number | null;
  feedRate: number;
  units: number;
  hasGCode: boolean;
  category: string;
}

const MASTER_PROFILES: Omit<CNCProfile, "hasGCode">[] = [
  // 85mm
  { id: "cove85-eps", name: "Cove85 EPS", displayName: "Cove 85mm EPS", filename: "Cove85 EPS.tap", height: 85, material: "EPS", lengths: 168, feedRate: 600, units: 28, category: "85mm" },
  { id: "cove85-xps", name: "Cove85 XPS", displayName: "Cove 85mm XPS", filename: "Cove85 XPS.tap", height: 85, material: "XPS", lengths: 168, feedRate: 600, units: 28, category: "85mm" },
  { id: "sante85-eps", name: "Sante85 EPS", displayName: "Sante 85mm EPS", filename: "Sante85EPS.tap", height: 85, material: "EPS", lengths: 168, feedRate: 600, units: 28, category: "85mm" },
  { id: "sante85-xps", name: "Sante85 XPS", displayName: "Sante 85mm XPS", filename: "Sante85XPS.tap", height: 85, material: "XPS", lengths: 168, feedRate: 600, units: 28, category: "85mm" },
  // 110mm
  { id: "alina110-eps", name: "Alina110 EPS", displayName: "Alina 110mm EPS", filename: "Alina110 EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "alina110-xps", name: "Alina110 XPS", displayName: "Alina 110mm XPS", filename: "Alina110 XPS.tap", height: 110, material: "XPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "alina-eps", name: "Alina EPS", displayName: "Alina EPS (Themba)", filename: "Alina EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "biance110-eps", name: "Biance110 EPS", displayName: "Magic (Biance) 110mm EPS", filename: "Biance110 EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "biance110-xps", name: "Biance110 XPS", displayName: "Magic (Biance) 110mm XPS", filename: "Biance110 XPS.tap", height: 110, material: "XPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "biance-eps", name: "Biance EPS", displayName: "Magic (Biance) EPS (Themba)", filename: "Biance EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "colonial110-eps", name: "Colonial 110 EPS", displayName: "Colonial 110mm EPS", filename: "Colonial 110 EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "colonial110-xps", name: "Colonial 110 XPS", displayName: "Colonial 110mm XPS", filename: "Colonial 110 XPS.tap", height: 110, material: "XPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "gloria110-eps", name: "Gloria110 EPS", displayName: "Gloria 110mm EPS", filename: "Gloria110 EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "gloria110-xps", name: "Gloria110 XPS", displayName: "Gloria 110mm XPS", filename: "Gloria110 XPS.tap", height: 110, material: "XPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "peroni110-xps", name: "Peroni 110 XPS", displayName: "Peroni 110mm XPS", filename: "Peroni 110 XPS .tap", height: 110, material: "XPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "peroni110-eps", name: "Peroni 110", displayName: "Peroni 110mm EPS", filename: "Peroni 110.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "g1home110-epsthin", name: "G1Homepack110 EPS Thin", displayName: "G1 Homepack 110mm EPS Thin", filename: "G1Homepack110EPSThin.tap", height: 110, material: "EPS Thin", lengths: null, feedRate: 600, units: 28, category: "110mm" },
  { id: "g1home110-xpsthin", name: "G1Homepack110 XPS Thin", displayName: "G1 Homepack 110mm XPS Thin", filename: "G1Homepack110XPSThin.tap", height: 110, material: "XPS", lengths: null, feedRate: 600, units: 28, category: "110mm" },
  { id: "tamara110-eps", name: "Tamara110 EPS", displayName: "Tamara 110mm EPS", filename: "Tamara110 EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "nt108-eps", name: "NT108 EPS", displayName: "NT108 Wavy 110mm EPS", filename: "NT108_EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  // 140mm
  { id: "tamara140-epsthin", name: "Tamara140 EPS Thin", displayName: "Tamara 140mm EPS Thin (New)", filename: "Tamara140 EPSThinnew.tap", height: 140, material: "EPS Thin", lengths: 112, feedRate: 600, units: 28, category: "140mm" },
  { id: "p40-140-eps", name: "P40 140 EPS", displayName: "P40 (Eve) 140mm EPS", filename: "P40140EPS.tap", height: 140, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "140mm" },
  { id: "troy140-eps", name: "Troy140 EPS", displayName: "Troy 140mm EPS", filename: "Troy140 EPS.tap", height: 140, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "140mm" },
  // 170mm+
  { id: "lisa170-epsthin", name: "Lisa170 EPSThin", displayName: "Lisa 170mm EPS Thin", filename: "Lisa170 EPSThin.tap", height: 170, material: "EPS Thin", lengths: 84, feedRate: 600, units: 28, category: "170mm+" },
  { id: "gloria185-epsthin", name: "Gloria185 EPSThin", displayName: "Gloria 185mm EPS Thin", filename: "Gloria185 EPSThin.tap", height: 185, material: "EPS Thin", lengths: 84, feedRate: 600, units: 28, category: "170mm+" },
];

// ===== VIEW STATES =====
type View = "connect" | "profiles" | "control";

export default function CNCDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Connection state
  const [view, setView] = useState<View>("connect");
  const [cncjsHost, setCncjsHost] = useState("192.168.1.100");
  const [cncjsPort, setCncjsPort] = useState("8000");
  const [cncjsToken, setCncjsToken] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [machineState, setMachineState] = useState<MachineState | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Job state
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sendingGCode, setSendingGCode] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    const saved = loadCNCjsSettings();
    if (saved) {
      setCncjsHost(saved.host || "192.168.1.100");
      setCncjsPort(String(saved.port || 8000));
      setCncjsToken(saved.token || "");
    }
  }, []);

  // Machine state listener
  const handleMachineState = useCallback((state: MachineState) => {
    setMachineState(state);
  }, []);

  const handleConnection = useCallback((connected: boolean) => {
    setWsConnected(connected);
    if (connected) {
      setConnecting(false);
    }
  }, []);

  // Fetch loaded TAP files
  const { data: loadedFiles = [] } = useQuery<string[]>({
    queryKey: ["/api/cnc/loaded-files"],
    queryFn: async () => {
      const res = await fetch("/api/cnc/loaded-files");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const profiles: CNCProfile[] = MASTER_PROFILES.map((p) => ({
    ...p,
    hasGCode: loadedFiles.includes(p.filename),
  }));

  const selected = profiles.find((p) => p.id === selectedProfile);
  const categories = ["all", "85mm", "110mm", "140mm", "170mm+"];
  const filteredProfiles = filterCategory === "all" ? profiles : profiles.filter((p) => p.category === filterCategory);

  // Upload TAP file
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("tapFile", file);
      const res = await fetch("/api/cnc/upload-tap", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cnc/loaded-files"] });
      toast({ title: "G-Code Loaded", description: `${data.filename} uploaded` });
    },
    onError: (err: Error) => {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.name.endsWith(".tap") || file.name.endsWith(".nc") || file.name.endsWith(".txt")) {
        uploadMutation.mutate(file);
      } else {
        toast({ title: "Invalid File", description: "Only .tap, .nc, or .txt files", variant: "destructive" });
      }
    });
    e.target.value = "";
  };

  // ===== CONNECT TO CNCjs =====
  const handleConnect = async () => {
    setConnecting(true);
    const config: CNCjsConfig = {
      host: cncjsHost,
      port: parseInt(cncjsPort) || 8000,
      token: cncjsToken || undefined,
    };
    saveCNCjsSettings(config);

    // Save config to backend too
    try {
      await fetch("/api/cnc/cncjs/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
    } catch {
      // Non-critical, continue
    }

    // Create WebSocket client
    const client = createCNCjsClient(config);
    client.onStatus(handleMachineState);
    client.onConnection((connected) => {
      handleConnection(connected);
      if (connected) {
        setView("profiles");
        toast({ title: "Connected", description: `CNCjs at ${config.host}:${config.port}` });
      }
    });
    client.connect();

    // Timeout fallback
    setTimeout(() => {
      if (!getCNCjsClient()?.connected) {
        setConnecting(false);
        toast({ title: "Connection Failed", description: "Cannot reach CNCjs. Check IP and port.", variant: "destructive" });
      }
    }, 5000);
  };

  // ===== SELECT PROFILE & SEND TO CNCjs =====
  const handleSelectProfile = (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile?.hasGCode) {
      toast({ title: "No G-Code", description: "Upload the .tap file first.", variant: "destructive" });
      return;
    }
    setSelectedProfile(id);
    setCompletedCount(0);
    setView("control");
  };

  // ===== SEND G-CODE TO CNCjs =====
  const handleSendAndStart = async () => {
    if (!selected) return;
    const client = getCNCjsClient();
    if (!client?.connected) {
      toast({ title: "Not Connected", description: "Connect to CNCjs first.", variant: "destructive" });
      return;
    }

    setSendingGCode(true);
    try {
      // Fetch the G-code from our server
      const res = await fetch(`/api/cnc/tap-file/${encodeURIComponent(selected.filename)}`);
      if (!res.ok) throw new Error("Could not load G-code file");
      const gcode = await res.text();

      // Send to CNCjs
      const loaded = await client.loadGCode(selected.filename, gcode);
      if (!loaded) throw new Error("CNCjs rejected the G-code");

      // Start the job
      client.start();
      toast({ title: "CUT STARTED", description: `${selected.displayName} at F${selected.feedRate}` });
    } catch (err: any) {
      toast({ title: "Send Failed", description: err.message, variant: "destructive" });
    } finally {
      setSendingGCode(false);
    }
  };

  const handlePause = () => {
    getCNCjsClient()?.pause();
    toast({ title: "PAUSED" });
  };

  const handleResume = () => {
    getCNCjsClient()?.resume();
    toast({ title: "RESUMED" });
  };

  const handleStop = () => {
    getCNCjsClient()?.stop();
    toast({ title: "STOPPED", variant: "destructive" });
  };

  const handleHome = () => {
    getCNCjsClient()?.home();
    toast({ title: "HOMING..." });
  };

  const handleUnlock = () => {
    getCNCjsClient()?.unlock();
    toast({ title: "UNLOCKED" });
  };

  const handleRepeat = async () => {
    setCompletedCount((c) => c + 1);
    await handleSendAndStart();
  };

  const handleMarkDone = () => {
    setCompletedCount((c) => c + 1);
    toast({ title: "CUT COMPLETE", description: `Run #${completedCount + 1} done` });
  };

  // Derive machine status
  const status = machineState?.status || "Disconnected";
  const isRunning = status === "Run";
  const isPaused = status === "Hold";
  const isIdle = status === "Idle";
  const isAlarm = status === "Alarm";
  const progress = machineState?.progress || 0;

  // ===== HIDDEN INPUT FOR FILE UPLOADS =====
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".tap,.nc,.txt"
      multiple
      className="hidden"
      onChange={handleFileUpload}
    />
  );

  // ========================================
  // VIEW: CONNECT
  // First screen — enter CNCjs IP address
  // ========================================
  if (view === "connect" && !showSettings) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
        {fileInput}
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-600 mb-4">
              <Cpu className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">CNC Remote</h1>
            <p className="text-gray-400 mt-2">Connect tablet to workshop PC</p>
          </div>

          {/* Connection Form */}
          <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Workshop PC IP Address</label>
              <input
                type="text"
                value={cncjsHost}
                onChange={(e) => setCncjsHost(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full px-4 py-4 bg-gray-800 text-white text-xl rounded-xl border border-gray-700 focus:border-emerald-500 focus:outline-none text-center font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Port</label>
              <input
                type="text"
                value={cncjsPort}
                onChange={(e) => setCncjsPort(e.target.value)}
                placeholder="8000"
                className="w-full px-4 py-3 bg-gray-800 text-white text-lg rounded-xl border border-gray-700 focus:border-emerald-500 focus:outline-none text-center font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Access Token (optional)</label>
              <input
                type="password"
                value={cncjsToken}
                onChange={(e) => setCncjsToken(e.target.value)}
                placeholder="Leave empty if none"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:border-emerald-500 focus:outline-none text-center"
              />
            </div>

            <button
              onClick={handleConnect}
              disabled={connecting || !cncjsHost}
              className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 text-xl font-bold mt-4"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-7 h-7 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wifi className="w-7 h-7" />
                  CONNECT
                </>
              )}
            </button>
          </div>

          {/* Skip — work offline with profiles only */}
          <button
            onClick={() => setView("profiles")}
            className="w-full text-center text-gray-500 hover:text-gray-300 py-3 text-sm"
          >
            Skip — browse profiles offline
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // VIEW: CONTROL
  // The main workshop screen — BIG buttons
  // ========================================
  if (view === "control" && selected) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col p-4">
        {fileInput}

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setView("profiles")}
            className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-lg">Back</span>
          </button>

          {/* Connection indicator */}
          <div className="flex items-center gap-2">
            {wsConnected ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <Wifi className="w-5 h-5" />
                <span className="text-sm font-medium">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400">
                <WifiOff className="w-5 h-5" />
                <span className="text-sm font-medium">Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-4">
          <h2 className="text-2xl font-bold text-white">{selected.displayName}</h2>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-lg text-sm font-semibold">{selected.height}mm</span>
            <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-lg text-sm font-semibold">{selected.material}</span>
            <span className="px-3 py-1 bg-orange-900/50 text-orange-300 rounded-lg text-sm font-semibold">F{selected.feedRate}</span>
            <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-lg text-sm font-semibold">{selected.units} units</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">{selected.filename}</p>
        </div>

        {/* Machine Status */}
        {wsConnected && machineState && (
          <div className="bg-gray-900 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  isRunning ? "bg-green-500 animate-pulse" :
                  isPaused ? "bg-yellow-500" :
                  isAlarm ? "bg-red-500 animate-pulse" :
                  isIdle ? "bg-emerald-500" :
                  "bg-gray-500"
                }`} />
                <span className="text-xl font-bold text-white">{status}</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-emerald-400 font-mono">{completedCount}</span>
                <span className="text-gray-500 text-sm block">runs done</span>
              </div>
            </div>

            {/* Progress bar */}
            {(isRunning || isPaused) && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isRunning ? "bg-emerald-500" : "bg-yellow-500"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{machineState.linesCompleted} / {machineState.linesTotal} lines</span>
                  <span>X:{machineState.wpos.x.toFixed(1)} Y:{machineState.wpos.y.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completed runs counter (offline mode) */}
        {!wsConnected && (
          <div className="bg-gray-900 rounded-2xl p-5 mb-4 flex items-center justify-between">
            <span className="text-gray-400 text-lg">Completed Runs</span>
            <span className="text-4xl font-bold text-emerald-400 font-mono">{completedCount}</span>
          </div>
        )}

        {/* === MAIN CONTROL BUTTONS === */}
        <div className="flex-1 flex flex-col gap-3 justify-end">

          {/* Alarm actions */}
          {isAlarm && (
            <div className="flex gap-3">
              <button
                onClick={handleUnlock}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-5 bg-yellow-600 text-white rounded-2xl text-xl font-bold"
              >
                <Unlock className="w-8 h-8" />
                UNLOCK
              </button>
              <button
                onClick={handleHome}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-5 bg-blue-600 text-white rounded-2xl text-xl font-bold"
              >
                <Home className="w-8 h-8" />
                HOME
              </button>
            </div>
          )}

          {/* START button — when idle or not connected */}
          {(isIdle || !wsConnected) && !isRunning && !isPaused && (
            <button
              onClick={wsConnected ? handleSendAndStart : handleMarkDone}
              disabled={sendingGCode}
              className="w-full flex items-center justify-center gap-4 px-8 py-8 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:opacity-50 text-3xl font-bold shadow-2xl shadow-green-900/50 active:scale-95 transition-transform"
            >
              {sendingGCode ? (
                <>
                  <Loader2 className="w-12 h-12 animate-spin" />
                  SENDING...
                </>
              ) : (
                <>
                  <Play className="w-12 h-12" />
                  {wsConnected ? "START CUT" : "START"}
                </>
              )}
            </button>
          )}

          {/* RUNNING — show PAUSE and STOP */}
          {isRunning && (
            <div className="flex gap-3">
              <button
                onClick={handlePause}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-7 bg-yellow-600 text-white rounded-2xl text-2xl font-bold active:scale-95 transition-transform"
              >
                <Pause className="w-10 h-10" />
                PAUSE
              </button>
              <button
                onClick={handleStop}
                className="flex items-center justify-center gap-3 px-8 py-7 bg-red-600 text-white rounded-2xl text-2xl font-bold active:scale-95 transition-transform"
              >
                <Square className="w-10 h-10" />
                STOP
              </button>
            </div>
          )}

          {/* PAUSED — show RESUME and STOP */}
          {isPaused && (
            <div className="flex gap-3">
              <button
                onClick={handleResume}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-7 bg-green-600 text-white rounded-2xl text-2xl font-bold active:scale-95 transition-transform"
              >
                <Play className="w-10 h-10" />
                RESUME
              </button>
              <button
                onClick={handleStop}
                className="flex items-center justify-center gap-3 px-8 py-7 bg-red-600 text-white rounded-2xl text-2xl font-bold active:scale-95 transition-transform"
              >
                <Square className="w-10 h-10" />
                STOP
              </button>
            </div>
          )}

          {/* REPEAT / DONE buttons — always visible at bottom when not cutting */}
          {!isRunning && !isPaused && !isAlarm && completedCount > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleRepeat}
                disabled={sendingGCode}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-6 bg-orange-500 text-white rounded-2xl text-xl font-bold active:scale-95 transition-transform"
              >
                <RotateCcw className="w-8 h-8" />
                REPEAT
              </button>
              <button
                onClick={handleMarkDone}
                className="flex items-center justify-center gap-3 px-8 py-6 bg-blue-600 text-white rounded-2xl text-xl font-bold active:scale-95 transition-transform"
              >
                <CheckCircle2 className="w-8 h-8" />
                +1 DONE
              </button>
            </div>
          )}

          {/* Offline manual counter buttons */}
          {!wsConnected && completedCount === 0 && (
            <p className="text-center text-gray-600 text-sm mt-2">
              Offline mode — tap START after each manual cut to count
            </p>
          )}
        </div>
      </div>
    );
  }

  // ========================================
  // VIEW: PROFILES
  // Pick a profile — big touch tiles
  // ========================================
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col p-4">
      {fileInput}

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-7 h-7 text-emerald-400" />
            CNC Remote
          </h1>
          <p className="text-gray-500 text-sm">Silverton Hot Wire Cutter</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Connection status */}
          {wsConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-400 text-sm bg-emerald-950 px-3 py-1.5 rounded-lg">
              <Wifi className="w-4 h-4" />
              Live
            </span>
          ) : (
            <button
              onClick={() => setView("connect")}
              className="flex items-center gap-1.5 text-gray-400 text-sm bg-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-700"
            >
              <WifiOff className="w-4 h-4" />
              Connect
            </button>
          )}
          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-blue-400 text-sm bg-blue-950 px-3 py-1.5 rounded-lg hover:bg-blue-900"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          {/* Settings */}
          <button
            onClick={() => setView("connect")}
            className="p-2 text-gray-500 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category filters — big touch tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-colors ${
              filterCategory === cat
                ? "bg-emerald-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
        <div className="ml-auto self-center text-xs text-gray-600 whitespace-nowrap">
          {loadedFiles.length}/{profiles.length} loaded
        </div>
      </div>

      {/* Profile grid — big touch tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto">
        {filteredProfiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => profile.hasGCode ? handleSelectProfile(profile.id) : fileInputRef.current?.click()}
            className={`rounded-2xl p-5 text-left transition-all active:scale-[0.98] ${
              profile.hasGCode
                ? "bg-gray-900 border-2 border-gray-800 hover:border-emerald-600"
                : "bg-gray-900/50 border-2 border-dashed border-gray-800 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-white truncate">{profile.displayName}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded text-xs font-semibold">{profile.height}mm</span>
                  <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded text-xs font-semibold">{profile.material}</span>
                  {profile.lengths && (
                    <span className="px-2 py-0.5 bg-green-900/50 text-green-300 rounded text-xs font-semibold">{profile.lengths}L</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3">
                {profile.hasGCode ? (
                  <div className="flex items-center gap-1 text-emerald-400">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Upload className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
