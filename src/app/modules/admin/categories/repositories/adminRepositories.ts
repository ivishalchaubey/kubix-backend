import { Document, model, ObjectId, Schema } from "mongoose";
import CategoryModel from "../models/category.js";
import ResponseUtil from "../../../../utils/response.js";
import mongoose from "mongoose";
import {ICategory} from "../models/category.js";

class AdminRepositories {
  
  constructor() {
  }
  async saveCareerOptionsTree(treeData : ICategory) {
      const { name , image , description , parentId, order , isLeafNode , a_day_in_life,core_skills,educational_path,salary_range,future_outlook } = treeData;

      const newNode = new CategoryModel({
        name,
        parentId,
        description,
        image,
        order,
        isLeafNode,
        a_day_in_life,
        core_skills,
        educational_path,
        salary_range,
        future_outlook
      });

      const savedNode = await newNode.save();

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