import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { generateOrderNumber } from '../utils/helpers.js';

export const createOrder = async (req, res, next) => {
  const decrementedProducts = [];

  try {
    const { shippingAddress, paymentMethod = 'COD', idempotencyKey } = req.body;

    // 1. Check idempotency if key provided
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({
        userId: req.user._id,
        idempotencyKey
      });
      if (existingOrder) {
        return res.status(200).json({
          success: true,
          message: 'Order already processed.',
          order: existingOrder
        });
      }
    }

    // 2. Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required shipping address fields (Full Name, Phone, Address, City, State, Postal Code).'
      });
    }

    // 3. Fetch user's cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your shopping cart is empty. Please add items before checking out.'
      });
    }

    // 4. Validate all products and check stock availability
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `One or more products in your cart are no longer available. Please review your cart.`
        });
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for item "${product.name}".`
        });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for "${product.name}". Only ${product.stock} items remaining.`
        });
      }

      const lineTotal = Number((product.price * qty).toFixed(2));
      subtotal += lineTotal;

      orderItems.push({
        productId: product._id,
        productNameSnapshot: product.name,
        productImageSnapshot: product.images && product.images.length > 0 ? product.images[0] : '',
        unitPriceSnapshot: product.price,
        quantity: qty,
        lineTotal
      });
    }

    subtotal = Number(subtotal.toFixed(2));
    const shippingFee = subtotal >= 500 ? 0 : 50;
    const discount = 0;
    const total = Number((subtotal + shippingFee - discount).toFixed(2));

    // 5. Atomic Stock Reduction with Rollback on concurrency failure
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity } // Guaranteed atomic inventory check
        },
        {
          $inc: { stock: -item.quantity }
        },
        { new: true }
      );

      if (!updatedProduct) {
        // Rollback all previously decremented items
        for (const dec of decrementedProducts) {
          await Product.findByIdAndUpdate(dec.productId, {
            $inc: { stock: dec.quantity }
          });
        }

        return res.status(400).json({
          success: false,
          message: `Unable to complete checkout: "${item.productNameSnapshot}" ran out of stock concurrently. Please review your cart.`
        });
      }

      decrementedProducts.push({
        productId: item.productId,
        quantity: item.quantity
      });
    }

    // 6. Generate order
    const orderNumber = generateOrderNumber();
    const newOrder = await Order.create({
      orderNumber,
      userId: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        addressLine2: shippingAddress.addressLine2 ? shippingAddress.addressLine2.trim() : '',
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country ? shippingAddress.country.trim() : 'India'
      },
      subtotal,
      shippingFee,
      discount,
      total,
      paymentMethod: paymentMethod === 'ONLINE' ? 'ONLINE' : 'COD',
      paymentStatus: paymentMethod === 'ONLINE' ? 'Paid' : 'Pending',
      orderStatus: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          note: `Order placed via ${paymentMethod === 'ONLINE' ? 'Online Payment (Verified)' : 'Cash on Delivery (COD)'}.`,
          changedAt: new Date()
        }
      ],
      idempotencyKey: idempotencyKey || undefined
    });

    // 7. Clear cart only after successful order creation
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: newOrder
    });
  } catch (error) {
    // If order creation failed after stock decrement, restore inventory
    if (decrementedProducts.length > 0) {
      for (const dec of decrementedProducts) {
        try {
          await Product.findByIdAndUpdate(dec.productId, {
            $inc: { stock: dec.quantity }
          });
        } catch (rbErr) {
          console.error('Critical rollback error:', rbErr);
        }
      }
    }
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if query is Mongo ID or orderNumber
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderNumber: id };
    const order = await Order.findOne(query).populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Security check: Only order owner or admin can view
    const isOwner = order.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderNumber: id };
    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check ownership
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own orders.'
      });
    }

    // Eligible cancellation status check
    const eligibleStatuses = ['Pending', 'Confirmed'];
    if (!eligibleStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is currently in '${order.orderStatus}' status.`
      });
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      note: reason ? reason.trim() : 'Cancelled by customer.',
      changedAt: new Date()
    });

    await order.save();

    // Restock inventory safely
    for (const item of order.items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and inventory restored.',
      order
    });
  } catch (error) {
    next(error);
  }
};
