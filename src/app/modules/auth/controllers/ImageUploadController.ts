import { Request, Response, NextFunction } from "express";
import ResponseUtil from "../../../utils/response.js";
import { API_MESSAGES } from "../../../constants/enums.js";
import { uploadFile } from "../../../config/aws.js"; // Adjust the import path as necessary

class ImageUploadController {
  imageUploader = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      // Check for multer errors (file size, file type, etc.)
      if (req.file === undefined) {
        return ResponseUtil.badRequest(
          res,
          "Bad Request",
          API_MESSAGES.ERROR.FILE_NOT_PROVIDED
        );
      }

      // Upload to S3
      let result = await uploadFile(
        req.file.originalname,
        req.file.buffer,
        req.file.mimetype
      );

      ResponseUtil.created(
        res,
        { data: result },
        API_MESSAGES.SUCCESS.AWS_FILE_UPLOADED
      );
    } catch (error) {
      next(error);
    }
  };
}

export default ImageUploadController;
