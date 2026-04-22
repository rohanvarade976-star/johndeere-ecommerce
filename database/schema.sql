
CREATE DATABASE IF NOT EXISTS johndeere_ecommerce;
USE johndeere_ecommerce;

CREATE TABLE users (
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

CREATE TABLE equipment_models (
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

CREATE TABLE diagrams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  diagram_name VARCHAR(150) NOT NULL,
  diagram_type ENUM('Engine','Hydraulic','Electrical','Structural','Transmission') NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  is_interactive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment_models(id) ON DELETE CASCADE
);

CREATE TABLE parts (
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

CREATE TABLE diagram_hotspots (
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

CREATE TABLE inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  part_id INT NOT NULL UNIQUE,
  available_stock INT DEFAULT 0,
  reserved_stock INT DEFAULT 0,
  low_stock_alert INT DEFAULT 5,
  last_restocked TIMESTAMP NULL,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);

CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  part_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, part_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
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

CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  part_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  UNIQUE KEY unique_cart_part (cart_id, part_id),
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);

CREATE TABLE orders (
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

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  part_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  sub_total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id)
);

CREATE TABLE order_timeline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  message TEXT,
  location VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('UPI','CREDIT_CARD','DEBIT_CARD','NET_BANKING','COD','GOOGLE_PAY','WALLET') NOT NULL,
  payment_status ENUM('PENDING','SUCCESS','FAILED','REFUNDED') DEFAULT 'PENDING',
  transaction_id VARCHAR(100),
  paid_at TIMESTAMP NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE equipment_oil_capacities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_series VARCHAR(50) NOT NULL,
  sequence INT NOT NULL,
  description VARCHAR(300) NOT NULL,
  qty_or_capacity VARCHAR(100) NOT NULL,
  capacity_litres DECIMAL(10,2),
  capacity_gallons DECIMAL(10,2),
  interval_hrs VARCHAR(20) DEFAULT 'AR',
  remarks VARCHAR(300),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════

-- Password: Password@123
INSERT INTO users (name,email,password,role,phone,is_active,email_verified) VALUES
('System Admin','admin@johndeere-parts.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5.6k9IvY6.aGy','admin','9876543210',TRUE,TRUE),
('Demo Customer','customer@example.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5.6k9IvY6.aGy','customer','9876543211',TRUE,TRUE),
('Demo Dealer','dealer@johndeere-parts.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5.6k9IvY6.aGy','dealer','9876543212',TRUE,TRUE);
INSERT INTO carts (user_id) VALUES (1),(2),(3);

