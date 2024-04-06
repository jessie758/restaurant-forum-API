const { Category } = require('../models');

const categoryController = {
  getCategories: async (req, res, next) => {
    const id = req.params.id;

    try {
      const [categories, category] = await Promise.all([
        Category.findAll({ raw: true }),
        id ? Category.findByPk(id, { raw: true }) : null,
      ]);

      return res.render('admin/categories', { categories, category });
    } catch (error) {
      return next(error);
    }
  },
  postCategory: async (req, res, next) => {
    const { name } = req.body;

    try {
      if (!name) throw new Error('Category name is required.');

      await Category.create({ name });

      req.flash('success_messages', 'Category was successfully created.');
      return res.redirect('/admin/categories');
    } catch (error) {
      return next(error);
    }
  },
  putCategory: async (req, res, next) => {
    const id = req.params.id;
    const { name } = req.body;

    try {
      if (!name) throw new Error('Category name is required.');

      const category = await Category.findByPk(id);

      if (!category) throw new Error(`Category doesn't exist.`);

      await category.update({ name });

      req.flash('success_messages', 'Category was successfully updated.');
      return res.redirect('/admin/categories');
    } catch (error) {
      return next(error);
    }
  },
  deleteCategory: async (req, res, next) => {
    const id = req.params.id;

    try {
      const category = await Category.findByPk(id);

      if (!category) throw new Error(`Category doesn't exist.`);

      await category.destroy();

      req.flash('success_messages', 'Category was successfully deleted.');
      return res.redirect('/admin/categories');
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = categoryController;
