/*
  # Seed Categories and Products

  Migrates all hardcoded data from categoryData.ts and shopData.ts into the database.

  ## Categories Seeded: 8
  Televisions, Laptop & PC, Mobile & Tablets, Games & Videos,
  Home Appliances, Health & Sports, Watches, Cameras

  ## Products Seeded: 8
  Gamepad, iPhone, iMac, MacBook, Watch, Mouse, iPad, Router
  All with correct image paths, prices, and flags.
*/

-- Seed Categories
INSERT INTO categories (id, title, img, sort_order) VALUES
  (1, 'Televisions',       '/images/categories/categories-01.png', 1),
  (2, 'Laptop & PC',       '/images/categories/categories-02.png', 2),
  (3, 'Mobile & Tablets',  '/images/categories/categories-03.png', 3),
  (4, 'Games & Videos',    '/images/categories/categories-04.png', 4),
  (5, 'Home Appliances',   '/images/categories/categories-05.png', 5),
  (6, 'Health & Sports',   '/images/categories/categories-06.png', 6),
  (7, 'Watches',           '/images/categories/categories-07.png', 7),
  (8, 'Cameras',           '/images/categories/categories-01.png', 8)
ON CONFLICT (id) DO NOTHING;

-- Update sequence to avoid PK conflicts after manual inserts
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- Seed Products (matches shopData.ts exactly)
INSERT INTO products (
  id, title, reviews, price, discounted_price,
  category_id,
  thumbnail_images,
  preview_images,
  is_featured, is_new_arrival, is_best_seller
) VALUES
(
  1, 'Havit HV-G61 USB Gamepad For PC & PS3 & Android', 18,
  30.00, 25.00,
  4,
  ARRAY[
    '/images/products/product-1-sm-1.png',
    '/images/products/product-1-sm-2.png'
  ],
  ARRAY[
    '/images/products/product-1-bg-1.png',
    '/images/products/product-1-bg-2.png'
  ],
  true, true, true
),
(
  2, 'Apple iPhone 14 Plus 128GB Blue', 25,
  999.00, 750.00,
  3,
  ARRAY[
    '/images/products/product-2-sm-1.png',
    '/images/products/product-2-sm-2.png'
  ],
  ARRAY[
    '/images/products/product-2-bg-1.png',
    '/images/products/product-2-bg-2.png'
  ],
  true, true, true
),
(
  3, 'Apple iMac 24 Inch M3 Chip 8GB RAM 256GB', 15,
  1500.00, 1200.00,
  2,
  ARRAY[
    '/images/products/product-3-sm-1.png',
    '/images/products/product-3-sm-2.png'
  ],
  ARRAY[
    '/images/products/product-3-bg-1.png',
    '/images/products/product-3-bg-2.png'
  ],
  true, true, false
),
(
  4, 'Apple MacBook Air 13.6 Inch M2 Chip 8GB 256GB', 22,
  1200.00, 1050.00,
  2,
  ARRAY[
    '/images/products/product-4-sm-1.png',
    '/images/products/product-4-sm-2.png'
  ],
  ARRAY[
    '/images/products/product-4-bg-1.png',
    '/images/products/product-4-bg-2.png'
  ],
  true, false, true
),
(
  5, 'Apple Watch Ultra 2 MQD83LL/A GPS + Cellular', 11,
  800.00, 699.00,
  7,
  ARRAY[
    '/images/products/product-5-sm-1.png',
    '/images/products/product-5-sm-2.png'
  ],
  ARRAY[
    '/images/products/product-5-bg-1.png',
    '/images/products/product-5-bg-2.png'
  ],
  false, true, true
),
(
  6, 'Logitech MX Master 3S Wireless Bluetooth Mouse', 30,
  99.00, 79.00,
  2,
  ARRAY[
    '/images/products/product-6-sm-1.png',
    '/images/products/product-6-sm-2.png'
  ],
  ARRAY[
    '/images/products/product-6-bg-1.png',
    '/images/products/product-6-bg-2.png'
  ],
  false, true, true
),
(
  7, 'Apple iPad Pro 12.9 Inch Wi-Fi 256GB Space Gray', 20,
  1100.00, 950.00,
  3,
  ARRAY[
    '/images/products/product-7-sm-1.png',
    '/images/products/product-7-sm-2.png'
  ],
  ARRAY[
    '/images/products/product-7-bg-1.png',
    '/images/products/product-7-bg-2.png'
  ],
  true, false, false
),
(
  8, 'TP-Link AX6000 WiFi 6 Router Dual Band 8-Stream', 8,
  350.00, 299.00,
  5,
  ARRAY[
    '/images/products/product-8-sm-1.png',
    '/images/products/product-8-sm-2.png'
  ],
  ARRAY[
    '/images/products/product-8-bg-1.png'
  ],
  false, true, false
)
ON CONFLICT (id) DO NOTHING;

-- Update sequence to avoid PK conflicts after manual inserts
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
