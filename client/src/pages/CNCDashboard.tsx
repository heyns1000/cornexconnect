import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  RotateCcw,
  Upload,
  Download,
  Eye,
  Trash2,
  Zap,
  Square,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Cpu,
} from "lucide-react";

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

// Master profile registry — these are the REAL production profiles from the Silverton workshop
const MASTER_PROFILES: Omit<CNCProfile, "hasGCode">[] = [
  // 85mm profiles
  { id: "cove85-eps", name: "Cove85", displayName: "Cove 85mm", filename: "Cove85_EPS.tap", height: 85, material: "EPS", lengths: 168, feedRate: 600, units: 28, category: "85mm" },
  { id: "sante85-eps", name: "Sante85", displayName: "Sante 85mm", filename: "Sante85_EPS.tap", height: 85, material: "EPS", lengths: 168, feedRate: 600, units: 28, category: "85mm" },

  // 110mm profiles
  { id: "biance110-xps", name: "Biance110 XPS", displayName: "Magic (Biance) 110mm XPS", filename: "Biance110_XPS.tap", height: 110, material: "XPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "biance110-eps", name: "Biance110 EPS", displayName: "Magic (Biance) 110mm EPS", filename: "Biance110_EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "peroni110-xps", name: "Peroni 110 XPS", displayName: "Peroni 110mm XPS", filename: "Peroni_110_XPS.tap", height: 110, material: "XPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "gloria110-eps", name: "Gloria110 EPS", displayName: "Gloria 110mm EPS", filename: "Gloria110_EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "alina110-eps", name: "Alina110 EPS", displayName: "Alina 110mm EPS", filename: "Alina110_EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "colonial110-eps", name: "Colonial 110 EPS", displayName: "Colonial 110mm EPS", filename: "Colonial_110_EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "g1home110x", name: "G1Homepack110X", displayName: "G1 Homepack 110mm XPS", filename: "G1Homepack110X.tap", height: 110, material: "XPS", lengths: null, feedRate: 600, units: 28, category: "110mm" },
  { id: "g1home110e", name: "G1Homepack110E", displayName: "G1 Homepack 110mm EPS", filename: "G1Homepack110E.tap", height: 110, material: "EPS", lengths: null, feedRate: 600, units: 28, category: "110mm" },
  { id: "tamara110-eps", name: "Tamara110 EPS", displayName: "Tamara 110mm EPS", filename: "Tamara110_EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
  { id: "nt108-eps", name: "NT108 EPS", displayName: "NT108 Wavy 110mm EPS", filename: "NT108_EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },

  // 140mm profiles
  { id: "tamara140-eps", name: "Tamara140 EPS", displayName: "Tamara 140mm EPS", filename: "Tamara140_EPS.tap", height: 140, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "140mm" },
  { id: "p40-140-eps", name: "P40 140 EPS", displayName: "P40 (Eve) 140mm EPS", filename: "P40_140_EPS.tap", height: 140, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "140mm" },
  { id: "troy140-eps", name: "Troy140 EPS", displayName: "Troy 140mm EPS", filename: "Troy140_EPS.tap", height: 140, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "140mm" },

  // 170mm+ profiles
  { id: "lisa170-epsthin", name: "Lisa170 EPSThin", displayName: "Lisa 170mm EPS Thin", filename: "Lisa170_EPSThin.tap", height: 170, material: "EPS Thin", lengths: 84, feedRate: 600, units: 28, category: "170mm+" },
  { id: "gloria185-epsthin", name: "Gloria185 EPSThin", displayName: "Gloria 185mm EPS Thin", filename: "Gloria185_EPSThin.tap", height: 185, material: "EPS Thin", lengths: 84, feedRate: 600, units: 28, category: "170mm+" },
  { id: "bianca-eps", name: "Bianca EPS", displayName: "Bianca Standard EPS", filename: "Bianca_EPS.tap", height: 110, material: "EPS", lengths: 112, feedRate: 600, units: 28, category: "110mm" },
];

type JobStatus = "idle" | "ready" | "running" | "complete";

export default function CNCDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
  const [viewingGCode, setViewingGCode] = useState<string | null>(null);
  const [gcodeContent, setGcodeContent] = useState<string>("");
  const [completedCount, setCompletedCount] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Fetch which profiles have real G-code loaded
  const { data: loadedFiles = [] } = useQuery<string[]>({
    queryKey: ["/api/cnc/loaded-files"],
    queryFn: async () => {
      const res = await fetch("/api/cnc/loaded-files");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Build profile list with loaded status
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
      const res = await fetch("/api/cnc/upload-tap", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cnc/loaded-files"] });
      toast({ title: "G-Code Loaded", description: `${data.filename} uploaded successfully` });
    },
    onError: (err: Error) => {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    },
  });

  // View G-code content
  const viewGCode = async (filename: string) => {
    try {
      const res = await fetch(`/api/cnc/tap-file/${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error("File not loaded");
      const text = await res.text();
      setGcodeContent(text);
      setViewingGCode(filename);
    } catch {
      toast({ title: "Cannot View", description: "G-code file not loaded yet. Upload it first.", variant: "destructive" });
    }
  };

  // Download G-code
  const downloadGCode = async (filename: string) => {
    try {
      const res = await fetch(`/api/cnc/tap-file/${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error("File not available");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Download Failed", description: "File not available", variant: "destructive" });
    }
  };

  // Delete uploaded file
  const deleteMutation = useMutation({
    mutationFn: async (filename: string) => {
      const res = await fetch(`/api/cnc/tap-file/${encodeURIComponent(filename)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cnc/loaded-files"] });
      toast({ title: "File Removed" });
    },
  });

  // Job control
  const handleSelectProfile = (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile?.hasGCode) {
      toast({ title: "No G-Code Loaded", description: "Upload the .tap file for this profile first.", variant: "destructive" });
      return;
    }
    setSelectedProfile(id);
    setJobStatus("ready");
    setCompletedCount(0);
  };

  const handleStart = () => {
    if (!selected) return;
    setJobStatus("running");
    toast({ title: "JOB STARTED", description: `Cutting ${selected.displayName} at F${selected.feedRate}` });
  };

  const handleStop = () => {
    setJobStatus("ready");
    toast({ title: "JOB STOPPED", variant: "destructive" });
  };

  const handleRepeat = () => {
    setCompletedCount((c) => c + 1);
    setJobStatus("running");
    toast({ title: "REPEATING", description: `Run #${completedCount + 2} started` });
  };

  const handleComplete = () => {
    setCompletedCount((c) => c + 1);
    setJobStatus("complete");
    toast({ title: "CUT COMPLETE", description: `${selected?.units || 28} units done. Run #${completedCount + 1}` });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.name.endsWith(".tap") || file.name.endsWith(".nc") || file.name.endsWith(".txt")) {
        uploadMutation.mutate(file);
      } else {
        toast({ title: "Invalid File", description: "Only .tap, .nc, or .txt files accepted", variant: "destructive" });
      }
    });
    e.target.value = "";
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-800 flex items-center gap-2">
            <Cpu className="w-8 h-8" />
            CNC Workshop — Mach3 Profiles
          </h1>
          <p className="text-gray-500 mt-1">
            Hot Wire Foam Cutter • Silverton, Pretoria • Speed: F600
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".tap,.nc,.txt"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            <Upload className="w-5 h-5" />
            Upload .TAP Files
          </button>
        </div>
      </div>

      {/* Active Job Panel */}
      {selected && (
        <div className={`rounded-xl p-6 border-2 ${
          jobStatus === "running" ? "bg-green-50 border-green-500 animate-pulse" :
          jobStatus === "complete" ? "bg-blue-50 border-blue-500" :
          "bg-yellow-50 border-yellow-400"
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold">{selected.displayName}</h2>
              <p className="text-gray-600">
                {selected.height}mm • {selected.material} • {selected.units} units per run •
                {selected.lengths ? ` ${selected.lengths} lengths` : ""} • F{selected.feedRate}
              </p>
              <p className="text-sm text-gray-500 mt-1">File: {selected.filename}</p>
            </div>
            <div className="flex items-center gap-2 text-lg font-mono">
              <span className="text-gray-500">Completed Runs:</span>
              <span className="text-3xl font-bold text-emerald-700">{completedCount}</span>
            </div>
          </div>

          {/* Job Controls — BIG BUTTONS for workshop use */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {jobStatus === "ready" && (
              <button
                onClick={handleStart}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-3 px-8 py-6 bg-green-600 text-white rounded-xl hover:bg-green-700 text-2xl font-bold shadow-lg"
              >
                <Play className="w-10 h-10" />
                START CUT
              </button>
            )}
            {jobStatus === "running" && (
              <>
                <button
                  onClick={handleComplete}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-3 px-8 py-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-2xl font-bold shadow-lg"
                >
                  <CheckCircle2 className="w-10 h-10" />
                  DONE
                </button>
                <button
                  onClick={handleStop}
                  className="flex items-center justify-center gap-3 px-6 py-6 bg-red-600 text-white rounded-xl hover:bg-red-700 text-xl font-bold shadow-lg"
                >
                  <Square className="w-8 h-8" />
                  STOP
                </button>
              </>
            )}
            {jobStatus === "complete" && (
              <>
                <button
                  onClick={handleRepeat}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-3 px-8 py-6 bg-orange-500 text-white rounded-xl hover:bg-orange-600 text-2xl font-bold shadow-lg"
                >
                  <RotateCcw className="w-10 h-10" />
                  REPEAT
                </button>
                <button
                  onClick={() => viewGCode(selected.filename)}
                  className="flex items-center justify-center gap-2 px-4 py-6 bg-gray-600 text-white rounded-xl hover:bg-gray-700 text-lg font-semibold"
                >
                  <Eye className="w-6 h-6" />
                  View G-Code
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              filterCategory === cat
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat === "all" ? "All Profiles" : cat}
          </button>
        ))}
        <div className="ml-auto text-sm text-gray-500 self-center">
          {loadedFiles.length} of {profiles.length} profiles loaded
        </div>
      </div>

      {/* Profile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredProfiles.map((profile) => (
          <div
            key={profile.id}
            className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
              selectedProfile === profile.id
                ? "border-emerald-500 bg-emerald-50 shadow-lg"
                : profile.hasGCode
                ? "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md"
                : "border-dashed border-gray-300 bg-gray-50"
            }`}
            onClick={() => profile.hasGCode ? handleSelectProfile(profile.id) : null}
          >
            {/* Profile Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight">{profile.displayName}</h3>
                <p className="text-sm text-gray-500 mt-1">{profile.filename}</p>
              </div>
              <div className={`w-3 h-3 rounded-full mt-1 ${profile.hasGCode ? "bg-green-500" : "bg-red-400"}`} />
            </div>

            {/* Profile Stats */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                {profile.height}mm
              </span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                {profile.material}
              </span>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                F{profile.feedRate}
              </span>
              {profile.lengths && (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-semibold">
                  {profile.lengths} lengths
                </span>
              )}
            </div>

            {/* Profile Actions */}
            <div className="flex gap-2 mt-3">
              {profile.hasGCode ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelectProfile(profile.id); }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold"
                  >
                    <Zap className="w-4 h-4" />
                    Select
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); viewGCode(profile.filename); }}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                    title="View G-Code"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadGCode(profile.filename); }}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold"
                >
                  <Upload className="w-4 h-4" />
                  Upload G-Code
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* G-Code Viewer Modal */}
      {viewingGCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {viewingGCode}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadGCode(viewingGCode)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Download
                </button>
                <button
                  onClick={() => { setViewingGCode(null); setGcodeContent(""); }}
                  className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto p-4 bg-gray-900 text-green-400 font-mono text-sm leading-relaxed">
              {gcodeContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
