const categoryService = require("../services/categoryService");

async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.listCategories();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCategories };