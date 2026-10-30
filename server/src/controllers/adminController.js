import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import slugify from 'slugify';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Calculate total revenue from non-cancelled orders
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalSales = revenueAgg.length > 0 ? Number(revenueAgg[0].totalRevenue.toFixed(2)) : 0;

    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const lowStockCount = await Product.countDocuments({ stock: { $lte: 5 }, isActive: true });

    // Low stock items preview
    const lowStockProducts = await Product.find({ stock: { $lte: 5 }, isActive: true })
      .select('name sku stock price images')
      .limit(6);

    // Recent 6 orders
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    // Status distribution
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    const orderStatusMap = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0
    };

    statusCounts.forEach((s) => {
      if (orderStatusMap[s._id] !== undefined) {
        orderStatusMap[s._id] = s.count;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalSales,
        pendingOrders,
        lowStockCount,
        lowStockProducts,
        recentOrders,
        orderStatusMap
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { search, category, stockStatus, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { sku: searchRegex }];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (stockStatus === 'out') {
      query.stock = 0;
    } else if (stockStatus === 'low') {
      query.stock = { $gt: 0, $lte: 5 };
    } else if (stockStatus === 'in') {
      query.stock = { $gt: 5 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
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

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, images, sku, stock, featured, isActive } = req.body;

    if (!name || !description || price === undefined || !category || !sku) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, category, and SKU are required.'
      });
    }

    const existingSku = await Product.findOne({ sku: sku.toUpperCase().trim() });
    if (existingSku) {
      return res.status(409).json({
        success: false,
        message: `Product with SKU "${sku.toUpperCase().trim()}" already exists.`
      });
    }

    const imageList = Array.isArray(images) && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
    ];

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${slugify(name.trim(), { lower: true, strict: true })}-${randomSuffix}`;

    const product = await Product.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      price: Number(price),
      category,
      images: imageList,
      sku: sku.toUpperCase().trim(),
      stock: Number(stock) || 0,
      featured: Boolean(featured),
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    const populated = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: populated
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, images, sku, stock, featured, isActive } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (sku && sku.toUpperCase().trim() !== product.sku) {
      const duplicateSku = await Product.findOne({
        sku: sku.toUpperCase().trim(),
        _id: { $ne: id }
      });
      if (duplicateSku) {
        return res.status(409).json({
          success: false,
          message: `Product with SKU "${sku.toUpperCase().trim()}" already exists.`
        });
      }
      product.sku = sku.toUpperCase().trim();
    }

    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (category) product.category = category;
    if (images && Array.isArray(images) && images.length > 0) product.images = images;
    if (stock !== undefined) product.stock = Math.max(0, Number(stock));
    if (featured !== undefined) product.featured = Boolean(featured);
    if (isActive !== undefined) product.isActive = Boolean(isActive);

    await product.save();

    const populated = await Product.findById(product._id).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: populated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check if product exists in any historical order
    const orderedCount = await Order.countDocuments({ 'items.productId': id });

    if (orderedCount > 0) {
      // Deactivate instead of hard deleting to preserve order history snapshots & references
      product.isActive = false;
      await product.save();
      return res.status(200).json({
        success: true,
        message: `Product was deactivated because it is referenced in ${orderedCount} order(s).`
      });
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Product deleted permanently.'
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'shippingAddress.fullName': searchRegex },
        { 'shippingAddress.phone': searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      orders,
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

export const getAdminOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderNumber: id };
    const order = await Order.findOne(query).populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderNumber: id };
    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.orderStatus === 'Delivered' && status !== 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change status of an already delivered order.'
      });
    }

    if (order.orderStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a cancelled order.'
      });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;

    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    // If moving to Cancelled, restock inventory
    if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity }
          });
        }
      }
    }

    order.statusHistory.push({
      status,
      note: note ? note.trim() : `Status changed from ${previousStatus} to ${status} by administrator.`,
      changedAt: new Date()
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      order
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const customerData = await Promise.all(
      customers.map(async (c) => {
        const orderCount = await Order.countDocuments({ userId: c._id });
        const orders = await Order.find({ userId: c._id, orderStatus: { $ne: 'Cancelled' } });
        const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

        return {
          ...c.toObject(),
          orderCount,
          totalSpent: Number(totalSpent.toFixed(2))
        };
      })
    );

    res.status(200).json({
      success: true,
      customers: customerData
    });
  } catch (error) {
    next(error);
  }
};
