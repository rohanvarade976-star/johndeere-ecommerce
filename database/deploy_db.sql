-- John Deere E-Commerce Parts System - Consolidated Deployment Script
CREATE DATABASE IF NOT EXISTS johndeere_ecommerce;
USE johndeere_ecommerce;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255),
  google_id VARCHAR(100),
  avatar_url VARCHAR(500),
  role ENUM('customer','dealer','admin') DEFAULT 'customer',
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  otp VARCHAR(6),
  otp_expires TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Equipment Models
CREATE TABLE IF NOT EXISTS equipment_models (
  id INT AUTO_INCREMENT PRIMARY KEY,
  model_code VARCHAR(50) NOT NULL UNIQUE,
  model_name VARCHAR(150) NOT NULL,
  category ENUM('Tractor','Harvester','Combine','Sprayer','Planter') NOT NULL,
  series VARCHAR(100),
  manufacturer VARCHAR(100) DEFAULT 'John Deere',
  region ENUM('NORTH_AMERICA','EUROPE','ASIA_PACIFIC') DEFAULT 'ASIA_PACIFIC',
  description TEXT,
  features TEXT,
  image_url VARCHAR(500),
  horsepower INT,
  engine_type VARCHAR(100),
  year_from INT,
  is_active BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diagrams
CREATE TABLE IF NOT EXISTS diagrams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  diagram_name VARCHAR(150) NOT NULL,
  diagram_type ENUM('Engine','Hydraulic','Electrical','Structural','Transmission') NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  is_interactive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment_models(id) ON DELETE CASCADE
);

-- Parts
CREATE TABLE IF NOT EXISTS parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_number VARCHAR(50) NOT NULL UNIQUE,
  part_name VARCHAR(150) NOT NULL,
  description TEXT,
  category ENUM('ENGINE','HYDRAULIC','ELECTRICAL','STRUCTURAL','TRANSMISSION') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2),
  discount_pct DECIMAL(5,2) DEFAULT 0,
  stock INT DEFAULT 0,
  image_url VARCHAR(500),
  weight_kg DECIMAL(6,2),
  compatible_models JSON,
  warranty_months INT DEFAULT 12,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sold_count INT DEFAULT 0,
  compatible_series VARCHAR(200),
  replacement_interval_hrs INT,
  interval_type ENUM('hours','years','as_required') DEFAULT 'hours',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Diagram Hotspots
CREATE TABLE IF NOT EXISTS diagram_hotspots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  diagram_id INT NOT NULL,
  part_id INT NOT NULL,
  x_percent DECIMAL(6,3) NOT NULL,
  y_percent DECIMAL(6,3) NOT NULL,
  width_pct DECIMAL(6,3) DEFAULT 4.0,
  height_pct DECIMAL(6,3) DEFAULT 4.0,
  label VARCHAR(100),
  FOREIGN KEY (diagram_id) REFERENCES diagrams(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_id INT NOT NULL UNIQUE,
  available_stock INT DEFAULT 0,
  reserved_stock INT DEFAULT 0,
  low_stock_alert INT DEFAULT 5,
  last_restocked TIMESTAMP NULL,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  part_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, part_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  part_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(150),
  body TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (user_id, part_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (part_id) REFERENCES parts(id)
);

-- Carts & Cart Items
CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  part_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  UNIQUE KEY unique_cart_part (cart_id, part_id),
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(20) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  status ENUM('PENDING','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REFUNDED') DEFAULT 'PENDING',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_name VARCHAR(100),
  shipping_phone VARCHAR(20),
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_pincode VARCHAR(10),
  tracking_number VARCHAR(100),
  estimated_delivery DATE,
  notes TEXT,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  part_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  sub_total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id)
);

-- Seed Essential Users (Password: Password@123)
INSERT IGNORE INTO users (name,email,password,role,phone,is_active,email_verified) VALUES
('System Admin','admin@johndeere-parts.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5.6k9IvY6.aGy','admin','9876543210',TRUE,TRUE),
('Demo Customer','customer@example.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5.6k9IvY6.aGy','customer','9876543211',TRUE,TRUE);

INSERT IGNORE INTO carts (user_id) VALUES (1),(2);
