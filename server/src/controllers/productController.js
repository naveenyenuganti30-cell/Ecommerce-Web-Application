import Product from '../models/Product.js';
import Category from '../models/Category.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      featured,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const query = { isActive: true };

    // Search keyword
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }, { sku: searchRegex }];
    }

    // Category filter
    if (category && category !== 'all') {
      // Check if category is slug or ID
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          query.category = cat._id;
        } else {
          // If category slug doesn't exist, return empty result cleanly
          return res.status(200).json({
            success: true,
            products: [],
            pagination: { total: 0, page: Number(page), pages: 0, limit: Number(limit) }
          });
        }
      }
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        query.price.$lte = Number(maxPrice);
      }
    }

    // In Stock filter
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
    }

    // Featured filter
    if (featured === 'true' || featured === true) {
      query.featured = true;
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'name_asc') {
      sortOption = { name: 1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or is currently unavailable.'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or is currently unavailable.'
      });
    }

    // Fetch up to 4 related products in the same category
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true
    })
      .populate('category', 'name slug')
      .limit(4);

    res.status(200).json({
      success: true,
      product,
      relatedProducts
    });
  } catch (error) {
    next(error);
  }
};
