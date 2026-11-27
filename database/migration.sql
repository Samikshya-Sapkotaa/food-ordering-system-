-- ==========================================================
-- Migration: Add Reviews, Complaints, Block/Unbound support
-- Run ONCE against the existing food_ordering database
-- ==========================================================

USE food_ordering;

-- Add is_blocked column to users (0 = active, 1 = blocked)
ALTER TABLE users
  ADD COLUMN is_blocked TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN restaurant_id INT DEFAULT NULL;

-- Add cancelled_by to orders
ALTER TABLE orders
  ADD COLUMN cancelled_by VARCHAR(20) DEFAULT NULL;

-- restaurant_id column on food_items (links dish to a restaurant)
ALTER TABLE food_items
  ADD COLUMN restaurant_id INT DEFAULT NULL,
  ADD COLUMN image_url VARCHAR(255) DEFAULT NULL,
  ADD COLUMN is_veg TINYINT(1) NOT NULL DEFAULT 1;

-- categories: link to restaurant
ALTER TABLE categories
  ADD COLUMN restaurant_id INT DEFAULT NULL;

-- Add restaurant_id to orders so restaurant can see their orders
ALTER TABLE orders
  ADD COLUMN restaurant_id INT DEFAULT NULL;

-- -------------------------------------------------------
-- restaurants table (managed by admin, linked to a user)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS restaurants (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL UNIQUE,          -- the restaurant user account
  name            VARCHAR(150) NOT NULL,
  description     TEXT,
  address         VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  cuisine         VARCHAR(200),
  opening_time    VARCHAR(20) DEFAULT '09:00',
  closing_time    VARCHAR(20) DEFAULT '22:00',
  image_url       VARCHAR(255),
  rating          DECIMAL(3,1) DEFAULT 0.0,
  is_approved     TINYINT(1) NOT NULL DEFAULT 0, -- 0=pending, 1=approved, 2=rejected
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------
-- reviews table
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_id        INT NOT NULL UNIQUE,
  user_id         INT NOT NULL,
  restaurant_id   INT NOT NULL,
  rating          TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)      REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)       REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- -------------------------------------------------------
-- complaints table
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  order_id    INT DEFAULT NULL,
  subject     VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'Open',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------
-- Seed: insert a demo restaurant account (role = restaurant)
-- password = rest123
-- -------------------------------------------------------
INSERT IGNORE INTO users (name, email, phone, address, password, role)
VALUES (
  'Kathmandu MoMo Hub',
  'restaurant@food.com',
  '9841000001',
  'Thamel, Kathmandu',
  '$2a$10$IeXVlLdKUTT2Zr64gIgMC.ThlQLkL2q6T2YBHvS9M9h6LImxVbtOm', -- password = admin123
  'restaurant'
);

-- Link restaurant user to restaurants table
INSERT IGNORE INTO restaurants (user_id, name, description, address, phone, cuisine, is_approved, is_active)
SELECT id, 'Kathmandu MoMo Hub', 'Best momos in Kathmandu', 'Thamel, Kathmandu', '9841000001', 'Nepali, Momos', 1, 1
FROM users WHERE email = 'restaurant@food.com';