-- Equipment Models (6 original + 2 new 8R models)
INSERT INTO equipment_models (model_code,model_name,category,series,region,description,features,image_url,horsepower,engine_type,year_from) VALUES
('JD-5075E','5075E Utility Tractor','Tractor','5E Series','ASIA_PACIFIC','The John Deere 5075E is a 75 HP utility tractor designed for Indian farming. Powered by a 3-cylinder PowerTech engine delivering outstanding performance across a wide range of agricultural applications.','PowerTech 2.9L Engine|8F/4R Collar Shift|540/540E PTO|3 Point Hitch Cat II|Power Steering|Dry Disc Brakes','https://www.deere.com/assets/images/region/northAmerica/products/tractors/5e-series-utility-tractors/5075e/r4d095674_775x436.jpg',75,'PowerTech 2.9L 3-Cyl Diesel',2018),
('JD-5050D','5050D Tractor','Tractor','5D Series','ASIA_PACIFIC','The 5050D is John Deere purpose-built 50 HP tractor for Indian agriculture. Built tough with easy serviceability and proven reliability.','2.9L 3-Cyl Engine|8F/4R Transmission|540 RPM PTO|Power Steering|Dry Air Cleaner|2WD/4WD Available','https://www.deere.com/assets/images/region/northAmerica/products/tractors/5d-series-utility-tractors/5050d/r4d095671_775x436.jpg',50,'3-Cyl Diesel',2016),
('JD-6120B','6120B Row Crop Tractor','Tractor','6B Series','ASIA_PACIFIC','The 6120B brings 120 HP to heavy-duty farming. Features CommandView III cab, premium hydraulics and superior traction control.','120 HP PowerTech Engine|12F/12R PowrReverser|Hydraulic PTO|CommandView III Cab|Load Monitor|AutoTrac Ready','https://www.deere.com/assets/images/region/northAmerica/products/tractors/6b-series-tractors/6120b/pe61688_775x436.jpg',120,'PowerTech 4.5L 4-Cyl',2019),
('JD-W70','W70 Combine Harvester','Harvester','W Series','ASIA_PACIFIC','The W70 high-capacity combine for Indian crops. Features 225HP engine, advanced threshing system and 4500L grain tank.','225 HP Engine|HarvestSmart System|AHC Header Control|4500L Grain Tank|Straw Walker System','https://www.deere.com/assets/images/region/northAmerica/products/combines/w-series-combines/w70/r4g006254_775x436.jpg',225,'6-Cyl Turbocharged',2020),
('JD-S660','S660 Combine','Combine','S Series','NORTH_AMERICA','The S660 features Active Terrain Adjustment and HarvestSmart automatic ground speed control for maximum productivity.','330 HP Engine|Active Terrain Adjustment|HarvestSmart|9.14m Header|11000L Grain Tank','https://www.deere.com/assets/images/region/northAmerica/products/combines/s-series-combines/s660/r4g016819_775x436.jpg',330,'6.8L 6-Cyl',2021),
('JD-R4038','R4038 Sprayer','Sprayer','R Series','EUROPE','The R4038 self-propelled sprayer with ExactApply technology. 4000-liter tank, 36-meter boom for optimal coverage.','275 HP Engine|ExactApply Nozzle Control|36m Boom|4000L Tank|Active Boom Suspension','https://www.deere.com/assets/images/region/northAmerica/products/sprayers/r4-series-sprayers/r4038/r4g030463_775x436.jpg',275,'6.8L 6-Cyl',2022),
('JD-8R230','8R 230 Row-Crop Tractor','Tractor','8R Series','NORTH_AMERICA','The 8R 230 is a 230 HP row-crop tractor for large-scale farming. Features CommandArm operator station, IVT/PowerShift transmission, and Integrated Lighting Technology.','PowerTech PSS 9.0L Engine|IVT or 16/5 PowerShift|CommandView III Cab|AutoTrac Ready|1500 MFWD or ILS|Active Implement Guidance','https://www.deere.com/assets/images/region/northAmerica/products/tractors/8r-series-row-crop-tractors/r4g016819_775x436.jpg',230,'PowerTech PSS 9.0L 6-Cyl',2017),
('JD-8R410','8R 410 Row-Crop Tractor','Tractor','8R Series','NORTH_AMERICA','The 8R 410 is the flagship 410 HP row-crop tractor. Engineered for maximum productivity with CommandArm, premium ILS front axle, and next-gen precision agriculture.','PowerTech PSS 9.0L 410HP|IVT Transmission|CommandView III Cab|Gen 4 CommandCenter|ILS Front Axle|Machine Sync','https://www.deere.com/assets/images/region/northAmerica/products/tractors/8r-series-row-crop-tractors/r4g030463_775x436.jpg',410,'PowerTech PSS 9.0L 6-Cyl',2020);

-- Diagrams
INSERT INTO diagrams (equipment_id,diagram_name,diagram_type,image_path) VALUES
(1,'5075E Engine System','Engine','/uploads/diagrams/demo_engine.jpg'),
(1,'5075E Hydraulic System','Hydraulic','/uploads/diagrams/demo_hydraulic.jpg'),
(2,'5050D Engine System','Engine','/uploads/diagrams/demo_engine.jpg'),
(3,'6120B Engine System','Engine','/uploads/diagrams/demo_engine.jpg'),
(7,'8R Engine System','Engine','/uploads/diagrams/demo_engine.jpg'),
(7,'8R Hydraulic System','Hydraulic','/uploads/diagrams/demo_hydraulic.jpg');

