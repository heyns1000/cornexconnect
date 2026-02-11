import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

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
