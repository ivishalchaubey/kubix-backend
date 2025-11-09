import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import { UserTokenController } from "../controllers/usertoken.controller.js";
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
  AuthMiddleware.authenticate,
  authValidation.resetPassword,
  authController.resetPassword
);
router.post("/refresh-tokens", authController.refreshTokens);
router.post("/verify-email", AuthMiddleware.authenticate,  authController.verifyEmail);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/forgotPassword", authController.forgotPassword);
// Protected routes (authentication required)
// router.use(AuthMiddleware.authenticate); // Apply authentication to all routes below

router.post("/logout", authController.logout);
router.get("/profile",AuthMiddleware.authenticate, authController.getProfile);
router.patch("/profile", AuthMiddleware.authenticate,authController.updateProfile);
router.get("/user/courses",AuthMiddleware.authenticate, authController.getUserCourses);
router.patch("/change-password", authController.changePassword);
router.patch("/update-user", AuthMiddleware.authenticate, authController.updateUser);
router.patch("/change-user-status", AuthMiddleware.authenticate, authController.changeUserStatus);
router.get("/universities",AuthMiddleware.authenticate, authController.getUniversities);

// Update user course payment status
router.patch("/user-course-payment-status", AuthMiddleware.authenticate, authValidation.updateUserCoursePaymentStatus, authController.updateUserCoursePaymentStatus);

// Token management routes
router.get("/tokens/balance", AuthMiddleware.authenticate, UserTokenController.getUserTokenBalance);
router.post("/tokens/spend", AuthMiddleware.authenticate, UserTokenController.spendTokens);
router.get("/tokens/history", AuthMiddleware.authenticate, UserTokenController.getTokenHistory);

// Admin routes for token management
router.post("/tokens/add", AuthMiddleware.authenticate, UserTokenController.addTokens);

export default router;
