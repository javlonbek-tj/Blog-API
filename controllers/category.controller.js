import categoryService from '../services/category.service.js';

class CategoryController {
  async createCategory(req, res, next) {
    try {
      const newCategory = await categoryService.createCategory(req.user, req.body.title);
      return res.status(201).json({
        status: 'success',
        data: newCategory,
      });
    } catch (e) {
      next(e);
    }
  }

  async findAllCategories(req, res, next) {
    try {
      const allCategories = await categoryService.getAllCategories();
      return res.status(200).json({
        status: 'success',
        data: allCategories,
      });
    } catch (e) {
      next(e);
    }
  }

  async findOneCategory(req, res, next) {
    try {
      const category = await categoryService.findOneCategory(req.params.id);
      return res.status(200).json({
        status: 'success',
        data: category,
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id);
      return res.status(204).json({
        status: 'success',
        message: 'Category deleted successfully',
      });
    } catch (e) {
      next(e);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const updatedCategory = await categoryService.updateCategory(req.params.id);
      return res.status(200).json({
        status: 'success',
        data: updatedCategory,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new CategoryController();
