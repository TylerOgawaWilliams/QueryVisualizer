import multer from "multer";
import fs from "fs";

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept both .tar and .sql files
    if (
      file.originalname.endsWith(".tar") ||
      file.originalname.endsWith(".sql") ||
      file.mimetype === "application/x-tar" ||
      file.mimetype === "text/plain" ||
      file.mimetype === "application/sql"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});
