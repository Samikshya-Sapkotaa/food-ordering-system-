-- ==========================================================
-- Online Food Ordering System — Seed Data
-- 3 restaurants, 6 categories, 48 food items, demo accounts
-- ==========================================================

USE food_ordering;

-- ─────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────
-- Admin: admin123
INSERT INTO users (name, email, phone, address, password, role) VALUES
('System Admin', 'admin@food.com', '9800000001', 'Admin Office, Kathmandu',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Customer 1: user123
INSERT INTO users (name, email, phone, address, password, role) VALUES
('Rahul Sharma', 'rahul@gmail.com', '9841111111', 'Baneshwor, Kathmandu',
 '$2a$10$5.GCe9gO21Vqr1RpjEOMUOt9JhV1NuDM1ugcH6R/p/HCViwRLb9cG', 'customer');

-- Customer 2: cust123
INSERT INTO users (name, email, phone, address, password, role) VALUES
('Priya Thapa', 'priya@gmail.com', '9852222222', 'Lalitpur, Nepal',
 '$2a$10$5.GCe9gO21Vqr1RpjEOMUOt9JhV1NuDM1ugcH6R/p/HCViwRLb9cG', 'customer');

-- Restaurant Owner 1: rest123
INSERT INTO users (name, email, phone, address, password, role) VALUES
('Kathmandu MoMo Hub', 'restaurant@food.com', '9841000001', 'Thamel, Kathmandu',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'restaurant');

-- Restaurant Owner 2: rest123
INSERT INTO users (name, email, phone, address, password, role) VALUES
('Spice Garden Kitchen', 'spice@food.com', '9841000002', 'Patan, Lalitpur',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'restaurant');

-- Restaurant Owner 3: rest123
INSERT INTO users (name, email, phone, address, password, role) VALUES
('Himalayan Bites', 'himalayan@food.com', '9841000003', 'Pokhara, Nepal',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'restaurant');

-- ─────────────────────────────────────────────────────────
-- RESTAURANTS
-- ─────────────────────────────────────────────────────────
INSERT INTO restaurants (user_id, name, description, address, phone, cuisine, cuisines, opening_time, closing_time, rating, price_for_two, delivery_time, offer_text, is_approved, is_active)
SELECT id, 'Kathmandu MoMo Hub', 'Best momos and Nepali street food in Thamel', 'Thamel, Kathmandu', '9841000001',
       'Nepali, Momos, Street Food', 'Nepali, Momos, Street Food', '08:00', '22:00', 4.5, 350, '20-25 min', '20% off on first order', 1, 1
FROM users WHERE email = 'restaurant@food.com';

INSERT INTO restaurants (user_id, name, description, address, phone, cuisine, cuisines, opening_time, closing_time, rating, price_for_two, delivery_time, offer_text, is_approved, is_active)
SELECT id, 'Spice Garden Kitchen', 'Authentic Indian and Asian fusion cuisine', 'Patan, Lalitpur', '9841000002',
       'Indian, Asian, Fusion', 'Indian, Asian, Fusion', '10:00', '23:00', 4.3, 500, '30-40 min', 'Free delivery above Rs. 500', 1, 1
FROM users WHERE email = 'spice@food.com';

INSERT INTO restaurants (user_id, name, description, address, phone, cuisine, cuisines, opening_time, closing_time, rating, price_for_two, delivery_time, offer_text, is_approved, is_active)
SELECT id, 'Himalayan Bites', 'Cozy mountain-style comfort food and snacks', 'Pokhara, Nepal', '9841000003',
       'Continental, Snacks, Nepali', 'Continental, Snacks, Nepali', '09:00', '21:00', 4.1, 400, '25-35 min', 'Combo meals at great prices', 1, 1
FROM users WHERE email = 'himalayan@food.com';

-- Update restaurant_id in users for restaurant owners
UPDATE users u
JOIN restaurants r ON r.user_id = u.id
SET u.restaurant_id = r.id
WHERE u.role = 'restaurant';

-- ─────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────
INSERT INTO categories (name, description, icon, bg_color) VALUES
('Starters',       'Crispy and delicious appetizers',           '🥗', '#fff7ed'),
('Main Course',    'Hearty and filling main dishes',            '🍛', '#fdf4ff'),
('Pizza & Burger', 'Wood-fired pizzas and juicy burgers',       '🍕', '#eff6ff'),
('Beverages',      'Refreshing drinks and beverages',           '🥤', '#f0fdf4'),
('Desserts',       'Sweet treats and mouth-watering desserts',  '🍮', '#fff1f2'),
('Momos & Snacks', 'Traditional Nepali dumplings and snacks',   '🥟', '#fefce8');

-- ─────────────────────────────────────────────────────────
-- FOOD ITEMS  (8 items per category, spread across restaurants)
-- Restaurant IDs: 1=MoMo Hub, 2=Spice Garden, 3=Himalayan Bites
-- ─────────────────────────────────────────────────────────

-- ── Starters (category 1) ─────────────────────────────────
INSERT INTO food_items (category_id, restaurant_id, name, description, price, is_available, is_veg) VALUES
(1, 1, 'Paneer Tikka',        'Grilled paneer cubes marinated with spices',        180, 1, 1),
(1, 1, 'Veg Spring Roll',     'Crispy rolls stuffed with vegetables',              120, 1, 1),
(1, 2, 'Chicken Pakora',      'Juicy chicken coated in crispy batter',             160, 1, 0),
(1, 2, 'Mushroom Fritters',   'Golden fried mushrooms with herb dip',              140, 1, 1),
(1, 3, 'French Fries',        'Salted crispy potato fries',                         90, 1, 1),
(1, 3, 'Cheese Balls',        'Crispy cheese balls with dipping sauce',            130, 1, 1),
(1, 1, 'Aloo Tikki',          'Pan-fried potato patties with chutneys',            100, 1, 1),
(1, 2, 'Crispy Calamari',     'Lightly battered squid rings with aioli',           210, 1, 0);

-- ── Main Course (category 2) ──────────────────────────────
INSERT INTO food_items (category_id, restaurant_id, name, description, price, is_available, is_veg) VALUES
(2, 2, 'Paneer Butter Masala','Paneer in creamy tomato-based gravy',               220, 1, 1),
(2, 2, 'Dal Fry',             'Yellow dal tempered with garlic and spices',        140, 1, 1),
(2, 1, 'Veg Biryani',         'Aromatic rice cooked with mixed vegetables',        190, 1, 1),
(2, 2, 'Chole Bhature',       'Spicy chickpeas with fried puffed bread',           150, 1, 1),
(2, 3, 'Chicken Curry',       'Traditional Nepali chicken curry with rice',        250, 1, 0),
(2, 3, 'Mutton Thali',        'Full meal with mutton curry, rice and bread',       350, 1, 0),
(2, 1, 'Mixed Veg Curry',     'Garden fresh vegetables in spiced gravy',           170, 1, 1),
(2, 2, 'Butter Naan Set',     'Soft buttered naan with dal and pickle',            180, 1, 1);

-- ── Pizza & Burger (category 3) ───────────────────────────
INSERT INTO food_items (category_id, restaurant_id, name, description, price, is_available, is_veg) VALUES
(3, 3, 'Margherita Pizza',    'Classic cheese and tomato pizza',                   199, 1, 1),
(3, 3, 'Farmhouse Pizza',     'Loaded with onion, capsicum and mushroom',          299, 1, 1),
(3, 2, 'Chicken BBQ Pizza',   'Grilled chicken with BBQ sauce',                   349, 1, 0),
(3, 3, 'Veg Burger',          'Crispy aloo patty burger with sauce',                99, 1, 1),
(3, 2, 'Chicken Zinger',      'Spicy crispy chicken burger',                       180, 1, 0),
(3, 3, 'Double Cheese Burger','Double patty with extra cheese',                   220, 1, 1),
(3, 1, 'Mini Pizza Combo',    'Two personal pizzas with drinks',                   280, 1, 1),
(3, 2, 'Pepperoni Pizza',     'Classic pepperoni with mozzarella',                 320, 0, 0);

-- ── Beverages (category 4) ────────────────────────────────
INSERT INTO food_items (category_id, restaurant_id, name, description, price, is_available, is_veg) VALUES
(4, 1, 'Masala Chai',         'Indian style spiced milk tea',                       30, 1, 1),
(4, 3, 'Fresh Lime Soda',     'Sweet and salted lime soda',                         60, 1, 1),
(4, 3, 'Cold Coffee',         'Chilled coffee blended with ice cream',             110, 1, 1),
(4, 2, 'Mango Lassi',         'Thick creamy mango yoghurt drink',                   90, 1, 1),
(4, 1, 'Lemon Mint Cooler',   'Freshly squeezed lemon with mint leaves',            70, 1, 1),
(4, 2, 'Virgin Mojito',       'Classic mojito without alcohol',                     80, 1, 1),
(4, 3, 'Strawberry Smoothie', 'Thick smoothie with fresh strawberries',            120, 1, 1),
(4, 1, 'Hot Chocolate',       'Rich creamy hot chocolate',                         100, 1, 1);

-- ── Desserts (category 5) ─────────────────────────────────
INSERT INTO food_items (category_id, restaurant_id, name, description, price, is_available, is_veg) VALUES
(5, 3, 'Chocolate Brownie',   'Fudgy brownie with chocolate sauce',                130, 1, 1),
(5, 1, 'Gulab Jamun',         'Two pieces of warm gulab jamun in syrup',            70, 1, 1),
(5, 2, 'Rasgulla',            'Spongy cottage cheese balls in sugar syrup',         80, 1, 1),
(5, 3, 'Chocolate Mousse',    'Velvety dark chocolate mousse',                     150, 1, 1),
(5, 2, 'Mango Kulfi',         'Traditional frozen Indian dessert with mango',      100, 1, 1),
(5, 1, 'Rice Kheer',          'Creamy rice pudding garnished with nuts',            90, 1, 1),
(5, 3, 'Cheesecake Slice',    'New York style cheesecake slice',                   160, 1, 1),
(5, 2, 'Jalebi with Rabri',   'Crispy jalebis with thick sweetened milk',          110, 1, 1);

-- ── Momos & Snacks (category 6) ───────────────────────────
INSERT INTO food_items (category_id, restaurant_id, name, description, price, is_available, is_veg) VALUES
(6, 1, 'Veg Steam Momo',      'Steamed vegetable dumplings with tomato chutney',  120, 1, 1),
(6, 1, 'Chicken Steam Momo',  'Juicy chicken dumplings, steamed to perfection',   140, 1, 0),
(6, 1, 'Fried Momo',          'Crispy pan-fried momos with spicy sauce',           130, 1, 1),
(6, 1, 'Jhol Momo',           'Momos in spicy sesame and tomato soup',             150, 1, 0),
(6, 2, 'Samosa (2 pcs)',      'Crispy samosas filled with spiced potatoes',         60, 1, 1),
(6, 3, 'Sel Roti',            'Traditional Nepali ring-shaped rice bread',          80, 1, 1),
(6, 1, 'Buff Momo',           'Buffalo meat dumplings — a Kathmandu classic',     145, 1, 0),
(6, 3, 'Chatpate',            'Spicy puffed rice snack with tangy chutney',        50, 1, 1);

-- ─────────────────────────────────────────────────────────
-- SAMPLE ORDERS (for demo tracking)
-- ─────────────────────────────────────────────────────────

-- Order 1: Delivered (rahul)
INSERT INTO orders (user_id, restaurant_id, total_amount, address, phone, payment_method, status, order_date)
SELECT u.id, r.id, 480.00, 'Baneshwor, Kathmandu', '9841111111', 'Cash on Delivery', 'Delivered', DATE_SUB(NOW(), INTERVAL 2 DAY)
FROM users u, restaurants r WHERE u.email='rahul@gmail.com' AND r.name='Kathmandu MoMo Hub';

INSERT INTO order_items (order_id, food_id, food_name, price, quantity)
SELECT (SELECT MAX(id) FROM orders), f.id, f.name, f.price, 2
FROM food_items f WHERE f.name='Veg Steam Momo' LIMIT 1;

INSERT INTO order_items (order_id, food_id, food_name, price, quantity)
SELECT (SELECT MAX(id) FROM orders), f.id, f.name, f.price, 1
FROM food_items f WHERE f.name='Masala Chai' LIMIT 1;

-- Order 2: Out for Delivery (rahul)
INSERT INTO orders (user_id, restaurant_id, total_amount, address, phone, payment_method, status, order_date)
SELECT u.id, r.id, 350.00, 'Baneshwor, Kathmandu', '9841111111', 'Cash on Delivery', 'Out for Delivery', DATE_SUB(NOW(), INTERVAL 1 HOUR)
FROM users u, restaurants r WHERE u.email='rahul@gmail.com' AND r.name='Spice Garden Kitchen';

INSERT INTO order_items (order_id, food_id, food_name, price, quantity)
SELECT (SELECT MAX(id) FROM orders), f.id, f.name, f.price, 1
FROM food_items f WHERE f.name='Paneer Butter Masala' LIMIT 1;

INSERT INTO order_items (order_id, food_id, food_name, price, quantity)
SELECT (SELECT MAX(id) FROM orders), f.id, f.name, f.price, 1
FROM food_items f WHERE f.name='Mango Lassi' LIMIT 1;

-- Order 3: Pending (priya)
INSERT INTO orders (user_id, restaurant_id, total_amount, address, phone, payment_method, status, order_date)
SELECT u.id, r.id, 279.00, 'Lalitpur, Nepal', '9852222222', 'Cash on Delivery', 'Pending', NOW()
FROM users u, restaurants r WHERE u.email='priya@gmail.com' AND r.name='Himalayan Bites';

INSERT INTO order_items (order_id, food_id, food_name, price, quantity)
SELECT (SELECT MAX(id) FROM orders), f.id, f.name, f.price, 1
FROM food_items f WHERE f.name='Margherita Pizza' LIMIT 1;

INSERT INTO order_items (order_id, food_id, food_name, price, quantity)
SELECT (SELECT MAX(id) FROM orders), f.id, f.name, f.price, 1
FROM food_items f WHERE f.name='Cold Coffee' LIMIT 1;

-- Order 4: Confirmed (rahul)
INSERT INTO orders (user_id, restaurant_id, total_amount, address, phone, payment_method, status, order_date)
SELECT u.id, r.id, 295.00, 'Baneshwor, Kathmandu', '9841111111', 'Cash on Delivery', 'Confirmed', DATE_SUB(NOW(), INTERVAL 30 MINUTE)
FROM users u, restaurants r WHERE u.email='rahul@gmail.com' AND r.name='Himalayan Bites';

INSERT INTO order_items (order_id, food_id, food_name, price, quantity)
SELECT (SELECT MAX(id) FROM orders), f.id, f.name, f.price, 1
FROM food_items f WHERE f.name='Chicken Curry' LIMIT 1;

INSERT INTO order_items (order_id, food_id, food_name, price, quantity)
SELECT (SELECT MAX(id) FROM orders), f.id, f.name, f.price, 1
FROM food_items f WHERE f.name='Fresh Lime Soda' LIMIT 1;

-- ─────────────────────────────────────────────────────────
-- SAMPLE REVIEW (on the delivered order)
-- ─────────────────────────────────────────────────────────
INSERT INTO reviews (order_id, user_id, restaurant_id, rating, comment, created_at)
SELECT
  (SELECT o.id FROM orders o JOIN users u ON o.user_id=u.id WHERE u.email='rahul@gmail.com' AND o.status='Delivered' LIMIT 1),
  (SELECT id FROM users WHERE email='rahul@gmail.com'),
  (SELECT id FROM restaurants WHERE name='Kathmandu MoMo Hub'),
  5,
  'Amazing momos! Very fresh and the tomato chutney was perfect. Will order again!',
  NOW();

-- Update restaurant rating after review
UPDATE restaurants SET rating = 5.0 WHERE name = 'Kathmandu MoMo Hub';
