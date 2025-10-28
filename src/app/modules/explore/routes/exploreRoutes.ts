import { Router } from "express";
import ExploreController from "../controllers/exploreController.js";
import AuthMiddleware from "../../../middlewares/auth.js";

const exploreRouter = Router();
const exploreController = new ExploreController();

// Explore endpoint with type parameter
exploreRouter.get(
  "/",
  AuthMiddleware.authenticate,
  exploreController.explore.bind(exploreController)
);

// Detail endpoint with type and id parameters
exploreRouter.get(
  "/detail",
  exploreController.detail.bind(exploreController)
);

export default exploreRouter;
