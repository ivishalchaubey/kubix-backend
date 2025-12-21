import { Router } from "express";
import AdminController from "../controllers/adminController.js";
import asyncHandler from "../../../../utils/asyncHandler.js";
import multer from "multer";
import AuthMiddleware from "../../../../middlewares/auth.js";
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only CSV files are allowed"));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
const adminRouter = Router();
const adminController = new AdminController();
adminRouter.post("/categories", asyncHandler((req, res, next) => adminController.createCategory(req, res, next)));
adminRouter.put("/categories/:id", asyncHandler((req, res, next) => adminController.updateCategory(req, res, next)));
adminRouter.delete("/categories/:id", asyncHandler((req, res, next) => adminController.deleteCategory(req, res, next)));
adminRouter.get("/categories", asyncHandler((req, res, next) => adminController.getCategories(req, res, next)));
adminRouter.get("/user/categories", AuthMiddleware.authenticate, asyncHandler((req, res, next) => adminController.getUserCategories(req, res, next)));
adminRouter.post("/categories/upload-csv", upload.single("csvFile"), asyncHandler((req, res, next) => adminController.uploadCategoriesFromCSV(req, res, next)));
adminRouter.post("/categories/upload-csv-under-parent", upload.single("csvFile"), asyncHandler((req, res, next) => adminController.uploadCategoriesFromCSVUnderParent(req, res, next)));
export default adminRouter;
//# sourceMappingURL=adminRoutes.js.map