import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productNameSnapshot: {
      type: String,
      required: true
    },
    productImageSnapshot: {
      type: String,
      default: ''
    },
    unitPriceSnapshot: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    },
    note: {
      type: String,
      default: ''
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true, default: '' },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Order must contain at least one item'
      }
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE'],
      default: 'COD'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending'
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true
    },
    statusHistory: [statusHistorySchema],
    idempotencyKey: {
      type: String,
      index: true,
      sparse: true
    }
  },
  {
    timestamps: true
  }
);

// Helpful index for customer order history and admin analytics
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
