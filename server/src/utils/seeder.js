import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import slugify from 'slugify';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

export const seedDatabase = async (autoClose = true) => {
  try {
    console.log('[Seeder] Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({})
    ]);

    console.log('[Seeder] Creating users...');
    const adminPasswordHash = await User.hashPassword('Admin@123');
    const customerPasswordHash = await User.hashPassword('Customer@123');

    const admin = await User.create({
      name: 'ShopSphere Administrator',
      email: 'admin@shopsphere.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+91 98765 43210'
    });

    const customer = await User.create({
      name: 'Alex Morgan',
      email: 'customer@shopsphere.com',
      passwordHash: customerPasswordHash,
      role: 'customer',
      phone: '+91 91234 56789'
    });

    console.log('[Seeder] Users created:');
    console.log('  Admin:    admin@shopsphere.com    / Admin@123');
    console.log('  Customer: customer@shopsphere.com / Customer@123');

    console.log('[Seeder] Creating categories...');
    const categoriesData = [
      {
        name: 'Audio & Sound',
        slug: 'audio-sound',
        description: 'High-fidelity headphones, studio monitors, earbuds, and premium sound systems.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
      },
      {
        name: 'Electronics & Tech',
        slug: 'electronics-tech',
        description: 'Smart wearables, productivity accessories, mechanical peripherals, and gear.',
        image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80'
      },
      {
        name: 'Fashion & Bags',
        slug: 'fashion-bags',
        description: 'Minimalist leather goods, commuter backpacks, timeless apparel, and accessories.',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
      },
      {
        name: 'Home & Workspace',
        slug: 'home-workspace',
        description: 'Ergonomic furniture, ambient desk lamps, artisanal drinkware, and living decor.',
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80'
      },
      {
        name: 'Fitness & Outdoors',
        slug: 'fitness-outdoors',
        description: 'Athletic footwear, training mats, insulated bottles, and active lifestyle essentials.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
      }
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    const catMap = {};
    createdCategories.forEach((cat) => {
      catMap[cat.slug] = cat._id;
    });

    console.log('[Seeder] Creating products with rich images...');
    const productsData = [
      {
        name: 'ShopSphere Studio ANC Pro Wireless Headphones',
        slug: 'shopsphere-studio-anc-pro-headphones',
        description: 'Active Noise Cancellation with 40-hour battery life, plush memory-foam earcups, multi-device Bluetooth 5.3 pairing, and custom 40mm neodymium drivers for pristine acoustic clarity.',
        price: 249.99,
        category: catMap['audio-sound'],
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
        ],
        sku: 'AUD-ANC-001',
        stock: 35,
        featured: true,
        isActive: true
      },
      {
        name: 'ChronoPulse Titan Smartwatch & Fitness Tracker',
        slug: 'chronopulse-titan-smartwatch',
        description: 'Aerospace-grade titanium chassis with vivid AMOLED always-on display, continuous SpO2/ECG heart-rate monitoring, offline GPS navigation, and 5 ATM water resistance.',
        price: 199.50,
        category: catMap['electronics-tech'],
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
        ],
        sku: 'ELC-WAT-002',
        stock: 22,
        featured: true,
        isActive: true
      },
      {
        name: 'Aerotrek Urban Weatherproof Commuter Backpack',
        slug: 'aerotrek-urban-commuter-backpack',
        description: 'Crafted from rugged Cordura ballistic nylon with waterproof magnetic Fidlock closures, dedicated padded 16-inch laptop compartment, and concealed anti-theft passport pocket.',
        price: 89.00,
        category: catMap['fashion-bags'],
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80'
        ],
        sku: 'FSH-BCK-003',
        stock: 4, // Low stock alert
        featured: true,
        isActive: true
      },
      {
        name: 'ApexPro 75% Wireless Mechanical Keyboard',
        slug: 'apexpro-wireless-mechanical-keyboard',
        description: 'Hot-swappable custom lubricated linear switches, solid anodized aluminum body, per-key RGB backlighting, tri-mode connectivity (2.4GHz / BT / USB-C), and PBT doubleshot keycaps.',
        price: 139.00,
        category: catMap['electronics-tech'],
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80'
        ],
        sku: 'ELC-KBD-004',
        stock: 18,
        featured: false,
        isActive: true
      },
      {
        name: 'Lumina Minimalist Architectural LED Desk Lamp',
        slug: 'lumina-minimalist-led-desk-lamp',
        description: 'Sleek matte teal finish with touch stepless dimming, color temperature adjustment (2700K - 6500K), built-in 15W Qi wireless fast-charging pad on the base, and auto-ambient sensor.',
        price: 64.99,
        category: catMap['home-workspace'],
        images: [
          'https://images.unsplash.com/photo-1534972195531-a756b1126f24?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
        ],
        sku: 'HOM-LMP-005',
        stock: 15,
        featured: false,
        isActive: true
      },
      {
        name: 'Velocity Strider Carbon Pro Running Shoes',
        slug: 'velocity-strider-carbon-running-shoes',
        description: 'Engineered breathable knit upper with full-length responsive carbon fiber propulsion plate, super-critical nitrogen-infused cushioning, and Continental rubber grip outsole.',
        price: 159.00,
        category: catMap['fitness-outdoors'],
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80'
        ],
        sku: 'FIT-SHU-006',
        stock: 3, // Low stock alert
        featured: true,
        isActive: true
      },
      {
        name: 'BassWave 360 IP67 Waterproof Bluetooth Speaker',
        slug: 'basswave-360-waterproof-speaker',
        description: 'Dual passive radiators deliver deep, room-filling 360-degree sound. Floats in water, drop-proof silicone armor, 24-hour play time, and party-pair capability up to 100 speakers.',
        price: 79.99,
        category: catMap['audio-sound'],
        images: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'
        ],
        sku: 'AUD-SPK-007',
        stock: 40,
        featured: false,
        isActive: true
      },
      {
        name: 'Oxford Handcrafted Bifold Vegetable-Tanned Leather Wallet',
        slug: 'oxford-handcrafted-leather-wallet',
        description: 'Hand-stitched full-grain Italian leather with RFID-blocking protection, 8 card slots, dual cash compartment, and slim 9mm silhouette that patinas beautifully over time.',
        price: 45.00,
        category: catMap['fashion-bags'],
        images: [
          'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1606503825008-909a67e63c3e?w=800&auto=format&fit=crop&q=80'
        ],
        sku: 'FSH-WLT-008',
        stock: 50,
        featured: false,
        isActive: true
      },
      {
        name: 'Artisan Matte Ceramic Coffee Mug Set of 4',
        slug: 'artisan-matte-ceramic-mug-set',
        description: 'Wheel-thrown organic stoneware ceramics finished in signature deep teal and aqua glazes. Microwave and dishwasher safe, 380ml capacity with ergonomic comfortable grip.',
        price: 36.00,
        category: catMap['home-workspace'],
        images: [
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80'
        ],
        sku: 'HOM-MUG-009',
        stock: 25,
        featured: false,
        isActive: true
      },
      {
        name: 'FlowState High-Density Alignment Yoga & Training Mat',
        slug: 'flowstate-alignment-yoga-mat',
        description: 'Biodegradable natural tree rubber base with ultra-grippy polyurethane top surface. Laser-etched alignment guides to improve balance, 5mm thick joint support.',
        price: 52.00,
        category: catMap['fitness-outdoors'],
        images: [
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&auto=format&fit=crop&q=80'
        ],
        sku: 'FIT-MAT-010',
        stock: 30,
        featured: false,
        isActive: true
      },
      {
        name: 'HydroTemp Smart Vacuum Insulated 750ml Flask',
        slug: 'hydrotemp-smart-insulated-flask',
        description: 'Touch-sensitive LED temperature display cap, medical grade 18/8 stainless steel, double-wall copper insulation keeps water icy cold for 24 hours or steaming hot for 12 hours.',
        price: 29.99,
        category: catMap['fitness-outdoors'],
        images: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
        ],
        sku: 'FIT-BOT-011',
        stock: 2, // Low stock alert
        featured: false,
        isActive: true
      },
      {
        name: 'ErgoComfort Executive Mesh Desk Chair',
        slug: 'ergocomfort-executive-mesh-chair',
        description: 'Dynamic 4D adjustable armrests, synchronized multi-tilt mechanism, breathable German elastomer mesh, and responsive lumbar support for 8+ hour posture relief.',
        price: 289.00,
        category: catMap['home-workspace'],
        images: [
          'https://images.unsplash.com/photo-1580481077195-c992795c37eb?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80'
        ],
        sku: 'HOM-CHR-012',
        stock: 12,
        featured: true,
        isActive: true
      }
    ];

    const createdProducts = await Product.insertMany(productsData);
    console.log(`[Seeder] Created ${createdProducts.length} products.`);

    console.log('[Seeder] Creating sample orders to populate dashboard & customer history...');
    await Order.create({
      orderNumber: 'ORD-20261025-104921',
      userId: customer._id,
      items: [
        {
          productId: createdProducts[0]._id,
          productNameSnapshot: createdProducts[0].name,
          productImageSnapshot: createdProducts[0].images[0],
          unitPriceSnapshot: createdProducts[0].price,
          quantity: 1,
          lineTotal: createdProducts[0].price
        },
        {
          productId: createdProducts[7]._id,
          productNameSnapshot: createdProducts[7].name,
          productImageSnapshot: createdProducts[7].images[0],
          unitPriceSnapshot: createdProducts[7].price,
          quantity: 1,
          lineTotal: createdProducts[7].price
        }
      ],
      shippingAddress: {
        fullName: 'Alex Morgan',
        phone: '+91 91234 56789',
        addressLine1: '42 Silicon Avenue, Tech Park',
        addressLine2: 'Tower B, Suite 501',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        country: 'India'
      },
      subtotal: 294.99,
      shippingFee: 0,
      discount: 0,
      total: 294.99,
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Confirmed',
      statusHistory: [
        { status: 'Pending', note: 'Order placed by customer via Cash on Delivery.', changedAt: new Date(Date.now() - 86400000 * 2) },
        { status: 'Confirmed', note: 'Order confirmed and verified by fulfillment team.', changedAt: new Date(Date.now() - 86400000) }
      ]
    });

    await Order.create({
      orderNumber: 'ORD-20261026-902184',
      userId: customer._id,
      items: [
        {
          productId: createdProducts[1]._id,
          productNameSnapshot: createdProducts[1].name,
          productImageSnapshot: createdProducts[1].images[0],
          unitPriceSnapshot: createdProducts[1].price,
          quantity: 1,
          lineTotal: createdProducts[1].price
        }
      ],
      shippingAddress: {
        fullName: 'Alex Morgan',
        phone: '+91 91234 56789',
        addressLine1: '42 Silicon Avenue, Tech Park',
        addressLine2: 'Tower B, Suite 501',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        country: 'India'
      },
      subtotal: 199.50,
      shippingFee: 0,
      discount: 0,
      total: 199.50,
      paymentMethod: 'ONLINE',
      paymentStatus: 'Paid',
      orderStatus: 'Shipped',
      statusHistory: [
        { status: 'Pending', note: 'Order placed via Online Payment.', changedAt: new Date(Date.now() - 86400000) },
        { status: 'Confirmed', note: 'Payment verified and order confirmed.', changedAt: new Date(Date.now() - 72000000) },
        { status: 'Processing', note: 'Package prepared and packed in warehouse.', changedAt: new Date(Date.now() - 50000000) },
        { status: 'Shipped', note: 'Handed over to courier express logistics.', changedAt: new Date(Date.now() - 20000000) }
      ]
    });

    // Populate initial customer cart with 1 sample item
    await Cart.create({
      userId: customer._id,
      items: [
        {
          productId: createdProducts[2]._id,
          quantity: 1
        }
      ]
    });

    console.log('[Seeder] Database seeded successfully!');
    if (autoClose) {
      await closeDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seeder Error] Failed to seed database:', error);
    if (autoClose) {
      await closeDB();
      process.exit(1);
    }
    throw error;
  }
};

// Check if running as script directly
const isDirectRun = process.argv[1]?.endsWith('seeder.js');
if (isDirectRun) {
  connectDB().then(() => seedDatabase(true));
}
