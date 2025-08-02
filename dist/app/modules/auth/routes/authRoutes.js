import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import AuthMiddleware from "../../../middlewares/auth.js";
import { authValidation } from "../../../middlewares/validationMiddleware.js";
const router = Router();
const authController = new AuthController();
router.post("/register", authValidation.register, authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authValidation.forgotPassword, authController.forgotPassword);
router.post("/reset-password", authValidation.resetPassword, authController.resetPassword);
router.post("/refresh-tokens", authController.refreshTokens);
router.post("/verify-email/:token", AuthMiddleware.authenticate, authController.verifyEmail);
router.use(AuthMiddleware.authenticate);
router.post("/logout", authController.logout);
router.get("/profile", authController.getProfile);
router.patch("/profile", authController.updateProfile);
router.patch("/change-password", authController.changePassword);
export default router;
//# sourceMappingURL=authRoutes.js.map