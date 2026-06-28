import { Product, User, Order } from "./types";
import { supabase } from "./supabase";

export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  // Map database snake_case columns back to camelCase frontend types
  return data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    unit: item.unit,
    image: item.image_url,
    category: item.category,
    rating: Number(item.rating),
    numReviews: item.num_reviews,
    isOjaCertified: item.is_oja_certified,
    isHandledByOja: item.is_handled_by_oja,
    isFarmDirect: item.is_farm_direct,
    harvestedTimeAgo: item.harvested_time_ago,
    farmSource: item.farm_source,
    farmLocation: item.farm_location,
    inStock: item.in_stock,
    stockLeft: item.stock_left
  })) as Product[];
};

export const fetchUser = async (userId: string = "00000000-0000-0000-0000-000000000001"): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return {
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone,
    avatar: data.avatar_url || '',
    points: data.points,
    joinedDate: new Date(data.joined_date).toLocaleDateString(),
    balance: Number(data.balance),
    username: "@" + data.first_name.toLowerCase() + data.last_name.toLowerCase(),
    address: data.address || '',
    deliveryInstructions: data.delivery_notes || '',
    twoFactorEnabled: data.two_factor_enabled
  } as User;
};

export const DEFAULT_ADDRESSES = [
  {
    id: "addr-home",
    label: "Home (Default)",
    address: "Block B2, Flat 4, 1004 Housing Estate, Victoria Island, Lagos.",
    phone: "+234 801 234 5678"
  },
  {
    id: "addr-work",
    label: "Office (Lekki)",
    address: "The Waterfront Towers, 5th Floor, Lekki Phase 1, Lagos.",
    phone: ""
  }
];
