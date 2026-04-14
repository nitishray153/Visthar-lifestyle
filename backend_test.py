#!/usr/bin/env python3
"""
Visthar Ecommerce Backend API Testing Suite
Tests all major API endpoints for functionality and integration
"""

import requests
import sys
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

class VistharAPITester:
    def __init__(self, base_url: str = "https://eco-smart-hub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.test_product_id = None
        self.test_order_id = None
        self.session_id = str(uuid.uuid4())
        
        # Test counters
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test credentials
        self.admin_email = "admin@visthar.com"
        self.admin_password = "VistharAdmin2024!"
        
        print(f"🚀 Starting Visthar API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print(f"🔑 Admin: {self.admin_email}")
        print("-" * 60)

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, headers: Optional[Dict] = None, 
                 auth_token: Optional[str] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        # Setup headers
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if auth_token:
            test_headers['Authorization'] = f'Bearer {auth_token}'
        
        # Add session ID for cart operations
        if 'cart' in endpoint and not auth_token:
            test_headers['X-Session-ID'] = self.session_id

        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        print(f"   {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"   ✅ PASS - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"   ❌ FAIL - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   📝 Response: {error_data}")
                except:
                    print(f"   📝 Response: {response.text[:200]}")
                
                self.failed_tests.append({
                    'name': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'method': method
                })
                return False, {}

        except Exception as e:
            print(f"   ❌ ERROR - {str(e)}")
            self.failed_tests.append({
                'name': name,
                'endpoint': endpoint,
                'error': str(e),
                'method': method
            })
            return False, {}

    def test_health_check(self):
        """Test basic API health"""
        print("\n" + "="*60)
        print("🏥 HEALTH CHECK")
        print("="*60)
        
        success, data = self.run_test("API Health Check", "GET", "/", 200)
        if success and data.get('message'):
            print(f"   📋 API Message: {data['message']}")
        return success

    def test_auth_flow(self):
        """Test authentication endpoints"""
        print("\n" + "="*60)
        print("🔐 AUTHENTICATION TESTS")
        print("="*60)
        
        # Test admin login
        admin_success, admin_data = self.run_test(
            "Admin Login",
            "POST",
            "/auth/login",
            200,
            {"email": self.admin_email, "password": self.admin_password}
        )
        
        if admin_success and admin_data.get('token'):
            self.admin_token = admin_data['token']
            print(f"   🔑 Admin token acquired")
        
        # Test user registration
        test_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        user_success, user_data = self.run_test(
            "User Registration",
            "POST",
            "/auth/register",
            200,
            {
                "name": "Test User",
                "email": test_email,
                "password": "TestPass123!",
                "phone": "9876543210"
            }
        )
        
        if user_success and user_data.get('token'):
            self.user_token = user_data['token']
            self.test_user_id = user_data['user']['id']
            print(f"   👤 Test user created: {test_email}")
        
        # Test user profile access
        if self.user_token:
            self.run_test("Get User Profile", "GET", "/auth/me", 200, auth_token=self.user_token)
        
        return admin_success and user_success

    def test_products_api(self):
        """Test product-related endpoints"""
        print("\n" + "="*60)
        print("🛍️ PRODUCTS API TESTS")
        print("="*60)
        
        # Get all products
        success, data = self.run_test("Get All Products", "GET", "/products", 200)
        if success and data.get('products'):
            products = data['products']
            print(f"   📦 Found {len(products)} products")
            # Find a regular product (not coming soon) for cart testing
            regular_products = [p for p in products if not p.get('is_coming_soon', False)]
            if regular_products:
                self.test_product_id = regular_products[0]['id']
                print(f"   🎯 Using regular product ID: {self.test_product_id}")
            elif products:
                self.test_product_id = products[0]['id']
                print(f"   🎯 Using product ID: {self.test_product_id}")
        
        # Get featured products
        self.run_test("Get Featured Products", "GET", "/products?featured=true", 200)
        
        # Get coming soon products
        self.run_test("Get Coming Soon Products", "GET", "/products?coming_soon=true", 200)
        
        # Get categories
        self.run_test("Get Categories", "GET", "/categories", 200)
        
        # Get specific product
        if self.test_product_id:
            self.run_test("Get Product Details", "GET", f"/products/{self.test_product_id}", 200)
        
        # Test admin product creation
        if self.admin_token:
            new_product_success, new_product_data = self.run_test(
                "Create Product (Admin)",
                "POST",
                "/products",
                200,
                {
                    "name": "Test Product",
                    "description": "Test product description",
                    "price": 999,
                    "category": "Test",
                    "image": "https://example.com/test.jpg",
                    "stock": 50
                },
                auth_token=self.admin_token
            )
            
            if new_product_success and new_product_data.get('product'):
                test_product_id = new_product_data['product']['id']
                print(f"   ✨ Created test product: {test_product_id}")
                
                # Test product update
                self.run_test(
                    "Update Product (Admin)",
                    "PUT",
                    f"/products/{test_product_id}",
                    200,
                    {"price": 1299},
                    auth_token=self.admin_token
                )
                
                # Test product deletion
                self.run_test(
                    "Delete Product (Admin)",
                    "DELETE",
                    f"/products/{test_product_id}",
                    200,
                    auth_token=self.admin_token
                )
        
        return success

    def test_cart_operations(self):
        """Test cart functionality"""
        print("\n" + "="*60)
        print("🛒 CART OPERATIONS TESTS")
        print("="*60)
        
        if not self.test_product_id:
            print("   ⚠️ No test product available, skipping cart tests")
            return False
        
        # Test guest cart - get empty cart
        self.run_test("Get Empty Cart (Guest)", "GET", "/cart", 200)
        
        # Add item to cart (guest)
        add_success, _ = self.run_test(
            "Add to Cart (Guest)",
            "POST",
            "/cart/add",
            200,
            {"product_id": self.test_product_id, "quantity": 2}
        )
        
        # Get cart with items
        if add_success:
            cart_success, cart_data = self.run_test("Get Cart with Items", "GET", "/cart", 200)
            if cart_success and cart_data.get('items'):
                print(f"   🛒 Cart has {len(cart_data['items'])} items, total: ₹{cart_data.get('total', 0)}")
        
        # Update cart item quantity
        self.run_test(
            "Update Cart Item",
            "PUT",
            f"/cart/update/{self.test_product_id}",
            200,
            {"quantity": 3}
        )
        
        # Remove item from cart
        self.run_test(
            "Remove from Cart",
            "DELETE",
            f"/cart/remove/{self.test_product_id}",
            200
        )
        
        # Test authenticated cart
        if self.user_token:
            self.run_test(
                "Add to Cart (Authenticated)",
                "POST",
                "/cart/add",
                200,
                {"product_id": self.test_product_id, "quantity": 1},
                auth_token=self.user_token
            )
        
        return add_success

    def test_orders_flow(self):
        """Test order creation and management"""
        print("\n" + "="*60)
        print("📋 ORDERS FLOW TESTS")
        print("="*60)
        
        if not self.user_token or not self.test_product_id:
            print("   ⚠️ Missing user token or product, skipping order tests")
            return False
        
        # Add address first
        address_success, address_data = self.run_test(
            "Add User Address",
            "POST",
            "/auth/addresses",
            200,
            {
                "name": "Test User",
                "phone": "9876543210",
                "street": "123 Test Street",
                "city": "Test City",
                "state": "Test State",
                "pincode": "123456",
                "is_default": True
            },
            auth_token=self.user_token
        )
        
        if not address_success:
            print("   ❌ Failed to add address, cannot test orders")
            return False
        
        # Get user profile to get address ID
        profile_success, profile_data = self.run_test("Get User Profile", "GET", "/auth/me", 200, auth_token=self.user_token)
        
        if not profile_success or not profile_data.get('user', {}).get('addresses'):
            print("   ❌ No addresses found, cannot create order")
            return False
        
        address_id = profile_data['user']['addresses'][0]['id']
        print(f"   📍 Using address ID: {address_id}")
        
        # Add item to cart for order
        self.run_test(
            "Add Item for Order",
            "POST",
            "/cart/add",
            200,
            {"product_id": self.test_product_id, "quantity": 1},
            auth_token=self.user_token
        )
        
        # Create order
        order_success, order_data = self.run_test(
            "Create Order",
            "POST",
            "/orders",
            200,
            {
                "address_id": address_id,
                "payment_method": "cod"
            },
            auth_token=self.user_token
        )
        
        if order_success and order_data.get('order'):
            self.test_order_id = order_data['order']['id']
            tracking_id = order_data['order']['tracking_id']
            print(f"   📦 Order created: {self.test_order_id}")
            print(f"   🔍 Tracking ID: {tracking_id}")
            
            # Get user orders
            self.run_test("Get User Orders", "GET", "/orders", 200, auth_token=self.user_token)
            
            # Get specific order
            self.run_test("Get Order Details", "GET", f"/orders/{self.test_order_id}", 200, auth_token=self.user_token)
            
            # Track order (public endpoint)
            self.run_test("Track Order", "GET", f"/orders/track/{tracking_id}", 200)
            
            # Test admin order management
            if self.admin_token:
                self.run_test("Get All Orders (Admin)", "GET", "/admin/orders", 200, auth_token=self.admin_token)
                
                # Update order status
                self.run_test(
                    "Update Order Status (Admin)",
                    "PUT",
                    f"/admin/orders/{self.test_order_id}/status",
                    200,
                    {"status": "confirmed"},
                    auth_token=self.admin_token
                )
        
        return order_success

    def test_reviews_system(self):
        """Test product reviews"""
        print("\n" + "="*60)
        print("⭐ REVIEWS SYSTEM TESTS")
        print("="*60)
        
        if not self.user_token or not self.test_product_id:
            print("   ⚠️ Missing user token or product, skipping review tests")
            return False
        
        # Create review
        review_success, review_data = self.run_test(
            "Create Product Review",
            "POST",
            "/reviews",
            200,
            {
                "product_id": self.test_product_id,
                "rating": 5,
                "comment": "Excellent product! Great quality and fast delivery."
            },
            auth_token=self.user_token
        )
        
        # Get product reviews
        self.run_test("Get Product Reviews", "GET", f"/reviews/{self.test_product_id}", 200)
        
        return review_success

    def test_prebooking_system(self):
        """Test pre-booking functionality"""
        print("\n" + "="*60)
        print("📅 PRE-BOOKING TESTS")
        print("="*60)
        
        # Get coming soon products first
        products_success, products_data = self.run_test("Get Coming Soon Products", "GET", "/products?coming_soon=true", 200)
        
        if not products_success or not products_data.get('products'):
            print("   ⚠️ No coming soon products found")
            return False
        
        coming_soon_product = products_data['products'][0]
        product_id = coming_soon_product['id']
        print(f"   🔮 Testing with: {coming_soon_product['name']}")
        
        # Create pre-booking
        prebooking_success, _ = self.run_test(
            "Create Pre-booking",
            "POST",
            "/prebooking",
            200,
            {
                "product_id": product_id,
                "email": f"prebook_{uuid.uuid4().hex[:8]}@test.com",
                "name": "Test Prebooker",
                "phone": "9876543210"
            }
        )
        
        # Test admin access to pre-bookings
        if self.admin_token:
            self.run_test("Get Pre-bookings (Admin)", "GET", "/prebooking", 200, auth_token=self.admin_token)
        
        return prebooking_success

    def test_oem_inquiries(self):
        """Test OEM inquiry system"""
        print("\n" + "="*60)
        print("🏢 OEM INQUIRIES TESTS")
        print("="*60)
        
        # Submit OEM inquiry
        oem_success, _ = self.run_test(
            "Submit OEM Inquiry",
            "POST",
            "/oem/inquiry",
            200,
            {
                "company_name": "Test Corp",
                "contact_name": "John Doe",
                "email": f"oem_{uuid.uuid4().hex[:8]}@testcorp.com",
                "phone": "9876543210",
                "product_interest": "Chargers",
                "quantity": 500,
                "message": "Interested in bulk order for corporate gifting"
            }
        )
        
        # Test admin access to inquiries
        if self.admin_token:
            self.run_test("Get OEM Inquiries (Admin)", "GET", "/oem/inquiries", 200, auth_token=self.admin_token)
        
        return oem_success

    def test_newsletter_subscription(self):
        """Test newsletter subscription"""
        print("\n" + "="*60)
        print("📧 NEWSLETTER TESTS")
        print("="*60)
        
        # Subscribe to newsletter
        newsletter_success, _ = self.run_test(
            "Newsletter Subscription",
            "POST",
            "/newsletter/subscribe",
            200,
            {"email": f"newsletter_{uuid.uuid4().hex[:8]}@test.com"}
        )
        
        return newsletter_success

    def test_admin_dashboard(self):
        """Test admin dashboard and management"""
        print("\n" + "="*60)
        print("👑 ADMIN DASHBOARD TESTS")
        print("="*60)
        
        if not self.admin_token:
            print("   ⚠️ No admin token, skipping admin tests")
            return False
        
        # Get dashboard stats
        dashboard_success, dashboard_data = self.run_test("Admin Dashboard", "GET", "/admin/dashboard", 200, auth_token=self.admin_token)
        
        if dashboard_success and dashboard_data.get('stats'):
            stats = dashboard_data['stats']
            print(f"   📊 Users: {stats.get('total_users', 0)}")
            print(f"   📦 Products: {stats.get('total_products', 0)}")
            print(f"   📋 Orders: {stats.get('total_orders', 0)}")
            print(f"   💰 Revenue: ₹{stats.get('total_revenue', 0)}")
        
        # Get admin views
        self.run_test("Admin Users", "GET", "/admin/users", 200, auth_token=self.admin_token)
        self.run_test("Admin Products", "GET", "/admin/products", 200, auth_token=self.admin_token)
        
        return dashboard_success

    def run_all_tests(self):
        """Run complete test suite"""
        print("🧪 VISTHAR ECOMMERCE API TEST SUITE")
        print("=" * 60)
        
        test_results = {
            'health': self.test_health_check(),
            'auth': self.test_auth_flow(),
            'products': self.test_products_api(),
            'cart': self.test_cart_operations(),
            'orders': self.test_orders_flow(),
            'reviews': self.test_reviews_system(),
            'prebooking': self.test_prebooking_system(),
            'oem': self.test_oem_inquiries(),
            'newsletter': self.test_newsletter_subscription(),
            'admin': self.test_admin_dashboard()
        }
        
        # Print summary
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        print(f"✅ Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Tests Failed: {len(self.failed_tests)}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"   • {test['name']} ({test.get('method', 'N/A')} {test.get('endpoint', 'N/A')})")
                if 'error' in test:
                    print(f"     Error: {test['error']}")
                else:
                    print(f"     Expected: {test.get('expected')}, Got: {test.get('actual')}")
        
        print("\n🎯 FEATURE COVERAGE:")
        for feature, passed in test_results.items():
            status = "✅" if passed else "❌"
            print(f"   {status} {feature.title()}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = VistharAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n\n⚠️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\n💥 Test suite crashed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())