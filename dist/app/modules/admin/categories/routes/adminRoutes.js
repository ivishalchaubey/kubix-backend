import { Router } from "express";
import AdminController from "../controllers/adminController.js";
const adminRouter = Router();
const adminController = new AdminController();
adminRouter.post("/categories", adminController.createCategory);
adminRouter.put("/categories/:id", adminController.updateCategory);
export default adminRouter;
//# sourceMappingURL=adminRoutes.js.map