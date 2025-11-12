import { Router, Request, Response, NextFunction } from "express";
import ImageUploadController from "../controllers/ImageUploadController.js";
import AuthMiddleware from "../../../middlewares/auth.js";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    // Optional: Add file type validation
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
        )
      );
    }
  },
});

const ImageRouter = Router();

const imageUploadController = new ImageUploadController();

// Multer error handler middleware
const handleMulterError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        success: false,
        message: "File too large. Maximum size allowed is 20MB.",
        statusCode: 413,
      });
      return;
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "file" as the field name.',
        statusCode: 400,
      });
      return;
    }
  }
  if (
    error.message ===
    "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
  ) {
    res.status(400).json({
      success: false,
      message: error.message,
      statusCode: 400,
    });
    return;
  }
  next(error);
};

ImageRouter.post(
  "/upload",
  AuthMiddleware.authenticate,
  upload.single("file") as any,
  handleMulterError,
  imageUploadController.imageUploader
);

export default ImageRouter;
