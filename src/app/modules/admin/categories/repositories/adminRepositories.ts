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
      const { name, children = [], image ,stream ,board , description , isLeafNode , a_day_in_life,core_skills,educational_path,salary_range,future_outlook } = node;

      // Save current node
      const newNode = new CategoryModel({
        name,
        parentId,
        description,
        image,
        stream,
        board,
        order,
        isLeafNode,
        a_day_in_life,
        core_skills,
        educational_path,
        salary_range,
        future_outlook,
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
      a_day_in_life,
      core_skills,
      educational_path,
      salary_range,
      future_outlook,
      // New fields
      soft_skills,
      checklist,
      education_10_2,
      education_diploma,
      education_graduation,
      education_post_graduation,
      myth,
      reality,
      pros,
      cons,
      superstar1,
      superstar2,
      superstar3,
      related_careers,
      growth_path,
      qualifying_exams,
    } = categoryData;

    const newCategory = new CategoryModel({
      name,
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
      description,
      image,
      order: order || 1,
      isLeafNode: isLeafNode || false,
      a_day_in_life,
      core_skills,
      educational_path,
      salary_range,
      future_outlook,
      // New fields
      soft_skills: soft_skills || [],
      checklist: checklist || [],
      education_10_2: education_10_2 || "",
      education_diploma: education_diploma || "",
      education_graduation: education_graduation || "",
      education_post_graduation: education_post_graduation || "",
      myth: myth || "",
      reality: reality || "",
      pros: pros || [],
      cons: cons || [],
      superstar1: superstar1 || "",
      superstar2: superstar2 || "",
      superstar3: superstar3 || "",
      related_careers: related_careers || [],
      growth_path: growth_path || "",
      qualifying_exams: qualifying_exams || [],
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
          a_day_in_life = "",
          stream = "",
          board = "",
          core_skills_technical = "",
          core_skills_soft = "",
          educational_path_ug = "",
          educational_path_pg = "",
          salary_range = "",
          future_outlook_demand = "",
          future_outlook_reason = "",
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

        // Parse core skills
        const core_skills = {
          technical: core_skills_technical
            ? core_skills_technical.split(",").map((s: string) => s.trim())
            : [],
          soft: core_skills_soft
            ? core_skills_soft.split(",").map((s: string) => s.trim())
            : [],
        };

        // Parse educational path
        const educational_path = {
          ug_courses: educational_path_ug
            ? educational_path_ug.split(",").map((s: string) => s.trim())
            : [],
          pg_courses: educational_path_pg
            ? educational_path_pg.split(",").map((s: string) => s.trim())
            : [],
        };

        // Parse future outlook
        const future_outlook = {
          demand: future_outlook_demand || "",
          reason: future_outlook_reason || "",
        };

        const categoryData = {
          name,
          level: levelNum,
          description,
          image,
          isLeafNode: isLeafNode === "true" || isLeafNode === "1",
          a_day_in_life,
          core_skills,
          educational_path,
          salary_range,
          future_outlook,
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
            a_day_in_life: categoryData.a_day_in_life,
            core_skills: categoryData.core_skills,
            educational_path: categoryData.educational_path,
            salary_range: categoryData.salary_range,
            future_outlook: categoryData.future_outlook,
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

async getUserCategories(stream: string, board: string): Promise<ICategory[]> {

  const categories = await CategoryModel.aggregate([
    {
      $match: {
        $or: [
          { stream: stream },
          { board: board }
          ]
      }
    },
    {
      $graphLookup: {
        from: "categories",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentId",
        as: "childrenFlat",
        depthField: "depth"
      }
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
                  $eq: ["$$child.parentId", "$_id"]
                }
              }
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
                            $eq: ["$$child2.parentId", "$$level1._id"]
                          }
                        }
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
                                  $eq: ["$$child3.parentId", "$$level2._id"]
                                }
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    },
    {
      $project: {
        childrenFlat: 0 // Remove flat list
      }
    }
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
          a_day_in_life = "",
          core_skills_technical = "",
          core_skills_soft = "",
          educational_path_ug = "",
          educational_path_pg = "",
          salary_range = "",
          future_outlook_demand = "",
          future_outlook_reason = "",
          // New fields
          soft_skills = "",
          checklist = "",
          education_10_2 = "",
          education_diploma = "",
          education_graduation = "",
          education_post_graduation = "",
          myth = "",
          reality = "",
          pros = "",
          cons = "",
          superstar1 = "",
          superstar2 = "",
          superstar3 = "",
          related_careers = "",
          growth_path = "",
          qualifying_exams = "",
        } = record;

        // Skip records with missing required fields
        if (!name) {
          console.log(`Skipping invalid record: name="${name}"`);
          continue;
        }

        // Parse core skills
        const core_skills = {
          technical: core_skills_technical
            ? core_skills_technical.split(",").map((s: string) => s.trim())
            : [],
          soft: core_skills_soft
            ? core_skills_soft.split(",").map((s: string) => s.trim())
            : [],
        };

        // Parse educational path
        const educational_path = {
          ug_courses: educational_path_ug
            ? educational_path_ug.split(",").map((s: string) => s.trim())
            : [],
          pg_courses: educational_path_pg
            ? educational_path_pg.split(",").map((s: string) => s.trim())
            : [],
        };

        // Parse future outlook
        const future_outlook = {
          demand: future_outlook_demand || "",
          reason: future_outlook_reason || "",
        };

        // Parse new fields
        const parsedSoftSkills = soft_skills
          ? soft_skills.split(",").map((s: string) => s.trim())
          : [];
        const parsedChecklist = checklist
          ? checklist.split(",").map((s: string) => s.trim())
          : [];
        const parsedPros = pros
          ? pros.split(",").map((s: string) => s.trim())
          : [];
        const parsedCons = cons
          ? cons.split(",").map((s: string) => s.trim())
          : [];
        const parsedRelatedCareers = related_careers
          ? related_careers.split(",").map((s: string) => s.trim())
          : [];
        const parsedQualifyingExams = qualifying_exams
          ? qualifying_exams.split(",").map((s: string) => s.trim())
          : [];

        const newCategory = new CategoryModel({
          name,
          parentId: new mongoose.Types.ObjectId(parentId),
          description,
          image,
          order,
          isLeafNode: isLeafNode === "true" || isLeafNode === "1",
          a_day_in_life,
          core_skills,
          educational_path,
          salary_range,
          future_outlook,
          // New fields
          soft_skills: parsedSoftSkills,
          checklist: parsedChecklist,
          education_10_2,
          education_diploma,
          education_graduation,
          education_post_graduation,
          myth,
          reality,
          pros: parsedPros,
          cons: parsedCons,
          superstar1,
          superstar2,
          superstar3,
          related_careers: parsedRelatedCareers,
          growth_path,
          qualifying_exams: parsedQualifyingExams,
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
