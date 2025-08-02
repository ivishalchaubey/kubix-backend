import mongoose, { Document } from "mongoose";
export interface ICategory extends Document {
    description: string;
    degree: string;
    branch: string;
    course: string;
    courseStream: string;
    subject: string;
}
declare const CategoryModel: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}> & ICategory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default CategoryModel;
//# sourceMappingURL=category.d.ts.map