-- ── 5E/5D Series Parts ──────────────────────────────────────
INSERT INTO parts (part_number,part_name,description,category,price,mrp,discount_pct,stock,image_url,weight_kg,warranty_months,is_featured,sold_count,compatible_series,replacement_interval_hrs,interval_type) VALUES
('RE504836','Engine Oil Filter','Genuine John Deere oil filter for 5E and 5D series. Advanced multi-layer filtration removes particles to 15 microns. Recommended replacement every 250 hours.','ENGINE',850.00,1000.00,15.00,45,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',0.35,12,TRUE,234,'5E,5D',250,'hours'),
('RE62418','Primary Air Filter Element','Heavy-duty primary air filter for 5E series in dusty Indian field conditions. Radial seal design ensures zero bypass. Up to 3x longer service life.','ENGINE',1450.00,1800.00,19.00,30,'https://m.media-amazon.com/images/I/71l6f8RKPUL._SX425_.jpg',0.85,12,TRUE,189,'5E,5D',500,'hours'),
('RE522878','Fuel Filter Element','OEM fuel filter with water separation. Removes water and particulates before injection system. Replace every 500 hours.','ENGINE',620.00,750.00,17.00,55,'https://m.media-amazon.com/images/I/51YLnDaLwnL._SX425_.jpg',0.20,12,FALSE,312,'5E,5D',500,'hours'),
('AT366954','Hydraulic Return Filter','Hydraulic return line filter. Captures particles to 10 microns. Replace every 500 hours for optimal performance.','HYDRAULIC',980.00,1200.00,18.00,28,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',0.45,12,FALSE,98,'5E,5D,6B',500,'hours'),
('RE506285','Water Pump Assembly','Complete cooling water pump for 5E series. Maintains optimal engine temperature. Includes pre-fitted gasket and mounting hardware.','ENGINE',4200.00,5000.00,16.00,12,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',2.10,24,TRUE,67,'5E,5D',NULL,'as_required'),
('SE501508','Alternator 12V 65A','12V 65A alternator for 5E and 5D series. Maintains battery charge and powers all electrical systems. Plug-and-play OEM replacement.','ELECTRICAL',5800.00,7000.00,17.00,8,'https://m.media-amazon.com/images/I/61YueTnrAEL._SX425_.jpg',3.20,18,FALSE,45,'5E,5D',NULL,'as_required'),
('L156066','V-Belt Drive Belt','OEM V-belt for alternator, fan and accessories. High-temperature EPDM compound for long field life.','ENGINE',780.00,950.00,18.00,65,'https://m.media-amazon.com/images/I/71gDdE0Q5dL._SX425_.jpg',0.28,6,FALSE,445,'5E,5D',NULL,'as_required'),
('RE507740','Fuel Injector Assembly','Genuine PowerTech fuel injector. Precision calibrated for optimal combustion. Improves power by up to 8% and reduces fuel consumption.','ENGINE',8500.00,10000.00,15.00,6,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',0.42,24,TRUE,23,'5E,5D',NULL,'as_required'),
('MIU811319','Brake Friction Disc Set','Brake friction disc set for 5E and 5D series. Consistent braking performance. Set of 4 discs with hardware.','STRUCTURAL',3200.00,3800.00,16.00,18,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',1.85,12,FALSE,89,'5E,5D',NULL,'as_required'),
('AT340484','Main Hydraulic Pump','Main hydraulic pump for 6B series. High-flow for 3-point hitch, remote cylinders and power steering.','HYDRAULIC',18500.00,22000.00,16.00,4,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',6.50,24,TRUE,12,'6B',NULL,'as_required'),
('RE504114','Thermostat Assembly','Engine thermostat for 5E series. Maintains precise operating temperature. Includes housing and gasket set.','ENGINE',1200.00,1450.00,17.00,35,'https://m.media-amazon.com/images/I/51h3R0ZNIDL._SX425_.jpg',0.32,12,FALSE,167,'5E,5D',NULL,'as_required'),
('TY6358','Engine Oil 10W-30 (5L)','John Deere TORQ-GARD SUPREME engine oil. API CK-4 certified. Superior wear protection in all temperatures.','ENGINE',1850.00,2200.00,16.00,100,'https://m.media-amazon.com/images/I/71QnNFNrqnL._SX425_.jpg',4.50,NULL,TRUE,567,'5E,5D,6B',250,'hours'),
('RE509672','Starter Motor 12V','12V starter motor for 5E and 5D series. High-torque for reliable cold cranking. Direct OEM replacement.','ELECTRICAL',7200.00,8500.00,15.00,9,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',3.80,18,FALSE,34,'5E,5D',NULL,'as_required'),
('AL156626','Secondary Air Filter','Safety inner air filter for 5E series. Replace whenever primary filter is replaced. Never clean and reuse.','ENGINE',850.00,1000.00,15.00,40,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',0.45,12,FALSE,223,'5E,5D',500,'hours'),
('AT452479','Power Steering Cylinder','Power steering cylinder for 5E series. Precise steering with seals, bushings and mounting hardware.','HYDRAULIC',12000.00,14500.00,17.00,5,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',4.20,18,FALSE,18,'5E,5D',NULL,'as_required'),
-- ── 8R Series Parts (from Official Parts Guide TR150428) ─────
('DZ130550','Primary Fuel Filter (8R Series)','Filter element for 8R Series (230-410HP). Replace every 500 hours or as indicated. OEM part ensuring clean fuel delivery to the PowerTech PSS injection system.','ENGINE',1850.00,2200.00,15.91,40,'https://m.media-amazon.com/images/I/51YLnDaLwnL._SX425_.jpg',0.22,12,FALSE,187,'8R',500,'hours'),
('DZ112918','Final Fuel Filter (8R Series)','Final stage fuel filter for 8R Series. Last filtration before injectors. Replace every 500 hours or as indicated.','ENGINE',1650.00,1950.00,15.38,35,'https://m.media-amazon.com/images/I/51YLnDaLwnL._SX425_.jpg',0.18,12,FALSE,143,'8R',500,'hours'),
('RE596317','Primary Air Filter Element (8R Series)','Primary air filter for 8R Series. Replace every 1000 hours or annually. Interval varies with operating conditions.','ENGINE',2850.00,3400.00,16.18,22,'https://m.media-amazon.com/images/I/71l6f8RKPUL._SX425_.jpg',0.92,12,TRUE,156,'8R',1000,'hours'),
('RE596318','Secondary Air Filter Element (8R Series)','Secondary safety inner filter for 8R Series. Replace every 1000 hours or annually with primary filter.','ENGINE',1950.00,2350.00,17.02,18,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',0.52,12,FALSE,89,'8R',1000,'hours'),
('TA32591','Cab Fresh Air Filter (8R Series)','Fresh air intake filter for 8R Series CommandView III cab. Replace every 1000 hours or annually.','STRUCTURAL',1350.00,1600.00,15.63,30,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',0.28,12,FALSE,67,'8R',1000,'hours'),
('RE593819','Cab Recirculation Air Filter (8R)','Cab recirculation filter for 8R Series. Replace every 1000 hours. Works with fresh air filter for operator comfort.','STRUCTURAL',1200.00,1450.00,17.24,25,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',0.22,12,FALSE,54,'8R',1000,'hours'),
('RE596661','Hydraulic Oil Filter Element (8R)','Hydraulic filter for 8R Series. Qty: 2 per service. Replace every 1500 hours for reliable hitch and cylinder operation.','HYDRAULIC',2400.00,2900.00,17.24,44,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',0.55,12,TRUE,234,'8R',1500,'hours'),
('RE549229','Starter Motor Kit 12V (8R Series)','12V starter motor kit for 8R Series. High-torque engine cranking in all weather. Complete kit with mounting hardware.','ELECTRICAL',18500.00,22000.00,15.91,6,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',4.80,18,TRUE,34,'8R',NULL,'as_required'),
('DZ102107','Water Pump Assembly (8R IT4/FT4)','Cooling water pump for 8R Series IT4/FT4. Maintains optimal engine temperature across all loads. Complete assembly with gasket.','ENGINE',16500.00,19800.00,16.67,5,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',3.85,24,TRUE,27,'8R',NULL,'as_required'),
('AL232177','Air Conditioner Compressor (8R)','CommandView III cab AC compressor for 8R Series. Reliable cab cooling for operator comfort. Replace on condition.','ELECTRICAL',28500.00,34000.00,16.18,4,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',7.20,18,TRUE,12,'8R',NULL,'as_required'),
('DZ124395','Alternator 14V 250A (8R Series)','14V 250A internal fan alternator for 8R Series. High-output for CommandView III electronics and lighting. Replace on condition.','ELECTRICAL',22500.00,27000.00,16.67,6,'https://m.media-amazon.com/images/I/61YueTnrAEL._SX425_.jpg',5.40,18,TRUE,19,'8R',NULL,'as_required'),
('RE543262','Fuel Injection Pump (Stage II/III)','Fuel injection pump for 8R Series Stage II/III. Precision calibrated for power, efficiency and emissions compliance.','ENGINE',65000.00,78000.00,16.67,3,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',8.50,24,TRUE,8,'8R',NULL,'as_required'),
('TY25879B','Battery 12V 90Ah 950CCA (8R Series)','John Deere 12V wet charged battery for 8R Series. 90Ah, 950 CCA, BCI Group 31. Reliable starting power.','ELECTRICAL',12500.00,15000.00,16.67,12,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',28.50,12,TRUE,45,'8R',NULL,'as_required'),
('RE577560','SCV Breakaway Quick Coupler (8R)','Selective Control Valve breakaway coupler for 8R Series. Safe hydraulic disconnection of remote implements. Replace on condition.','HYDRAULIC',2850.00,3400.00,16.18,20,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',0.42,12,FALSE,87,'8R',NULL,'as_required'),
('R572234','Wiper Blade 600mm (8R Series)','600mm cab wiper blade for 8R Series. Fits front, rear and RH window. Replace when streaking occurs.','STRUCTURAL',1450.00,1750.00,17.14,35,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',0.28,6,FALSE,134,'8R',NULL,'as_required'),
('AXE14245','Hitch Position Rotation Sensor (8R)','Hitch position sensor for 8R Series. Provides accurate 3-point hitch position to Gen 4 CommandCenter. Replace on condition when hitch errors occur.','ELECTRICAL',8500.00,10200.00,16.67,8,'https://m.media-amazon.com/images/I/61QnNFNrqnL._SX425_.jpg',0.28,18,FALSE,29,'8R',NULL,'as_required');

INSERT INTO inventory (part_id,available_stock,low_stock_alert)
SELECT id,stock, CASE WHEN stock>=30 THEN 10 WHEN stock>=15 THEN 5 ELSE 3 END
FROM parts ON DUPLICATE KEY UPDATE available_stock=VALUES(available_stock);

-- Hotspots for diagram 1 (5075E Engine)
INSERT INTO diagram_hotspots (diagram_id,part_id,x_percent,y_percent,width_pct,height_pct,label) VALUES
(1,1,18.5,42.0,5,5,'Oil Filter'),
(1,2,35.0,22.0,5,5,'Air Filter'),
(1,3,52.0,55.0,5,5,'Fuel Filter'),
(1,5,68.0,38.0,5,5,'Water Pump'),
(1,7,45.0,72.0,5,5,'Drive Belt'),
(1,8,28.0,60.0,5,5,'Injector'),
(1,11,75.0,58.0,5,5,'Thermostat'),
(1,13,82.0,28.0,5,5,'Starter Motor');

-- Hotspots for diagram 5 (8R Engine)
INSERT INTO diagram_hotspots (diagram_id,part_id,x_percent,y_percent,width_pct,height_pct,label) VALUES
(5,17,18.0,35.0,5,5,'Fuel Filter'),
(5,19,35.0,20.0,5,5,'Air Filter'),
(5,20,52.0,50.0,5,5,'Cab Air Filter'),
(5,23,68.0,38.0,5,5,'Water Pump'),
(5,25,45.0,70.0,5,5,'Alternator'),
(5,26,28.0,58.0,5,5,'Injector Pump');

INSERT INTO reviews (user_id,part_id,rating,title,body,is_verified,helpful_count) VALUES
(2,1,5,'Perfect fit for 5075E','Exactly as described. Changed in 20 minutes. Engine running perfectly.',TRUE,12),
(2,2,4,'Excellent quality filter','Original John Deere quality. Worth every rupee for engine protection.',TRUE,8),
(3,7,5,'Genuine belt, long lasting','Third time ordering. Always reliable. Fits perfectly every time.',TRUE,15),
(2,5,5,'Excellent water pump','Fixed my overheating issue completely. Genuine part with good packaging.',TRUE,22),
(3,12,5,'Best engine oil','TORQ-GARD is the real deal. Engine runs smoother after switching.',TRUE,34),
(2,19,4,'Good 8R filter','Perfect fit for my 8R 310. Quality packaging and fast delivery.',TRUE,8),
(3,23,5,'8R water pump - excellent','Sorted my cooling issue on the 8R 250. Arrived with all hardware.',TRUE,11);

-- Oil capacities for 8R Series
INSERT INTO equipment_oil_capacities (equipment_series,sequence,description,qty_or_capacity,capacity_litres,capacity_gallons,interval_hrs,remarks) VALUES
('8R Series',1,'Fuel Tank W/O CTIS or EVT','727 L (192 gal)',727.0,192.0,'AR',NULL),
('8R Series',2,'Fuel Tank W/ CTIS or EVT','651 L (172 gal)',651.0,172.0,'AR',NULL),
('8R Series',3,'DEF Tank','37.2 L (9.8 gal)',37.2,9.8,'AR','AdBlue/Diesel Exhaust Fluid'),
('8R Series',4,'Cooling System FT4/T3','42.3 L (11.2 gal)',42.3,11.2,'AR','Cool-Gard II required'),
('8R Series',5,'Engine Crankcase 1300 MFWD (8R 230/250/280)','25.7 L (6.8 gal)',25.7,6.8,'AR','Plus-50 II oil'),
('8R Series',6,'Engine Crankcase 1500 MFWD','27.6 L (7.3 gal)',27.6,7.3,'AR','Plus-50 II oil'),
('8R Series',7,'Transmission/Diff/Hydraulic 1300 MFWD','180.7 L (47.7 gal)',180.7,47.7,'AR',NULL),
('8R Series',8,'Transmission/Diff/Hydraulic 1500 MFWD','184.6 L (48.8 gal)',184.6,48.8,'AR',NULL),
('8R Series',9,'Front Axle Housing 1300 MFWD','13.6 L (3.6 gal)',13.6,3.6,'AR',NULL),
('8R Series',10,'Final Drive Each MFWD','3.8 L (1 gal)',3.8,1.0,'AR','Fill both sides');
