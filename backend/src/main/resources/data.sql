-- Insert default categories
INSERT INTO categories (name, description, image_url, created_at, updated_at) VALUES
                                                                                  ('Electronics', 'Electronic devices and accessories', '/images/electronics.jpg', NOW(), NOW()),
                                                                                  ('Clothing', 'Fashion and apparel for all ages', '/images/clothing.jpg', NOW(), NOW()),
                                                                                  ('Books', 'Books and literature', '/images/books.jpg', NOW(), NOW()),
                                                                                  ('Home & Garden', 'Home improvement and garden supplies', '/images/home-garden.jpg', NOW(), NOW()),
                                                                                  ('Sports', 'Sports equipment and accessories', '/images/sports.jpg', NOW(), NOW()),
                                                                                  ('Beauty', 'Beauty and personal care products', '/images/beauty.jpg', NOW(), NOW())
    ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, stock_quantity, image_url, category_id, status, created_at, updated_at) VALUES
                                                                                                                            ('iPhone 14 Pro', 'Latest Apple smartphone with advanced camera', 999.99, 50, '/images/iphone14.jpg', 1, 'ACTIVE', NOW(), NOW()),
                                                                                                                            ('Samsung Galaxy S23', 'Android flagship phone with great display', 849.99, 30, '/images/galaxy-s23.jpg', 1, 'ACTIVE', NOW(), NOW()),
                                                                                                                            ('MacBook Pro 16"', 'Powerful laptop for professionals', 2399.99, 20, '/images/macbook-pro.jpg', 1, 'ACTIVE', NOW(), NOW()),
                                                                                                                            ('Nike Air Max', 'Comfortable running shoes', 129.99, 100, '/images/nike-airmax.jpg', 2, 'ACTIVE', NOW(), NOW()),
                                                                                                                            ('Levi''s Jeans', 'Classic denim jeans', 79.99, 75, '/images/levis-jeans.jpg', 2, 'ACTIVE', NOW(), NOW()),
                                                                                                                            ('The Great Gatsby', 'Classic novel by F. Scott Fitzgerald', 12.99, 200, '/images/great-gatsby.jpg', 3, 'ACTIVE', NOW(), NOW()),
                                                                                                                            ('Python Programming', 'Learn Python programming language', 45.99, 60, '/images/python-book.jpg', 3, 'ACTIVE', NOW(), NOW()),
                                                                                                                            ('Coffee Maker', 'Automatic drip coffee machine', 89.99, 40, '/images/coffee-maker.jpg', 4, 'ACTIVE', NOW(), NOW()),
                                                                                                                            ('Garden Tools Set', 'Complete gardening tool kit', 59.99, 25, '/images/garden-tools.jpg', 4, 'ACTIVE', NOW(), NOW()),
                                                                                                                            ('Basketball', 'Official size basketball', 29.99, 80, '/images/basketball.jpg', 5, 'ACTIVE', NOW(), NOW())
    ON CONFLICT (name) DO NOTHING;

-- Insert discount coupons
INSERT INTO discount_coupons (code, name, discount_type, discount_value, max_discount_amount, min_order_amount, usage_limit, used_count, expiry_date, active, for_new_users, combinable, created_at, updated_at) VALUES
                                                                                                                                                                                                                     ('WELCOME10', 'Welcome Discount', 'PERCENTAGE', 10.00, 50.00, 0.00, 1000, 0, '2025-12-31 23:59:59', true, true, false, NOW(), NOW()),
                                                                                                                                                                                                                     ('SUMMER25', 'Summer Sale', 'PERCENTAGE', 25.00, 100.00, 100.00, 500, 0, '2024-08-31 23:59:59', true, false, true, NOW(), NOW()),
                                                                                                                                                                                                                     ('FREESHIP', 'Free Shipping', 'FREE_SHIPPING', 0.00, 0.00, 50.00, 2000, 0, '2025-12-31 23:59:59', true, false, true, NOW(), NOW()),
                                                                                                                                                                                                                     ('SAVE20', 'Save $20', 'FIXED_AMOUNT', 20.00, 20.00, 100.00, 300, 0, '2024-06-30 23:59:59', true, false, false, NOW(), NOW())
    ON CONFLICT (code) DO NOTHING;

-- Note: Admin user will be created automatically by AdminDataInitializer
