import { Router, Request, Response, NextFunction } from "express";
import DocumentUploadController from "../controllers/DocumentUploadController.js";
import AuthMiddleware from "../../../middlewares/auth.js";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    // Allowed document types
    const allowedTypes = [
      "application/pdf", // PDF
      "application/msword", // DOC
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      "application/vnd.ms-excel", // XLS
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
      "text/plain", // TXT
      "application/vnd.ms-powerpoint", // PPT
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, TXT, PPT, and PPTX are allowed."
        )
      );
    }
  },
});

const DocumentRouter = Router();

const documentUploadController = new DocumentUploadController();

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
        message: "File too large. Maximum size allowed is 50MB.",
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
    "Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, TXT, PPT, and PPTX are allowed."
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

DocumentRouter.post(
  "/upload",
  AuthMiddleware.authenticate,
  upload.single("file") as any,
  handleMulterError,
  documentUploadController.documentUploader
);

export default DocumentRouter;

