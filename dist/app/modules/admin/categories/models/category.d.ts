import mongoose, { Document } from "mongoose";
export interface ICategory extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    parentId?: mongoose.Types.ObjectId | null;
    description?: string;
    image?: string;
    order: number;
    isLeafNode?: boolean;
    salary_range?: string;
    qualifying_exams?: string[];
    pros?: string[];
    cons?: string[];
    myth?: string;
    superstar1?: string;
    superstar2?: string;
    superstar3?: string;
    reality?: string;
    related_careers?: mongoose.Types.ObjectId[];
    checklist?: string[];
    technical_skills?: string[];
    soft_skills?: string[];
    potential_earnings?: string[];
    future_growth?: string;
    a_day_in_life?: string;
    growth_path?: string;
}
declare const CategoryModel: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}, {}> & ICategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default CategoryModel;
//# sourceMappingURL=category.d.ts.map