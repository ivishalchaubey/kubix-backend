import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import AuthMiddleware from "../../../middlewares/auth.js";
import { authValidation } from "../../../middlewares/validationMiddleware.js";

const router = Router();
const authController = new AuthController();

// Public routes (no authentication required)
router.post("/register", authValidation.register, authController.register);
router.post("/login",  authController.login);
router.post(
  "/forgot-password",
  authValidation.forgotPassword,
  authController.forgotPassword
);
router.post(
  "/reset-password",
  authValidation.resetPassword,
  authController.resetPassword
);
router.post("/refresh-tokens", authController.refreshTokens);
router.post("/verify-email/:token", AuthMiddleware.authenticate,  authController.verifyEmail);

// Protected routes (authentication required)
router.use(AuthMiddleware.authenticate); // Apply authentication to all routes below

router.post("/logout", authController.logout);
router.get("/profile", authController.getProfile);
router.patch("/profile", authController.updateProfile);
router.patch("/change-password", authController.changePassword);

export default router;
