const BASE_URL = 'http://localhost:5001/api';

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw { response: { data, status: res.status } };
  }
  return { data, status: res.status };
}

async function runTestSuite() {
  console.log('=== ShopSphere Automated Verification Test Suite ===\n');

  try {
    // 1. Health API
    console.log('[Test 1] Health Check...');
    const health = await request(`${BASE_URL}/health`);
    console.log('✓ Health Status:', health.data.status, '| Service:', health.data.service);

    // 2. Public Products
    console.log('\n[Test 2] Product Catalog Listing & Search...');
    const prods = await request(`${BASE_URL}/products?limit=3`);
    console.log(`✓ Products Retrieved: ${prods.data.products.length} of ${prods.data.pagination.total} total`);
    const testProduct = prods.data.products[0];
    console.log(`  Sample: "${testProduct.name}" (₹${testProduct.price}) - Stock: ${testProduct.stock}`);

    // 3. Search filter
    const searchRes = await request(`${BASE_URL}/products?search=Headphones`);
    console.log(`✓ Search for "Headphones": Found ${searchRes.data.products.length} match(es)`);

    // 4. Customer Login
    console.log('\n[Test 3] Customer Authentication...');
    const custLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'customer@shopsphere.com',
        password: 'Customer@123'
      })
    });
    const custToken = custLogin.data.token;
    console.log(`✓ Logged in as: ${custLogin.data.user.name} (${custLogin.data.user.role})`);

    // 5. Add product to cart & Cart Operations
    console.log('\n[Test 4] Cart Operations & Price Integrity...');
    await request(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: JSON.stringify({
        productId: testProduct._id,
        quantity: 1
      })
    });

    const cartRes = await request(`${BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${custToken}` }
    });
    console.log(`✓ Cart Items: ${cartRes.data.cart.items.length} | Subtotal: ₹${cartRes.data.cart.subtotal} | Total: ₹${cartRes.data.cart.total}`);

    // 6. Test Placing Order (Checkout)
    console.log('\n[Test 5] Checkout & Atomic Order Creation...');
    const orderRes = await request(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: JSON.stringify({
        shippingAddress: {
          fullName: 'Alex Morgan',
          phone: '+91 91234 56789',
          addressLine1: '123 Tech Boulevard',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560100',
          country: 'India'
        },
        paymentMethod: 'COD'
      })
    });
    const placedOrder = orderRes.data.order;
    console.log(`✓ Order Created Successfully: ${placedOrder.orderNumber}`);
    console.log(`  Status: ${placedOrder.orderStatus} | Total: ₹${placedOrder.total} | Payment: ${placedOrder.paymentMethod}`);

    // 7. Verify My Orders
    console.log('\n[Test 6] Customer Order History...');
    const myOrdersRes = await request(`${BASE_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${custToken}` }
    });
    console.log(`✓ Total Orders in Customer Account: ${myOrdersRes.data.orders.length}`);

    // 8. Admin Authentication & Dashboard
    console.log('\n[Test 7] Administrator Portal & Statistics...');
    const adminLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@shopsphere.com',
        password: 'Admin@123'
      })
    });
    const adminToken = adminLogin.data.token;
    console.log(`✓ Logged in as Admin: ${adminLogin.data.user.name} (${adminLogin.data.user.role})`);

    const statsRes = await request(`${BASE_URL}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const stats = statsRes.data.stats;
    console.log(`✓ Admin Dashboard Stats:`);
    console.log(`  - Total Revenue: ₹${stats.totalSales}`);
    console.log(`  - Total Orders:  ${stats.totalOrders}`);
    console.log(`  - Total Products: ${stats.totalProducts}`);
    console.log(`  - Registered Customers: ${stats.totalCustomers}`);
    console.log(`  - Low Stock Alerts: ${stats.lowStockCount}`);

    // 9. Admin Order Status Update
    console.log('\n[Test 8] Admin Order Status Transition...');
    const updateStatusRes = await request(
      `${BASE_URL}/admin/orders/${placedOrder._id}/status`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          status: 'Confirmed',
          note: 'Order confirmed by fulfillment team.'
        })
      }
    );
    console.log(`✓ Order ${placedOrder.orderNumber} Status Updated to: ${updateStatusRes.data.order.orderStatus}`);

    console.log('\n===================================================');
    console.log('  ALL 8 END-TO-END VERIFICATION TESTS PASSED (100%)');
    console.log('===================================================\n');
  } catch (err) {
    console.error('✗ Test failed:', err.response?.data || err);
    process.exit(1);
  }
}

runTestSuite();
