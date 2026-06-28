import { pgTable, varchar, integer, decimal, boolean, timestamp, text, serial, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 128 }).primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  avatarUrl: text('avatar_url'),
  points: integer('points').default(0),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0.00'),
  address: text('address'),
  deliveryNotes: text('delivery_notes'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  joinedDate: timestamp('joined_date').defaultNow(),
});

export const products = pgTable('products', {
  id: varchar('id', { length: 128 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 30 }).notNull(),
  imageUrl: text('image_url').notNull(),
  category: varchar('category', { length: 20 }).notNull(),
  rating: decimal('rating', { precision: 2, scale: 1 }).default('5.0'),
  numReviews: integer('num_reviews').default(0),
  isOjaCertified: boolean('is_oja_certified').default(true),
  isHandledByOja: boolean('is_handled_by_oja').default(true),
  isFarmDirect: boolean('is_farm_direct').default(true),
  harvestedTimeAgo: varchar('harvested_time_ago', { length: 50 }).notNull(),
  farmSource: varchar('farm_source', { length: 100 }).notNull(),
  farmLocation: varchar('farm_location', { length: 100 }),
  inStock: boolean('in_stock').default(true),
  stockLeft: integer('stock_left').default(0),
}, (table) => {
  return {
    categoryPriceIdx: index('idx_products_category_price').on(table.category, table.price),
  };
});

export const orders = pgTable('orders', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 128 }).references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp('date').defaultNow(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal('delivery_fee', { precision: 8, scale: 2 }).notNull(),
  serviceFee: decimal('service_fee', { precision: 8, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  estDeliveryTime: varchar('est_delivery_time', { length: 50 }),
  courierName: varchar('courier_name', { length: 100 }),
  courierPhone: varchar('courier_phone', { length: 20 }),
  courierAvatar: text('courier_avatar'),
}, (table) => {
  return {
    userDateIdx: index('idx_orders_user_date').on(table.userId, table.date),
  };
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: varchar('order_id', { length: 128 }).references(() => orders.id, { onDelete: 'cascade' }),
  productId: varchar('product_id', { length: 128 }).references(() => products.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull(),
  purchasedPrice: decimal('purchased_price', { precision: 10, scale: 2 }).notNull(),
});

export const coldChainTelemetry = pgTable('cold_chain_telemetry', {
  id: serial('id').primaryKey(),
  vehicleUnit: varchar('vehicle_unit', { length: 30 }).notNull(),
  temperatureC: decimal('temperature_c', { precision: 4, scale: 2 }).notNull(),
  lat: decimal('lat', { precision: 9, scale: 6 }).notNull(),
  lng: decimal('lng', { precision: 9, scale: 6 }).notNull(),
  loggedAt: timestamp('logged_at').defaultNow(),
});
