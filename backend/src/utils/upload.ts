import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directories exist
const photosDir = path.join(uploadDir, 'photos');
const signaturesDir = path.join(uploadDir, 'signatures');
const aadhaarDir = path.join(uploadDir, 'aadhaar');
const panDir = path.join(uploadDir, 'pan');

[photosDir, signaturesDir, aadhaarDir, panDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for photos
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Configure storage for signatures
const signatureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, signaturesDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for images
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const uploadSignature = multer({
  storage: signatureStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

export const uploadCustomerFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'photo') {
        cb(null, photosDir);
      } else if (file.fieldname === 'signature') {
        cb(null, signaturesDir);
      } else if (file.fieldname === 'aadhaarImage') {
        cb(null, aadhaarDir);
      } else if (file.fieldname === 'panImage') {
        cb(null, panDir);
      } else {
        cb(new Error('Invalid field name'), '');
      }
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
