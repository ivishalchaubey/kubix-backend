import { Router, Request, Response } from "express";
import ImageUploadController from "../controllers/ImageUploadController.js";
import AuthMiddleware from "../../../middlewares/auth.js";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import {uploadFile} from "../../../config/aws.js"; // Adjust the import path as necessary


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: multer.memoryStorage() });

const ImageRouter = Router();

const imageUploadController = new ImageUploadController();


ImageRouter.post("/upload",AuthMiddleware.authenticate,upload.single("file"),imageUploadController.imageUploader);

export default ImageRouter;
