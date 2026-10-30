import Category from '../models/Category.js';
import Product from '../models/Product.js';
import slugify from 'slugify';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    // Attach product counts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id, isActive: true });
        return {
          ...cat.toObject(),
          productCount: count
        };
      })
    );

    res.status(200).json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
};

export const adminCreateCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      image: image || '',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateCategory = async (req, res, next) => {
  try {
    const { name, description, image, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) {
      category.name = name.trim();
      category.slug = slugify(name.trim(), { lower: true, strict: true });
    }
    if (description !== undefined) category.description = description.trim();
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if products exist in category
    const count = await Product.countDocuments({ category: category._id });
    if (count > 0) {
      // Soft-delete (deactivate) to protect relational integrity
      category.isActive = false;
      await category.save();
      return res.status(200).json({
        success: true,
        message: `Category deactivated because it contains ${count} products.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
