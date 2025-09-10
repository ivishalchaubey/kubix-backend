import { Router, Request, Response, NextFunction } from "express";
import AdminController from "../controllers/adminController.js";
import asyncHandler from "../../../../utils/asyncHandler.js";
import multer from "multer";
import AuthMiddleware from "../../../../middlewares/auth.js";

// Configure multer for CSV file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const adminRouter = Router();
const adminController = new AdminController();

adminRouter.post(
  "/categories",
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    adminController.createCategory(req, res, next)
  )
);
adminRouter.put(
  "/categories/:id",
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    adminController.updateCategory(req, res, next)
  )
);
adminRouter.delete(
  "/categories/:id",
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    adminController.deleteCategory(req, res, next)
  )
);
adminRouter.get(
  "/categories",
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    adminController.getCategories(req, res, next)
  )
);
adminRouter.get(
  "/user/categories",
  AuthMiddleware.authenticate,
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    adminController.getUserCategories(req, res, next)
  )
);

adminRouter.post(
  "/categories/upload-csv",
  upload.single("csvFile"),
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    adminController.uploadCategoriesFromCSV(req, res, next)
  )
);

adminRouter.post(
  "/categories/upload-csv-under-parent",
  upload.single("csvFile"),
  asyncHandler((req: Request, res: Response, next: NextFunction) =>
    adminController.uploadCategoriesFromCSVUnderParent(req, res, next)
  )
);

export default adminRouter;
