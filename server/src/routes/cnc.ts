import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// ========================================
// CNCjs CONNECTION SETTINGS
// Stored in-memory (persists per server session)
// The tablet saves settings to localStorage,
// and the backend stores them here for server-side proxying
// ========================================
let cncjsConfig: { host: string; port: number; token?: string } | null = null;

// GET /api/cnc/cncjs/config — get current CNCjs connection config
router.get("/cncjs/config", (_req, res) => {
  res.json(cncjsConfig || { host: "", port: 8000, token: "" });
});

// POST /api/cnc/cncjs/config — save CNCjs connection config
router.post("/cncjs/config", (req, res) => {
  const { host, port, token } = req.body;
  if (!host || !port) {
    return res.status(400).json({ error: "host and port are required" });
  }
  cncjsConfig = { host: String(host), port: Number(port), token: token || undefined };
  console.log(`[CNC] CNCjs config updated: ${cncjsConfig.host}:${cncjsConfig.port}`);
  res.json({ ok: true, config: cncjsConfig });
});

// GET /api/cnc/cncjs/status — check if CNCjs is reachable
router.get("/cncjs/status", async (_req, res) => {
  if (!cncjsConfig) {
    return res.json({ reachable: false, error: "No CNCjs config set" });
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const url = `http://${cncjsConfig.host}:${cncjsConfig.port}/api/version`;
    const headers: Record<string, string> = {};
    if (cncjsConfig.token) headers["Authorization"] = `Bearer ${cncjsConfig.token}`;

    const response = await fetch(url, { signal: controller.signal, headers });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      res.json({ reachable: true, version: data });
    } else {
      res.json({ reachable: false, error: `HTTP ${response.status}` });
    }
  } catch (err: any) {
    res.json({ reachable: false, error: err.message || "Connection failed" });
  }
});

// POST /api/cnc/cncjs/send-gcode — send a .tap file to CNCjs
router.post("/cncjs/send-gcode", async (req, res) => {
  if (!cncjsConfig) {
    return res.status(400).json({ error: "No CNCjs config set" });
  }

  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ error: "filename is required" });
  }

  // Read file from local storage
  const safeName = path.basename(filename);
  const filePath = path.join(TAP_DIR, safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "TAP file not found on server" });
  }

  const gcode = fs.readFileSync(filePath, "utf-8");

  try {
    const url = `http://${cncjsConfig.host}:${cncjsConfig.port}/api/gcode`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (cncjsConfig.token) headers["Authorization"] = `Bearer ${cncjsConfig.token}`;

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ port: req.body.port || "", gcode, name: safeName }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    console.log(`[CNC] G-code sent to CNCjs: ${safeName}`);
    res.json({ ok: true, data });
  } catch (err: any) {
    console.error("[CNC] Failed to send G-code to CNCjs:", err);
    res.status(500).json({ error: err.message || "Failed to reach CNCjs" });
  }
});

// TAP files are stored in client/public/cnc/tap-files/ so they're accessible via static serving
const TAP_DIR = path.join(process.cwd(), "client", "public", "cnc", "tap-files");

// Ensure directory exists
if (!fs.existsSync(TAP_DIR)) {
  fs.mkdirSync(TAP_DIR, { recursive: true });
}

// Multer config for .tap file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, TAP_DIR),
    filename: (_req, file, cb) => {
      // Preserve original filename but sanitize it
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, safeName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".tap", ".nc", ".txt"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only .tap, .nc, and .txt files are allowed"));
    }
  },
});

// GET /api/cnc/loaded-files — list all .tap files on disk
router.get("/loaded-files", (_req, res) => {
  try {
    const files = fs.readdirSync(TAP_DIR).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return [".tap", ".nc", ".txt"].includes(ext);
    });
    res.json(files);
  } catch (err) {
    console.error("[CNC] Error listing files:", err);
    res.json([]);
  }
});

// POST /api/cnc/upload-tap — upload one or more .tap files
router.post("/upload-tap", upload.single("tapFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  console.log(`[CNC] Uploaded: ${req.file.filename} (${req.file.size} bytes)`);
  res.json({
    filename: req.file.filename,
    size: req.file.size,
    path: `/cnc/tap-files/${req.file.filename}`,
  });
});

// GET /api/cnc/tap-file/:filename — read a specific .tap file content
router.get("/tap-file/:filename", (req, res) => {
  const filename = req.params.filename;
  const safeName = path.basename(filename); // prevent path traversal
  const filePath = path.join(TAP_DIR, safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  const content = fs.readFileSync(filePath, "utf-8");
  res.type("text/plain").send(content);
});

// DELETE /api/cnc/tap-file/:filename — remove a .tap file
router.delete("/tap-file/:filename", (req, res) => {
  const filename = req.params.filename;
  const safeName = path.basename(filename);
  const filePath = path.join(TAP_DIR, safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  fs.unlinkSync(filePath);
  console.log(`[CNC] Deleted: ${safeName}`);
  res.json({ deleted: safeName });
});

export default router;
