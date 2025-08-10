import { Document, model, ObjectId, Schema } from "mongoose";
import CategoryModel from "../models/category.js";
import ResponseUtil from "../../../../utils/response.js";
import mongoose from "mongoose";
import ICategory from "../models/category.js";

interface ICategory {
  name: string;
  parentId: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

class AdminRepositories {
  
  constructor() {
  }
  async saveCareerOptionsTree(treeData: any, parentId: ObjectId | null, order: number = 1) {
    for (const node of treeData) {
      const { name, children = [] } = node;

      // Save current node
      const newNode = new CategoryModel({
        name,
        parentId,
        order
      });

      const savedNode = await newNode.save();

      // Recurse if children exist
      if (children.length > 0) {
        await this.saveCareerOptionsTree(children, savedNode._id, order + 1);
      }

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

}
export default AdminRepositories;