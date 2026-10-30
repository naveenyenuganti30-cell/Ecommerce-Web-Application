import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Helper to calculate cart totals and line items from authoritative database records
export const formatAndCalculateCart = async (cartDoc) => {
  if (!cartDoc) {
    return {
      items: [],
      subtotal: 0,
      shippingFee: 0,
      discount: 0,
      total: 0,
      itemCount: 0
    };
  }

  // Populate product details
  await cartDoc.populate({
    path: 'items.productId',
    select: 'name slug price images stock isActive sku'
  });

  const validItems = [];
  let subtotal = 0;
  let itemCount = 0;
  let itemsModified = false;

  for (const item of cartDoc.items) {
    const product = item.productId;

    // Check if product was deleted or deactivated
    if (!product || !product.isActive) {
      itemsModified = true;
      continue; // Filter out unavailable products
    }

    // Auto-adjust quantity if available stock is lower than requested quantity
    let quantity = item.quantity;
    if (product.stock <= 0) {
      itemsModified = true;
      continue; // Omit out-of-stock products
    }

    if (quantity > product.stock) {
      quantity = product.stock;
      item.quantity = quantity;
      itemsModified = true;
    }

    const unitPrice = product.price;
    const lineTotal = Number((unitPrice * quantity).toFixed(2));
    subtotal += lineTotal;
    itemCount += quantity;

    validItems.push({
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        images: product.images,
        stock: product.stock,
        sku: product.sku
      },
      quantity,
      unitPrice,
      lineTotal
    });
  }

  // If unavailable items were pruned, save updated cart doc
  if (itemsModified) {
    cartDoc.items = validItems.map((i) => ({
      productId: i.product._id,
      quantity: i.quantity
    }));
    await cartDoc.save();
  }

  subtotal = Number(subtotal.toFixed(2));
  // Free shipping over 500, or flat 50 if subtotal > 0
  const shippingFee = subtotal >= 500 || subtotal === 0 ? 0 : 50;
  const discount = 0;
  const total = Number((subtotal + shippingFee - discount).toFixed(2));

  return {
    items: validItems,
    subtotal,
    shippingFee,
    discount,
    total,
    itemCount
  };
};

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const formattedCart = await formatAndCalculateCart(cart);
    res.status(200).json({
      success: true,
      cart: formattedCart
    });
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const parsedQty = parseInt(quantity, 10);
    if (!productId || isNaN(parsedQty) || parsedQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product or quantity. Quantity must be a positive integer.'
      });
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or is currently unavailable.'
      });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, this product is currently out of stock.'
      });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      const newTotalQty = cart.items[existingItemIndex].quantity + parsedQty;
      if (newTotalQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${product.stock} units are in stock (${cart.items[existingItemIndex].quantity} already in cart).`
        });
      }
      cart.items[existingItemIndex].quantity = newTotalQty;
    } else {
      if (parsedQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${parsedQty} units. Only ${product.stock} units are currently in stock.`
        });
      }
      cart.items.push({ productId, quantity: parsedQty });
    }

    await cart.save();
    const formattedCart = await formatAndCalculateCart(cart);

    res.status(200).json({
      success: true,
      message: 'Product added to shopping cart.',
      cart: formattedCart
    });
  } catch (error) {
    next(error);
  }
};

export const updateItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid integer.'
      });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    if (parsedQty <= 0) {
      // Remove item
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId.toString());
      await cart.save();
      const formattedCart = await formatAndCalculateCart(cart);
      return res.status(200).json({
        success: true,
        message: 'Item removed from cart.',
        cart: formattedCart
      });
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      // Product no longer exists, remove it
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId.toString());
      await cart.save();
      const formattedCart = await formatAndCalculateCart(cart);
      return res.status(400).json({
        success: false,
        message: 'Product is no longer available and was removed from your cart.',
        cart: formattedCart
      });
    }

    if (parsedQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Maximum available quantity in stock is ${product.stock}.`
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in your cart.'
      });
    }

    cart.items[itemIndex].quantity = parsedQty;
    await cart.save();

    const formattedCart = await formatAndCalculateCart(cart);
    res.status(200).json({
      success: true,
      message: 'Cart updated successfully.',
      cart: formattedCart
    });
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId.toString());
    await cart.save();

    const formattedCart = await formatAndCalculateCart(cart);
    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      cart: formattedCart
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.',
      cart: {
        items: [],
        subtotal: 0,
        shippingFee: 0,
        discount: 0,
        total: 0,
        itemCount: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const mergeGuestCart = async (req, res, next) => {
  try {
    const { guestItems } = req.body;
    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      let cart = await Cart.findOne({ userId: req.user._id });
      if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });
      const formatted = await formatAndCalculateCart(cart);
      return res.status(200).json({ success: true, cart: formatted });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    for (const gItem of guestItems) {
      if (!gItem.productId || !gItem.quantity) continue;
      const product = await Product.findOne({ _id: gItem.productId, isActive: true });
      if (!product || product.stock <= 0) continue;

      const existingIndex = cart.items.findIndex(
        (i) => i.productId.toString() === gItem.productId.toString()
      );

      const qtyToAdd = Math.min(parseInt(gItem.quantity, 10) || 1, product.stock);

      if (existingIndex > -1) {
        const combined = cart.items[existingIndex].quantity + qtyToAdd;
        cart.items[existingIndex].quantity = Math.min(combined, product.stock);
      } else {
        cart.items.push({ productId: product._id, quantity: qtyToAdd });
      }
    }

    await cart.save();
    const formattedCart = await formatAndCalculateCart(cart);

    res.status(200).json({
      success: true,
      message: 'Guest cart merged successfully.',
      cart: formattedCart
    });
  } catch (error) {
    next(error);
  }
};
