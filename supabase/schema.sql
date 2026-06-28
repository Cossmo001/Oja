-- Oja Supabase Relational Database Schema
-- Run this in your Supabase SQL Editor

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR(128) PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  avatar_url TEXT NULL,
  points INTEGER DEFAULT 0,
  balance DECIMAL(12, 2) DEFAULT 0.00,
  address TEXT NULL,
  delivery_notes TEXT NULL,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  joined_date TIMESTAMP DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id VARCHAR(128) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(30) NOT NULL,
  image_url TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('fruits', 'vegetables', 'meat', 'seafood', 'dairy', 'organic')),
  rating DECIMAL(2, 1) DEFAULT 5.0,
  num_reviews INTEGER DEFAULT 0,
  is_oja_certified BOOLEAN DEFAULT TRUE,
  is_handled_by_oja BOOLEAN DEFAULT TRUE,
  is_farm_direct BOOLEAN DEFAULT TRUE,
  harvested_time_ago VARCHAR(50) NOT NULL,
  farm_source VARCHAR(100) NOT NULL,
  farm_location VARCHAR(100) NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  stock_left INTEGER DEFAULT 0
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) REFERENCES public.users(id) ON DELETE CASCADE,
  date TIMESTAMP DEFAULT NOW(),
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(8, 2) NOT NULL,
  service_fee DECIMAL(8, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Processing', 'In Transit', 'Delivered', 'Cancelled')),
  est_delivery_time VARCHAR(50) NULL,
  courier_name VARCHAR(100) NULL,
  courier_phone VARCHAR(20) NULL,
  courier_avatar TEXT NULL
);

-- ORDER ITEMS (Junction Table)
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(128) REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id VARCHAR(128) REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  purchased_price DECIMAL(10, 2) NOT NULL
);

-- COLD CHAIN TELEMETRY TABLE
CREATE TABLE IF NOT EXISTS public.cold_chain_telemetry (
  id SERIAL PRIMARY KEY,
  vehicle_unit VARCHAR(30) NOT NULL,
  temperature_c DECIMAL(4, 2) NOT NULL,
  lat DECIMAL(9, 6) NOT NULL,
  lng DECIMAL(9, 6) NOT NULL,
  logged_at TIMESTAMP DEFAULT NOW()
);

-- Compound Indexes for sub-millisecond queries
CREATE INDEX IF NOT EXISTS idx_orders_user_date ON public.orders (user_id ASC, date DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_price ON public.products (category ASC, price ASC);

-- Full-text search index on products (name, description, farm_source)
CREATE INDEX IF NOT EXISTS idx_products_fts ON public.products USING gin (
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(farm_source, ''))
);

-- Automatically sync Supabase auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    first_name, 
    last_name, 
    email, 
    phone, 
    avatar_url, 
    points, 
    balance
  )
  VALUES (
    NEW.id::varchar(128),
    coalesce(NEW.raw_user_meta_data->>'first_name', 'New'),
    coalesce(NEW.raw_user_meta_data->>'last_name', 'Customer'),
    NEW.email,
    coalesce(NEW.phone, '+2348000000000'),
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    0,
    0.00
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
