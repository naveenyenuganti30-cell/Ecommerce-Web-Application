import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-deep-teal-900 text-gray-300 pt-16 pb-12 border-t border-teal-mid/30">
      {/* Guarantees / Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-aqua/20 flex items-center justify-center text-aqua flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Express Shipping</h4>
              <p className="text-xs text-gray-400 mt-0.5">Free delivery on orders over ₹500</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-orange-accent/20 flex items-center justify-center text-orange-accent flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Genuine Warranty</h4>
              <p className="text-xs text-gray-400 mt-0.5">100% verified authentic products</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-aqua/20 flex items-center justify-center text-aqua flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Hassle-Free Returns</h4>
              <p className="text-xs text-gray-400 mt-0.5">7-day replacement guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-teal-mid/40 flex items-center justify-center text-aqua flex-shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Dedicated Support</h4>
              <p className="text-xs text-gray-400 mt-0.5">Mon - Sat from 9am to 7pm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-aqua to-teal-mid flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Shop<span className="text-aqua">Sphere</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Discover expertly crafted technology, audio gear, minimalist workspace additions, and lifestyle essentials. Designed for clarity, durability, and daily elegance.
            </p>
            <div className="pt-2 text-xs text-gray-400 space-y-1.5">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-aqua flex-shrink-0" />
                42 Silicon Avenue, Tech Quarter, Bengaluru 560100
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-aqua flex-shrink-0" />
                +91 (080) 4123-8900
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-aqua flex-shrink-0" />
                support@shopsphere.com
              </p>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h5 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Categories
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/catalog?category=audio-sound" className="hover:text-aqua transition-colors">
                  Audio & Sound
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=electronics-tech" className="hover:text-aqua transition-colors">
                  Electronics & Tech
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=fashion-bags" className="hover:text-aqua transition-colors">
                  Fashion & Bags
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=home-workspace" className="hover:text-aqua transition-colors">
                  Home & Workspace
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=fitness-outdoors" className="hover:text-aqua transition-colors">
                  Fitness & Outdoors
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Customer Care
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/orders" className="hover:text-aqua transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-aqua transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-aqua transition-colors">
                  Account Details
                </Link>
              </li>
              <li>
                <span className="text-gray-400">Cash on Delivery (COD)</span>
              </li>
              <li>
                <span className="text-gray-400">Shipping Policy</span>
              </li>
            </ul>
          </div>

          {/* Quick Admin Access */}
          <div>
            <h5 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">
              Portals
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/admin" className="text-orange-accent hover:underline font-medium">
                  Administrator Portal &rarr;
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-aqua transition-colors">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-aqua transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <p>&copy; {new Date().getFullYear()} ShopSphere Inc. All rights reserved.</p>
        <p className="flex items-center gap-4">
          <span>Secure 256-bit SSL Encryption</span>
          <span>&bull;</span>
          <span>PCI-DSS Compliant</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
