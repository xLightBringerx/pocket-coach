const Category = require("../models/Category");

function listCategories() {
  return Category.find().sort({ name: 1 }); // A to Z
}

module.exports = { listCategories };