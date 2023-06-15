import ApiError from './appError.js';
import CategoryModal from '../models/category.model.js';

class CategoryService {
  async createCategory(title, user) {
    if (user.blocked) {
      throw new ApiError(403, 'Access denied, Your account is blocked');
    }
    const newCategory = await CategoryModal.create({ user: user._id, title });
    return newCategory;
  }

  async getAllCategories() {
    const categories = await CategoryModal.find();
    return categories;
  }

  async getOneCategory(id) {
    const category = await CategoryModal.findOne(id);
    return category;
  }

  async deleteCategory(id) {
    const removedCategory = await CategoryModal.findByIdAndRemove(id);
    return removedCategory;
  }

  async updateCategory(id, title) {
    const updatedCategory = await CategoryModal.findByIdAndUpdate(id, title, {
      new: true,
      runValidators: true,
    });
    return updatedCategory;
  }
}

export default new CategoryService();
