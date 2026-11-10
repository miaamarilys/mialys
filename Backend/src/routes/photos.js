import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import multer from "multer";

const router = Router();

export const uploadsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../uploads"
);

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${req.params.id}-${Date.now()}${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension) || !file.mimetype.startsWith("image/")) {
      callback(new Error("Usa una imagen JPG, PNG, WebP o GIF."));
      return;
    }
    callback(null, true);
  },
});

function productIdFromFile(fileName) {
  const baseName = path.basename(fileName, path.extname(fileName));
  return baseName.replace(/-\d+$/, "");
}

function listPhotos() {
  const photos = {};
  const newest = {};

  for (const fileName of fs.readdirSync(uploadsDir)) {
    const extension = path.extname(fileName).toLowerCase();
    if (!allowedExtensions.has(extension)) continue;

    const id = productIdFromFile(fileName);
    const modifiedAt = fs.statSync(path.join(uploadsDir, fileName)).mtimeMs;
    if (photos[id] && modifiedAt < newest[id]) continue;

    photos[id] = `/api/uploads/${fileName}`;
    newest[id] = modifiedAt;
  }

  return photos;
}

function removeOlderPhotos(id, keepName) {
  for (const fileName of fs.readdirSync(uploadsDir)) {
    if (fileName === keepName || fileName.startsWith(".")) continue;
    if (productIdFromFile(fileName) === id) {
      fs.unlinkSync(path.join(uploadsDir, fileName));
    }
  }
}

router.get("/", (_req, res) => {
  res.json(listPhotos());
});

router.post("/:id", (req, res) => {
  if (!/^[a-z0-9-]+$/.test(req.params.id)) {
    res.status(400).json({ error: "Producto no válido." });
    return;
  }

  upload.single("photo")(req, res, (error) => {
    if (error) {
      const message =
        error.code === "LIMIT_FILE_SIZE" ? "La foto supera 5 MB." : error.message;
      res.status(400).json({ error: message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "Elige una foto." });
      return;
    }

    removeOlderPhotos(req.params.id, req.file.filename);
    res.json({ id: req.params.id, url: `/api/uploads/${req.file.filename}` });
  });
});

export default router;
