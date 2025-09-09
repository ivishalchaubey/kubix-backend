import mongoose, { Document, model, Schema } from "mongoose";
import CategoryModel from "../models/category.js";
import ResponseUtil from "../../../../utils/response.js";
import {ICategory} from "../models/category.js";
import { promises as fs } from "fs";
import { parse } from "csv-parse/sync";

class AdminRepositories {
  
  constructor() {
  }
  // async saveCareerOptionsTree(treeData : ICategory) {
      // const { name , image , description , parentId, order , isLeafNode , a_day_in_life,core_skills,educational_path,salary_range,future_outlook } = treeData;

      // const newNode = new CategoryModel({
      //   name,
      //   parentId,
      //   description,
      //   image,
      //   order,
      //   isLeafNode,
      //   a_day_in_life,
      //   core_skills,
      //   educational_path,
      //   salary_range,
      //   future_outlook
      // });

      // const savedNode = await newNode.save();


  //     for (const node of treeData) {
  //     const { name, children = [] } = node;

  //     // Save current node
  //     const newNode = new CategoryModel({
  //       name,
  //       parentId,
  //       order
  //     });

  //     const savedNode = await newNode.save();

  //     // Recurse if children exist
  //     if (children.length > 0) {
  //       await this.saveCareerOptionsTree(children, savedNode._id, order + 1);
  //     }

  //   }

  // }

  async saveCareerOptionsTree(treeData: any, parentId: mongoose.Types.ObjectId | null, order: number = 1) {
    for (const node of treeData) {
      const { name, children = [], image ,stream ,branch , description , isLeafNode , a_day_in_life,core_skills,educational_path,salary_range,future_outlook } = node;

      // Save current node
      const newNode = new CategoryModel({
         name,
        parentId,
        description,
        image,
        stream,
        branch,
        order,
        isLeafNode,
        a_day_in_life,
        core_skills,
        educational_path,
        salary_range,
        future_outlook
      });

      const savedNode = await newNode.save();

      // Recurse if children exist
      if (children && children.length > 0) {
        await this.saveCareerOptionsTree(children, savedNode._id, order + 1);
      }

    }
  }

  async saveCategoriesFromCSV(file: Express.Multer.File): Promise<any> {
    try {
      // Parse CSV content
      const csvContent = file.buffer.toString('utf-8');
      
      // Log the first few lines for debugging
      console.log('CSV Content Preview:');
      console.log(csvContent.split('\n').slice(0, 5).join('\n'));
      
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true, // Allow flexible column count
        relax_quotes: true // Handle quotes more flexibly
      });
      
      console.log(`Parsed ${records.length} records from CSV`);
      if (records.length > 0) {
        console.log('Sample record keys:', Object.keys(records[0]));
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
          branch = "",
          core_skills_technical = "",
          core_skills_soft = "",
          educational_path_ug = "",
          educational_path_pg = "",
          salary_range = "",
          future_outlook_demand = "",
          future_outlook_reason = ""
        } = record;

        // Skip records with missing required fields
        if (!name || !level) {
          console.log(`Skipping invalid record: name="${name}", level="${level}"`);
          continue;
        }

        const levelNum = parseInt(level);
        if (isNaN(levelNum) || levelNum < 1) {
          continue; // Skip invalid levels
        }

        // Parse core skills
        const core_skills = {
          technical: core_skills_technical ? core_skills_technical.split(',').map((s: string) => s.trim()) : [],
          soft: core_skills_soft ? core_skills_soft.split(',').map((s: string) => s.trim()) : []
        };

        // Parse educational path
        const educational_path = {
          ug_courses: educational_path_ug ? educational_path_ug.split(',').map((s: string) => s.trim()) : [],
          pg_courses: educational_path_pg ? educational_path_pg.split(',').map((s: string) => s.trim()) : []
        };

        // Parse future outlook
        const future_outlook = {
          demand: future_outlook_demand || "",
          reason: future_outlook_reason || ""
        };

        const categoryData = {
          name,
          level: levelNum,
          description,
          image,
          isLeafNode: isLeafNode === 'true' || isLeafNode === '1',
          a_day_in_life,
          core_skills,
          educational_path,
          salary_range,
          future_outlook
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
      const sortedLevels = Array.from(hierarchyMap.keys()).sort((a, b) => a - b);

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
            future_outlook: categoryData.future_outlook
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
        categories: savedCategories
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error processing CSV: ${errorMessage}`);
    }
  }


async getAllCategories(): Promise<ICategory[]> {
  const categories = await CategoryModel.aggregate([
  {
    $match: {
      $or: [
        { parentId: { $exists: false } },
        { parentId: null }
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
          let x =  await CategoryModel.aggregate([{$match:{parentId: new mongoose.Types.ObjectId(parentId)}}]);
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

}
export default AdminRepositories;