import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be greater than or equal to 0']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required']
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A product must have at least one image'
      }
    },
    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ featured: 1, createdAt: -1 });

productSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${randomSuffix}`;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
