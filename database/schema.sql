-- ==========================================================
-- Online Food Ordering System
-- Database Schema (MySQL) - Full Version with all columns
-- ==========================================================

DROP DATABASE IF EXISTS food_ordering;
CREATE DATABASE food_ordering;
USE food_ordering;

-- users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(15) NOT NULL,
  address VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  is_blocked TINYINT(1) NOT NULL DEFAULT 0,
  restaurant_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- categories
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  icon VARCHAR(20) DEFAULT '🍽️',
  bg_color VARCHAR(20) DEFAULT '#fff7ed',
  restaurant_id INT DEFAULT NULL
);

-- restaurants
CREATE TABLE restaurants (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL UNIQUE,
  name            VARCHAR(150) NOT NULL,
  description     TEXT,
  address         VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  cuisine         VARCHAR(200),
  cuisines        VARCHAR(200),
  opening_time    VARCHAR(20) DEFAULT '09:00',
  closing_time    VARCHAR(20) DEFAULT '22:00',
  image           VARCHAR(255),
  image_url       VARCHAR(255),
  kyc_document    VARCHAR(255),
  rating          DECIMAL(3,1) DEFAULT 0.0,
  price_for_two   INT DEFAULT 400,
  delivery_time   VARCHAR(30) DEFAULT '25-30 min',
  offer_text      VARCHAR(200) DEFAULT '',
  pan_number      VARCHAR(50) DEFAULT NULL,
  dftqc_license   VARCHAR(50) DEFAULT NULL,
  vat_number      VARCHAR(50) DEFAULT NULL,
  is_veg_only     TINYINT(1) NOT NULL DEFAULT 0,
  is_approved     TINYINT(1) NOT NULL DEFAULT 0,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- food_items
CREATE TABLE food_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  restaurant_id INT DEFAULT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  price DECIMAL(8,2) NOT NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  image VARCHAR(255) DEFAULT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  is_veg TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- cart
CREATE TABLE cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  food_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE CASCADE
);

-- orders
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  restaurant_id INT DEFAULT NULL,
  rider_id INT DEFAULT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  payment_method VARCHAR(30) NOT NULL DEFAULT 'Cash on Delivery',
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  cancelled_by VARCHAR(20) DEFAULT NULL,
  problem_reported TEXT DEFAULT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- order_items
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  food_id INT NOT NULL,
  food_name VARCHAR(100) NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- reviews
CREATE TABLE reviews (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_id        INT NOT NULL UNIQUE,
  user_id         INT NOT NULL,
  user_name       VARCHAR(100) DEFAULT NULL,
  restaurant_id   INT NOT NULL,
  rating          TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)      REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)       REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- complaints
CREATE TABLE complaints (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  order_id    INT DEFAULT NULL,
  subject     VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'Open',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
