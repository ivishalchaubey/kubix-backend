import { Types } from "mongoose";
import { ApplicationSales } from "../models/applicationSales.model.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class ApplicationSalesRepository {
  
  // Create application sale
  createApplicationSale = async (data: any): Promise<any> => {
    return await ApplicationSales.create(data);
  };

  // Get by ID
  getApplicationSaleById = async (id: string): Promise<any> => {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(
        API_MESSAGES.APPLICATION_SALES.NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await ApplicationSales.findById(id).populate({
      path: "universityId",
      select: "firstName lastName email collegeName"
    });
  };

  // Get all application sales
  getAllApplicationSales = async (): Promise<any[]> => {
    return await ApplicationSales.find()
      .populate({
        path: "universityId",
        select: "firstName lastName email collegeName"
      })
      .sort({ createdAt: -1 });
  };

  // Get by university
  getApplicationSalesByUniversity = async (universityId: string): Promise<any[]> => {
    if (!Types.ObjectId.isValid(universityId)) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await ApplicationSales.find({ universityId })
      .sort({ createdAt: -1 });
  };

  // Get published application sales with pagination
  getPublishedApplicationSales = async (
    page: number,
    limit: number,
    search?: string
  ): Promise<{
    applicationSales: any[];
    total: number;
  }> => {
    const skip = (page - 1) * limit;

    const searchQuery = search
      ? {
          $or: [
            { universityName: { $regex: search, $options: "i" } },
            { pocName: { $regex: search, $options: "i" } },
            { pocEmail: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const query = {
      status: "published",
      ...searchQuery,
    };

    const [applicationSales, total] = await Promise.all([
      ApplicationSales.find(query)
        .populate({
          path: "universityId",
          select: "firstName lastName email collegeName",
        })
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ApplicationSales.countDocuments(query),
    ]);

    return {
      applicationSales,
      total,
    };
  };

  // Update
  updateApplicationSale = async (id: string, updateData: any): Promise<any> => {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(
        API_MESSAGES.APPLICATION_SALES.NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await ApplicationSales.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: "universityId",
      select: "firstName lastName email collegeName"
    });
  };

  // Delete
  deleteApplicationSale = async (id: string): Promise<any> => {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(
        API_MESSAGES.APPLICATION_SALES.NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await ApplicationSales.findByIdAndDelete(id);
  };

  // Publish
  publishApplicationSale = async (id: string): Promise<any> => {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(
        API_MESSAGES.APPLICATION_SALES.NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await ApplicationSales.findByIdAndUpdate(
      id,
      { 
        status: "published",
        publishedAt: new Date()
      },
      { new: true }
    );
  };

  // Track application submission
  trackApplication = async (id: string): Promise<any> => {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError(
        API_MESSAGES.APPLICATION_SALES.NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return await ApplicationSales.findByIdAndUpdate(
      id,
      { $inc: { applicationCount: 1 } },
      { new: true }
    );
  };
}

export default ApplicationSalesRepository;

