import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'shopsphere_super_secret_jwt_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    secret,
    { expiresIn }
  );
};

export const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${dateStr}-${randomSuffix}`;
};
