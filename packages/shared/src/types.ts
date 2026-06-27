/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  category: "fruits" | "vegetables" | "meat" | "seafood" | "dairy" | "organic";
  rating: number;
  numReviews: number;
  isOjaCertified: boolean;
  isHandledByOja: boolean;
  isFarmDirect?: boolean;
  harvestedTimeAgo: string;
  farmSource: string;
  farmLocation?: string;
  inStock?: boolean;
  stockLeft?: number;
}

export interface CartItem {
  product: Product;
  quantity: number; // in packs, bundles, kg, etc.
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  points: number;
  joinedDate: string;
  balance: number;
  username?: string;
  address?: string;
  deliveryInstructions?: string;
  twoFactorEnabled?: boolean;
}

export interface TimelineEvent {
  status: string;
  time: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  status: "In Transit" | "Delivered" | "Cancelled" | "Processing";
  estDeliveryTime?: string;
  trackingTimeline?: TimelineEvent[];
  courierName?: string;
  courierPhone?: string;
  courierAvatar?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  orderWizard?: {
    recipeId: string;
    recipeName: string;
    step: "ask_owned" | "summary" | "approved";
    servings?: number;
    ingredients: {
      name: string;
      productId?: string;
      isAvailable: boolean;
      isOwned?: boolean;
    }[];
  };
}
