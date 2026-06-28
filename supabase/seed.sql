-- Oja Database Seed File
-- Run this in your Supabase SQL Editor AFTER running schema.sql

-- Insert Default User
INSERT INTO public.users (
  id, 
  first_name, 
  last_name, 
  email, 
  phone, 
  avatar_url, 
  points, 
  balance, 
  address, 
  delivery_notes, 
  two_factor_enabled
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Oja',
  'Customer',
  'customer@oja-fresh.com',
  '+234801 234 5678',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  4250,
  42000.00,
  '12 Lagos View Estate, Victoria Island, Lagos',
  'Deliver only on weekends between 8 AM and 12 PM.',
  true
) ON CONFLICT (email) DO UPDATE 
SET first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    avatar_url = EXCLUDED.avatar_url,
    points = EXCLUDED.points,
    balance = EXCLUDED.balance,
    address = EXCLUDED.address,
    delivery_notes = EXCLUDED.delivery_notes;

-- Insert Products with exact readable IDs
INSERT INTO public.products (
  id,
  name, 
  description, 
  price, 
  unit, 
  image_url, 
  category, 
  rating, 
  num_reviews, 
  is_oja_certified, 
  is_handled_by_oja, 
  is_farm_direct, 
  harvested_time_ago, 
  farm_source, 
  farm_location, 
  in_stock, 
  stock_left
) VALUES 
  (
    'premium-harvest-basket',
    'Premium Harvest Basket',
    'An artistically curated selection of peak-harvest vegetables, including premium carrots, crisp kale, and local farm specialties.',
    12500.00, 'Directly from Epe Farms',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDjaugWBatg7oUZVeKdJ2fV7ij9Ll2U4iBxwbAXeJCm6x3ebaLs7VtKnyoAxEcyX4GBDK3mYXgK6ZiJmvGBnZqDFbdBwDvw5GKVavTduKPEpYyvkjtDRMxMi24g9e9TCu9qCOhvpBy-PTa_zUczad8zaNn5Pfc7Qkta51yjN3C5WCa8ckkYvemBZ6sKZUkugBo41gf2bo-9a4-uEaD5WQgBEO_QWQt0Mr7MpgOxbPNo3aBnP5SE_5eXTjvOH0hCvmKlLy1RNngXzKM',
    'organic', 4.8, 42, true, true, false, 'Harvested 4h ago', 'Epe Farms', 'Lagos', true, 10
  ),
  (
    'sun-ripened-tropical-medley',
    'Sun-Ripened Tropical Medley',
    'Vibrant local Nigerian fruits including ripe mangoes, papayas, and citrus, glistening and at peak ripeness.',
    8200.00, 'Organic Certified Orchard',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC-cI2JVHpVPpQUHWfBVfBe6Q_pmUCa3w3X0fNQCrqSJVVaFCJ1-n8LObZLVl_mZcZLvk50Yk_awA_XpYNM9rdIt-28eKHwg_Xs8F37witYpWVAL9b5Wlu0HdEEMRRDFzdxePG9sHIYfSEWOxN_PH-QnU0FRfs6gsfv0O_uI96wbM33un1r8ZpHY8zbhJzKU6cHQclAxUgyaC-4WzrNdgo3pz0QSSI-ZfrOLcu-KP8UIWBEQCtnM4huKzC7HB61q7NlwUoJbxUK52E',
    'fruits', 4.9, 29, true, true, true, 'Harvested 5h ago', 'Ogbomosho Orchards', 'Oyo', true, 10
  ),
  (
    'vine-tomatoes-500g',
    'Vine-Ripened Tomatoes',
    'Deep red, firm, and succulent tomatoes grown in mineral-rich soil and harvested with expert care.',
    2400.00, '500g Pack',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDrykPaVktwT8fjBgV3aBGuMSLfbOQPJyh-zKG7DOcqA3RPLov9E4N-b3DLcKqYHUOvH8hwAfxdFnExwvRquMdwT3HL2DPtsv9Mx2PtafyXGZf-G2gC5mthE1mjkKPcSQ0OIWJj5Is6A6H_cCxd0huny9aqgj6-W-ADPnq9X3GaKS7ha2aGVs-nPRkK5rZxfUS-7ogBi_KLi1Ql236-FzIAlt-PDrdgwvlr5sNXSa8wD8ownvty7d7sWha3DBcDN_PI61kn-dhpuo4',
    'vegetables', 4.7, 84, true, true, true, 'Harvested 4h ago', 'Jos Highlands Farms', 'Plateau', true, 50
  ),
  (
    'fresh-ugu-leaves',
    'Fresh Ugu Leaves',
    'Vibrant, crisp fluted pumpkin leaves (Ugu), rich in iron and structurally intact for traditional soups.',
    1200.00, 'Large Bundle',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBxkrAyUsmb_4v0bQ57P4YyFowISqf2NDhlz0sAOuI0N41sqkDOZE__TxIfnM2_JeauxO8pgXahk1aEW9xgHwNhoB0D03G8JXfvFWqIfAhOPXH2RnTJoYq7t9V0Sh2IJQ_Gbnz6KewlBEyvAywMhaxFGeclhoYv0lgJaCnJYrMa5kP-CPRgF8nIMv_KIvAMahIixwYGnTLDiiKfj-LA25QL071zV71Y_hlXVAd3HzUGSQSg-5aeJmrz_Nt9h3aXBei12SK3mxECKF4',
    'vegetables', 4.9, 53, true, false, true, 'Harvested 6h ago', 'Shagamu Greens', 'Ogun', true, 20
  ),
  (
    'mixed-bell-peppers-3pack',
    'Mixed Bell Peppers',
    'Glossy red, yellow, and green bell peppers offering a sweet crunch and premium culinary freshness.',
    3500.00, '3-Pack',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDXlk77LzWSVOJEg9XohiSTaM2Fe915KTS9Juw8vJwc8tgMmK4zTsbfWLqyM1DVWXEz_XHi1LYsbtx7NiikTJwIW9aLKacTBLVkZ583AT5qRLmAnCY5hrnAPLlxSXVeL6pZLd01LqaiXC23678m8GcOhwIJZ76R0BvDBgKvWOZxyfeNA-F70wpqEVExdE0YIQpxAQmnLsbnzl_OSe8ekU4P_5YavTs-hQDp-hCh3WyyOZhi-_1qBaZ_pDn0RgKTlGaO0n1DOU_FSS4',
    'vegetables', 4.6, 122, true, true, true, 'Harvested 2h ago', 'Zaria Agricultural Hub', 'Kaduna', true, 15
  ),
  (
    'organic-ginger-root-250g',
    'Organic Ginger Root',
    'Tangy, sharp, earthy fresh ginger root grown organically to ensure natural purity.',
    950.00, '250g Net',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBe29OBgqPxvrACWsflU-vNa9W5xYxNDr7i2CR-lBPdRp41X-9xI1xeMQxzcRpMDwE9m4KoqbiUZmTPRSUoIjtDsLRuiMTQbaSpg9QfMqeEDDwj5JWevM1pZW7YDbTGrhEzpftgvad-vgeYeIQopVprpaR7kHw3qFvzV2she7xo1Afmf0ahgcoQqlEUGrtaELxc7ty2UWJjyc7Cw5mWurxzhrtHNjKNCfrbGVKrzK52O-PK7CVdO5gx01QaItSK1Kk3MCnQdQ8Y01s',
    'organic', 4.8, 61, true, false, true, 'Harvested 8h ago', 'Kaduna Farms', 'Kaduna', true, 100
  ),
  (
    'premium-puna-yams',
    'Premium Puna Yams',
    'Excellent dry texture, thick skin, highly valued local tubers harvested at perfect maturity.',
    4500.00, 'per tuber',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDNzvsbvTxN6SdDGASV8f17Y3_8F6wkBuCBjGeXgffcEdh-4jAxSR7Yhja7jbQOLgmEycZRANhajbSKZjmDp4Y7_pFHU3gOHkl0islVEHADWHHndArroPYmrzQbDfqxsZFwmwAooq-CCoBjM3dXEIK4KHVg6MW6FGWEFXDAzlEUeAXY9YiqLWQVMZhDVH6JObacEJ9EShqEl_HzpAnTGANuGrRKR0YHqXKjQDFARDe01BOXo7HSRiVT6g5tqUkhvOVkDMoivixkHaU',
    'organic', 4.8, 128, true, true, true, 'Harvested 2d ago', 'Abakaliki Yam Partners', 'Ebonyi', true, 14
  ),
  (
    'pure-wild-honey',
    'Pure Wild Honey',
    'Amber wildflower liquid in premium jars, 100% raw honey.',
    5800.00, '500ml jar',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDn_F9jxniVARpDXIwJa7Ucd9Y8-OTiRT_AtTxft6rLqcXeAQeHql2JtFsjQDfnPkxO989GAq2x93CwVT6nLC3M3J-WZKJWvasNxAaEmHd5xyUWvm0XyKxcCyMBKnlgeI2DU0IjqCrwuVleklaPWzxBM-OU8N42P_rmNTMCKBylI7dIhVvpjNmpcSYeh6WaiKMXM_3fqRNnegnINBRRx_UiftwDFkj_94LJ6fiLjerRSmV299-w1lKfX0bFSNUwcrrknYe1_apfgzs',
    'organic', 4.9, 18, true, true, false, 'Harvested 2d ago', 'Kogi Apiaries', 'Kogi', true, 3
  )
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    unit = EXCLUDED.unit,
    image_url = EXCLUDED.image_url,
    category = EXCLUDED.category,
    rating = EXCLUDED.rating,
    num_reviews = EXCLUDED.num_reviews,
    is_oja_certified = EXCLUDED.is_oja_certified,
    is_handled_by_oja = EXCLUDED.is_handled_by_oja,
    is_farm_direct = EXCLUDED.is_farm_direct,
    harvested_time_ago = EXCLUDED.harvested_time_ago,
    farm_source = EXCLUDED.farm_source,
    farm_location = EXCLUDED.farm_location,
    in_stock = EXCLUDED.in_stock,
    stock_left = EXCLUDED.stock_left;
