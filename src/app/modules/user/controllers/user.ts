import { Request, Response, NextFunction } from 'express';
import ResponseUtil from "../../../utils/response.js";
import { API_MESSAGES } from '../../../constants/enums.js';
import UserService from '../services/user.js';
class UserController {
    public userService: UserService;
    constructor() {
        this.userService = new UserService();
    }
    
    async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
           if (!req.user || !req.user._id ) {
      ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
      return;
    }
            const UserId = req.user._id;
            const UserData = req.body;

            const result = await this.userService.updateUser(UserId, UserData);

            ResponseUtil.success(res, result, API_MESSAGES.USER.User_UPDATED);
        } catch (error) {
            next(error);
        }
    }

    async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let categoryId = req.query.categoryId;
            const Users = await this.userService.getUsers();
            if (categoryId) {
                const UsersByCategory = await this.userService.getUsersByCategory(categoryId as string);
                ResponseUtil.success(res, UsersByCategory, API_MESSAGES.USER.UserS_FETCHED);
            }
         ResponseUtil.success(res, Users, API_MESSAGES.USER.UserS_FETCHED);
        } catch (error) {
            next(error);
        }
    }
}

export default UserController;