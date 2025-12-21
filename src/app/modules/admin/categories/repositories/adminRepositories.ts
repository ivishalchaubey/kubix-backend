import mongoose from "mongoose";
import CategoryModel from "../models/category.js";
import { ICategory } from "../models/category.js";
import { parse } from "csv-parse/sync";

class AdminRepositories {
  constructor() {}

  async saveCareerOptionsTree(
    treeData: any,
    parentId: mongoose.Types.ObjectId | null,
    order: number = 1
  ) {
    for (const node of treeData) {
      const {
        name,
        children = [],
        image,
        description,
        isLeafNode,
        salary_range,
        qualifying_exams,
        pros,
        cons,
        myth,
        superstar1,
        superstar2,
        superstar3,
        reality,
        related_careers,
        checklist,
        technical_skills,
        soft_skills,
        potential_earnings,
        future_growth,
        a_day_in_life,
        growth_path,
      } = node;

      // Convert related_careers to ObjectIds if they are strings
      const relatedCareersIds = related_careers
        ? related_careers
            .filter((id: any) => mongoose.Types.ObjectId.isValid(id))
            .map((id: string) => new mongoose.Types.ObjectId(id))
        : [];

      // Ensure array fields are arrays
      const ensureArray = (value: any): string[] => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string' && value.trim()) return [value];
        return [];
      };

      // Save current node
      const newNode = new CategoryModel({
        name,
        parentId,
        description: description || "",
        image: image || "",
        order,
        isLeafNode: isLeafNode || false,
        salary_range: salary_range || "",
        qualifying_exams: ensureArray(qualifying_exams),
        pros: ensureArray(pros),
        cons: ensureArray(cons),
        myth: myth || "",
        superstar1: superstar1 || "",
        superstar2: superstar2 || "",
        superstar3: superstar3 || "",
        reality: reality || "",
        related_careers: relatedCareersIds,
        checklist: ensureArray(checklist),
        technical_skills: ensureArray(technical_skills),
        soft_skills: ensureArray(soft_skills),
        potential_earnings: ensureArray(potential_earnings),
        future_growth: future_growth || "",
        a_day_in_life: a_day_in_life || "",
        growth_path: growth_path || "",
      });

      const savedNode = await newNode.save();

      // Recurse if children exist
      if (children && children.length > 0) {
        await this.saveCareerOptionsTree(children, savedNode._id, order + 1);
      }
    }
  }

  async createSingleCategory(categoryData: any): Promise<any> {
    const {
      name,
      description,
      image,
      parentId,
      order,
      isLeafNode,
      salary_range,
      qualifying_exams,
      pros,
      cons,
      myth,
      superstar1,
      superstar2,
      superstar3,
      reality,
      related_careers,
      checklist,
      technical_skills,
      soft_skills,
      potential_earnings,
      future_growth,
      a_day_in_life,
      growth_path,
    } = categoryData;

    // Convert related_careers to ObjectIds if they are strings
    const relatedCareersIds = related_careers
      ? related_careers
          .filter((id: any) => mongoose.Types.ObjectId.isValid(id))
          .map((id: string) => new mongoose.Types.ObjectId(id))
      : [];

    // Ensure array fields are arrays
    const ensureArray = (value: any): string[] => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string' && value.trim()) return [value];
      return [];
    };

    const newCategory = new CategoryModel({
      name,
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
      description: description || "",
      image: image || "",
      order: order || 1,
      isLeafNode: isLeafNode || false,
      salary_range: salary_range || "",
      qualifying_exams: ensureArray(qualifying_exams),
      pros: ensureArray(pros),
      cons: ensureArray(cons),
      myth: myth || "",
      superstar1: superstar1 || "",
      superstar2: superstar2 || "",
      superstar3: superstar3 || "",
      reality: reality || "",
      related_careers: relatedCareersIds,
      checklist: ensureArray(checklist),
      technical_skills: ensureArray(technical_skills),
      soft_skills: ensureArray(soft_skills),
      potential_earnings: ensureArray(potential_earnings),
      future_growth: future_growth || "",
      a_day_in_life: a_day_in_life || "",
      growth_path: growth_path || "",
    });

    const savedCategory = await newCategory.save();
    return savedCategory;
  }

  async saveCategoriesFromCSV(file: Express.Multer.File): Promise<any> {
    try {
      // Parse CSV content
      const csvContent = file.buffer.toString("utf-8");

      // Log the first few lines for debugging
      console.log("CSV Content Preview:");
      console.log(csvContent.split("\n").slice(0, 5).join("\n"));

      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true, // Allow flexible column count
        relax_quotes: true, // Handle quotes more flexibly
      });

      console.log(`Parsed ${records.length} records from CSV`);
      if (records.length > 0) {
        console.log("Sample record keys:", Object.keys(records[0]));
      }

      // Process records and build hierarchy
      const hierarchyMap = new Map();
      const processedCategories = [];

      // First pass: create all categories and store them in a map
      for (const record of records) {
        // Ensure all required fields exist with defaults
        const {
          name = "",
          level = "",
          description = "",
          image = "",
          isLeafNode = false,
          salary_range = "",
          qualifying_exams = "",
          pros = "",
          cons = "",
          myth = "",
          reality = "",
          superstar1 = "",
          superstar2 = "",
          superstar3 = "",
          related_careers = "",
          checklist = "",
          technical_skills = "",
          soft_skills = "",
          potential_earnings = "",
          future_growth = "",
          a_day_in_life = "",
          growth_path = "",
        } = record;

        // Skip records with missing required fields
        if (!name || !level) {
          console.log(
            `Skipping invalid record: name="${name}", level="${level}"`
          );
          continue;
        }

        const levelNum = parseInt(level);
        if (isNaN(levelNum) || levelNum < 1) {
          continue; // Skip invalid levels
        }

        // Parse array fields from CSV (comma-separated)
        const parseArray = (value: string): string[] => {
          if (!value || !value.trim()) return [];
          return value.split(",").map((s: string) => s.trim()).filter(Boolean);
        };

        // Parse related_careers (category IDs) and convert to ObjectIds, filter invalid ones
        const relatedCareersIds = parseArray(related_careers)
          .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
          .map((id: string) => new mongoose.Types.ObjectId(id));

        const categoryData = {
          name,
          level: levelNum,
          description: description || "",
          image: image || "",
          isLeafNode: isLeafNode === "true" || isLeafNode === "1",
          salary_range: salary_range || "",
          qualifying_exams: parseArray(qualifying_exams),
          pros: parseArray(pros),
          cons: parseArray(cons),
          myth: myth || "",
          reality: reality || "",
          superstar1: superstar1 || "",
          superstar2: superstar2 || "",
          superstar3: superstar3 || "",
          related_careers: relatedCareersIds,
          checklist: parseArray(checklist),
          technical_skills: parseArray(technical_skills),
          soft_skills: parseArray(soft_skills),
          potential_earnings: parseArray(potential_earnings),
          future_growth: future_growth || "",
          a_day_in_life: a_day_in_life || "",
          growth_path: growth_path || "",
        };

        if (!hierarchyMap.has(levelNum)) {
          hierarchyMap.set(levelNum, []);
        }
        hierarchyMap.get(levelNum).push(categoryData);
        processedCategories.push(categoryData);
      }

      // Second pass: save categories with proper hierarchy
      const savedCategories = [];
      const levelToIdMap = new Map();

      // Sort levels to process from root to leaf
      const sortedLevels = Array.from(hierarchyMap.keys()).sort(
        (a, b) => a - b
      );

      for (const level of sortedLevels) {
        const categoriesAtLevel = hierarchyMap.get(level);

        for (const categoryData of categoriesAtLevel) {
          let parentId = null;

          // Find parent ID from previous level
          if (level > 1 && levelToIdMap.has(level - 1)) {
            // For now, assign to the first parent at the previous level
            // You might want to implement more sophisticated parent-child logic
            const parentLevel = levelToIdMap.get(level - 1);
            if (parentLevel && parentLevel.length > 0) {
              parentId = parentLevel[0];
            }
          }

          const newCategory = new CategoryModel({
            name: categoryData.name,
            parentId,
            description: categoryData.description,
            image: categoryData.image,
            order: level,
            isLeafNode: categoryData.isLeafNode,
            salary_range: categoryData.salary_range,
            qualifying_exams: categoryData.qualifying_exams,
            pros: categoryData.pros,
            cons: categoryData.cons,
            soft_skills: categoryData.soft_skills,
            a_day_in_life: categoryData.a_day_in_life,
            growth_path: categoryData.growth_path,
            myth: categoryData.myth,
            reality: categoryData.reality,
            superstar1: categoryData.superstar1,
            superstar2: categoryData.superstar2,
            superstar3: categoryData.superstar3,
            related_careers: categoryData.related_careers,
            checklist: categoryData.checklist,
            technical_skills: categoryData.technical_skills,
            potential_earnings: categoryData.potential_earnings,
            future_growth: categoryData.future_growth,
          });

          const savedCategory = await newCategory.save();
          savedCategories.push(savedCategory);

          // Store the saved category ID for next level
          if (!levelToIdMap.has(level)) {
            levelToIdMap.set(level, []);
          }
          levelToIdMap.get(level).push(savedCategory._id);
        }
      }

      return {
        message: "Categories uploaded successfully",
        totalProcessed: processedCategories.length,
        totalSaved: savedCategories.length,
        categories: savedCategories,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Error processing CSV: ${errorMessage}`);
    }
  }

  async getAllCategories(): Promise<ICategory[]> {
    const categories = await CategoryModel.aggregate([
      {
        $match: {
          $or: [{ parentId: { $exists: false } }, { parentId: null }],
        },
      },
      // Filter related_careers to only include valid ObjectIds (exclude strings)
      {
        $addFields: {
          related_careers: {
            $filter: {
              input: { $ifNull: ["$related_careers", []] },
              as: "career",
              cond: {
                $ne: [{ $type: "$$career" }, "string"]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "related_careers",
          foreignField: "_id",
          as: "related_careers",
        },
      },
      {
        $graphLookup: {
          from: "categories",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentId",
          as: "childrenFlat",
          depthField: "depth",
        },
      },
      // Build nested children recursively without $function
      {
        $addFields: {
          children: {
            $map: {
              input: {
                $filter: {
                  input: "$childrenFlat",
                  as: "child",
                  cond: {
                    $eq: ["$$child.parentId", "$_id"],
                  },
                },
              },
              as: "level1",
              in: {
                $mergeObjects: [
                  "$$level1",
                  {
                    children: {
                      $map: {
                        input: {
                          $filter: {
                            input: "$childrenFlat",
                            as: "child2",
                            cond: {
                              $eq: ["$$child2.parentId", "$$level1._id"],
                            },
                          },
                        },
                        as: "level2",
                        in: {
                          $mergeObjects: [
                            "$$level2",
                            {
                              children: {
                                $filter: {
                                  input: "$childrenFlat",
                                  as: "child3",
                                  cond: {
                                    $eq: ["$$child3.parentId", "$$level2._id"],
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          childrenFlat: 0, // Remove flat list
        },
      },
    ]);

    return categories;
  }

  // async getUserCategories(stream: string, board: string): Promise<ICategory[]> {
  //   // Build aggregation pipeline conditionally
  //   const pipeline: any[] = [];

  //   // Only add match condition if stream is not 'Medical' or 'Non Medical'
  //   if (stream !== "Medical" && stream !== "Non Medical") {
  //     pipeline.push({
  //       $match: {
  //         $or: [{ stream: stream }, { board: board }],
  //       },
  //     });
  //   }

  //   // Add the rest of the pipeline stages
  //   pipeline.push(
  //     {
  //       $graphLookup: {
  //         from: "categories",
  //         startWith: "$_id",
  //         connectFromField: "_id",
  //         connectToField: "parentId",
  //         as: "childrenFlat",
  //         depthField: "depth",
  //       },
  //     },
  //     // Build nested children recursively without $function
  //     {
  //       $addFields: {
  //         children: {
  //           $map: {
  //             input: {
  //               $filter: {
  //                 input: "$childrenFlat",
  //                 as: "child",
  //                 cond: {
  //                   $eq: ["$$child.parentId", "$_id"],
  //                 },
  //               },
  //             },
  //             as: "level1",
  //             in: {
  //               $mergeObjects: [
  //                 "$$level1",
  //                 {
  //                   children: {
  //                     $map: {
  //                       input: {
  //                         $filter: {
  //                           input: "$childrenFlat",
  //                           as: "child2",
  //                           cond: {
  //                             $eq: ["$$child2.parentId", "$$level1._id"],
  //                           },
  //                         },
  //                       },
  //                       as: "level2",
  //                       in: {
  //                         $mergeObjects: [
  //                           "$$level2",
  //                           {
  //                             children: {
  //                               $filter: {
  //                                 input: "$childrenFlat",
  //                                 as: "child3",
  //                                 cond: {
  //                                   $eq: ["$$child3.parentId", "$$level2._id"],
  //                                 },
  //                               },
  //                             },
  //                           },
  //                         ],
  //                       },
  //                     },
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //         },
  //       },
  //     },
  //     {
  //       $project: {
  //         childrenFlat: 0, // Remove flat list
  //       },
  //     }
  //   );

  //   const categories = await CategoryModel.aggregate(pipeline);
  //   return categories;
  // }

  async getUserCategories(stream: string, board: string): Promise<ICategory[]> {
    // Note: stream and board fields removed from model, returning all categories
    const categories = await CategoryModel.aggregate([
      {
        $match: {},
      },
      // Filter related_careers to only include valid ObjectIds (exclude strings)
      {
        $addFields: {
          related_careers: {
            $filter: {
              input: { $ifNull: ["$related_careers", []] },
              as: "career",
              cond: {
                $ne: [{ $type: "$$career" }, "string"]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "related_careers",
          foreignField: "_id",
          as: "related_careers",
        },
      },
      {
        $graphLookup: {
          from: "categories",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentId",
          as: "childrenFlat",
          depthField: "depth",
        },
      },
      // Build nested children recursively without $function
      {
        $addFields: {
          children: {
            $map: {
              input: {
                $filter: {
                  input: "$childrenFlat",
                  as: "child",
                  cond: {
                    $eq: ["$$child.parentId", "$_id"],
                  },
                },
              },
              as: "level1",
              in: {
                $mergeObjects: [
                  "$$level1",
                  {
                    children: {
                      $map: {
                        input: {
                          $filter: {
                            input: "$childrenFlat",
                            as: "child2",
                            cond: {
                              $eq: ["$$child2.parentId", "$$level1._id"],
                            },
                          },
                        },
                        as: "level2",
                        in: {
                          $mergeObjects: [
                            "$$level2",
                            {
                              children: {
                                $filter: {
                                  input: "$childrenFlat",
                                  as: "child3",
                                  cond: {
                                    $eq: ["$$child3.parentId", "$$level2._id"],
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          childrenFlat: 0, // Remove flat list
        },
      },
    ]);
    return categories;
  }

  async getAllChildrenByParentId(parentId: string): Promise<ICategory[]> {
    let x = await CategoryModel.aggregate([
      { $match: { parentId: new mongoose.Types.ObjectId(parentId) } },
    ]);
    return x;
  }

  // add delete function
  async deleteCategory(categoryId: string): Promise<void> {
    const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      throw new Error("Category not found");
    }
    return;
  }

  async saveCategoriesFromCSVUnderParent(
    file: Express.Multer.File,
    parentId: string,
    order: number
  ): Promise<any> {
    try {
      // Validate parent exists
      const parentCategory = await CategoryModel.findById(parentId);
      if (!parentCategory) {
        throw new Error("Parent category not found");
      }

      // Validate file
      if (!file || !file.buffer) {
        throw new Error("No file provided or file is empty");
      }

      // Parse CSV content
      const csvContent = file.buffer.toString("utf-8");

      // Validate CSV content is not empty
      if (!csvContent || csvContent.trim().length === 0) {
        throw new Error("CSV file is empty");
      }

      // Log the first few lines for debugging
      console.log("CSV Content Preview:");
      console.log(csvContent.split("\n").slice(0, 5).join("\n"));

      let records;
      try {
        records = parse(csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true,
          relax_quotes: true,
        });
      } catch (parseError) {
        throw new Error(
          `Invalid CSV format: ${
            parseError instanceof Error
              ? parseError.message
              : "Unknown parsing error"
          }`
        );
      }

      // Validate CSV structure
      if (!records || records.length === 0) {
        throw new Error("CSV file contains no valid records");
      }

      // Validate required columns
      const requiredColumns = ["name"];
      const availableColumns = Object.keys(records[0]);
      const missingColumns = requiredColumns.filter(
        (col) => !availableColumns.includes(col)
      );

      if (missingColumns.length > 0) {
        throw new Error(
          `Missing required columns: ${missingColumns.join(
            ", "
          )}. Available columns: ${availableColumns.join(", ")}`
        );
      }

      // Validate data types and content
      const validationErrors: string[] = [];
      records.forEach((record: any, index: number) => {
        const rowNumber = index + 2; // +2 because index starts at 0 and we skip header row

        // Validate name is not empty
        if (!record.name || record.name.trim() === "") {
          validationErrors.push(
            `Row ${rowNumber}: Name is required and cannot be empty`
          );
        }

        // Validate isLeafNode if provided
        if (
          record.isLeafNode &&
          !["true", "false", "1", "0", ""].includes(
            record.isLeafNode.toLowerCase()
          )
        ) {
          validationErrors.push(
            `Row ${rowNumber}: isLeafNode must be 'true', 'false', '1', '0', or empty`
          );
        }

        // Validate order if provided (should be numeric)
        if (record.order && isNaN(Number(record.order))) {
          validationErrors.push(
            `Row ${rowNumber}: order must be a valid number`
          );
        }
      });

      if (validationErrors.length > 0) {
        throw new Error(
          `CSV validation failed:\n${validationErrors.join("\n")}`
        );
      }

      console.log(`Parsed ${records.length} records from CSV`);
      if (records.length > 0) {
        console.log("Sample record keys:", Object.keys(records[0]));
      }

      const savedCategories = [];

      // Process each record and save under the specified parent
      for (const record of records) {
        const {
          name = "",
          description = "",
          image = "",
          isLeafNode = false,
          salary_range = "",
          qualifying_exams = "",
          pros = "",
          cons = "",
          myth = "",
          reality = "",
          superstar1 = "",
          superstar2 = "",
          superstar3 = "",
          related_careers = "",
          checklist = "",
          technical_skills = "",
          soft_skills = "",
          potential_earnings = "",
          future_growth = "",
          a_day_in_life = "",
          growth_path = "",
        } = record;

        // Skip records with missing required fields
        if (!name) {
          console.log(`Skipping invalid record: name="${name}"`);
          continue;
        }

        // Parse array fields from CSV (comma-separated)
        const parseArray = (value: string): string[] => {
          if (!value || !value.trim()) return [];
          return value.split(",").map((s: string) => s.trim()).filter(Boolean);
        };

        // Parse related_careers (category IDs) and convert to ObjectIds, filter invalid ones
        const relatedCareersIds = parseArray(related_careers)
          .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
          .map((id: string) => new mongoose.Types.ObjectId(id));

        const newCategory = new CategoryModel({
          name,
          parentId: new mongoose.Types.ObjectId(parentId),
          description: description || "",
          image: image || "",
          order,
          isLeafNode: isLeafNode === "true" || isLeafNode === "1",
          salary_range: salary_range || "",
          qualifying_exams: parseArray(qualifying_exams),
          pros: parseArray(pros),
          cons: parseArray(cons),
          myth: myth || "",
          reality: reality || "",
          superstar1: superstar1 || "",
          superstar2: superstar2 || "",
          superstar3: superstar3 || "",
          related_careers: relatedCareersIds,
          checklist: parseArray(checklist),
          technical_skills: parseArray(technical_skills),
          soft_skills: parseArray(soft_skills),
          potential_earnings: parseArray(potential_earnings),
          future_growth: future_growth || "",
          a_day_in_life: a_day_in_life || "",
          growth_path: growth_path || "",
        });

        const savedCategory = await newCategory.save();
        savedCategories.push(savedCategory);
      }

      return {
        message: "Categories uploaded successfully under parent",
        parentId,
        order,
        totalProcessed: records.length,
        totalSaved: savedCategories.length,
        categories: savedCategories,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Error processing CSV: ${errorMessage}`);
    }
  }
}
export default AdminRepositories;
