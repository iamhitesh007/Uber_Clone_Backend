import multer from "multer";
import fs from "fs";
import path from "path";

// Define the upload directory
const UPLOAD_DIR = "public/uploads/";

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// File type validation function
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|svg|webp|gif/; // Allowed file types
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Error: File type not supported!"), false);
  }
};

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname.replace(" ", "_")}`);
  },
});

// Initialize Multer with storage and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

export default upload;
