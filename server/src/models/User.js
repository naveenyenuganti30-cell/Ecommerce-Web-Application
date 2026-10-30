import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [60, 'Name cannot exceed 60 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Method to verify candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static method to hash password
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
};

// Exclude passwordHash in standard JSON responses
userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.passwordHash;
  return userObj;
};

const User = mongoose.model('User', userSchema);
export default User;
