import React, { useState, useEffect, useRef } from "react";
import { Product, CartItem, Order, ChatMessage, User, DEFAULT_ADDRESSES, Navbar, FreshnessTimeline, TraceabilityCard, PartnerRegistration, supabase } from "@oja/shared";
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
const AVATAR_PRESETS = [
  { name: "Oja Default (Man)", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" },
  { name: "Chioma (Woman)", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400" },
  { name: "Adebayo (Man)", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" },
  { name: "Tunde (Woman)", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400" },
  { name: "Senior Farmer (Man)", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" }
];

// Helper to clean recommended product tags from chat text
const cleanMessageText = (text: string): string => {
  return text.replace(/\[RECOMMENDED_products:\s*[^\]]+\]/gi, "").trim();
};

// Helper to parse recommended products from chat text
const getRecommendedProducts = (text: string, products: Product[]): Product[] => {
  const foundIds = new Set<string>();
  
  // 1. Tag-based matching
  const match = text.match(/\[RECOMMENDED_products:\s*([^\]]+)\]/i);
  if (match) {
    const ids = match[1].split(",").map(id => id.trim());
    ids.forEach(id => {
      if (products.some(p => p.id === id)) {
        foundIds.add(id);
      }
    });
  }

  // 2. Fallback keyword matching
  products.forEach(p => {
    // Escaped product name for safe regex matching
    const escapedName = p.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedName}\\b`, 'i');
    if (regex.test(text)) {
      foundIds.add(p.id);
    }
  });

  return products.filter(p => foundIds.has(p.id));
};

interface IngredientCardProps {
  product: Product;
  onAddToCart: (qty: number) => void;
  cartItems: CartItem[];
}

const IngredientCard: React.FC<IngredientCardProps> = ({ product, onAddToCart, cartItems }) => {
  const [isAdded, setIsAdded] = useState(false);
  const cartItem = cartItems.find(it => it.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    onAddToCart(1);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  return (
    <div className="flex-none w-44 bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm hover:shadow transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
      {product.isOjaCertified && (
        <span className="absolute top-1.5 left-1.5 bg-[#0B3014] text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md flex items-center gap-0.5 z-10 shadow-sm">
          <span className="material-symbols-outlined text-[8px] text-amber-400 font-bold">verified</span>
          Certified
        </span>
      )}
      
      {/* Product Image */}
      <div className="w-full h-24 rounded-lg bg-slate-50 overflow-hidden relative mb-2 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-[10px] font-bold text-slate-800 line-clamp-1 mb-0.5" title={product.name}>
            {product.name}
          </h4>
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">
              {product.farmSource || "Partner Farm"}
            </span>
            <span className="text-slate-300 text-[6px]">•</span>
            <span className="text-[8px] text-emerald-600 font-bold">
              {product.harvestedTimeAgo || "Freshly Picked"}
            </span>
          </div>
        </div>

        <div>
          {/* Price & Unit */}
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[11px] font-black text-[#0B3014]">
              ₦{product.price.toLocaleString()}
            </span>
            <span className="text-[8px] text-slate-400 font-medium">
              /{product.unit}
            </span>
          </div>

          {/* Add to Basket Button */}
          <button
            onClick={handleAdd}
            className={`w-full py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-all duration-200 ${
              isAdded
                ? "bg-emerald-600 text-white shadow-inner scale-95"
                : quantityInCart > 0
                ? "bg-[#0B3014]/5 text-[#0B3014] border border-[#0B3014]/10 hover:bg-[#0B3014] hover:text-white"
                : "bg-[#0B3014] text-white hover:bg-[#FF4D00] shadow-sm hover:shadow"
            }`}
          >
            <span className="material-symbols-outlined text-[11px] font-bold">
              {isAdded ? "check_circle" : "shopping_basket"}
            </span>
            {isAdded ? "Added!" : quantityInCart > 0 ? `In Basket (${quantityInCart})` : "Add to Basket"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const RECIPES_DB: {
  [recipeId: string]: {
    name: string;
    description: string;
    image: string;
    ingredients: { name: string; productId?: string; isAvailable: boolean }[];
  };
} = {
  jollof: {
    name: "Classic Jollof Rice",
    description: "Rich, smoky, and aromatic Jollof Rice base with premium tomatoes and tatashe bell peppers.",
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=600",
    ingredients: [
      { name: "Vine-Ripened Tomatoes", productId: "vine-tomatoes-500g", isAvailable: true },
      { name: "Mixed Bell Peppers", productId: "mixed-bell-peppers-3pack", isAvailable: true },
      { name: "Purple Nigerian Onions", productId: "purple-nigerian-onions", isAvailable: true },
      { name: "Scotch Bonnet Peppers", productId: "scotch-bonnet-peppers", isAvailable: true },
      { name: "Organic Ginger Root", productId: "organic-ginger-root-250g", isAvailable: true },
      { name: "Premium Long Grain Rice", isAvailable: false },
      { name: "Groundnut Oil & seasonings", isAvailable: false },
    ]
  },
  edikang: {
    name: "Edikang Ikong Vegetable Soup",
    description: "Nutritious traditional soup packed with iron-rich fluted pumpkin and spinach leaves.",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=600",
    ingredients: [
      { name: "Fresh Ugu Leaves", productId: "fresh-ugu-leaves", isAvailable: true },
      { name: "Organic African Spinach", productId: "organic-african-spinach", isAvailable: true },
      { name: "Purple Nigerian Onions", productId: "purple-nigerian-onions", isAvailable: true },
      { name: "Scotch Bonnet Peppers", productId: "scotch-bonnet-peppers", isAvailable: true },
      { name: "Smoked Stockfish Pack", isAvailable: false },
      { name: "Native Red Palm Oil", isAvailable: false },
    ]
  },
  asaro: {
    name: "Yam Porridge (Asaro)",
    description: "Traditional sweet-savory yam porridge cooked in a seasoned pepper and oil base.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600",
    ingredients: [
      { name: "Premium Puna Yams", productId: "premium-puna-yams", isAvailable: true },
      { name: "Vine-Ripened Tomatoes", productId: "vine-tomatoes-500g", isAvailable: true },
      { name: "Mixed Bell Peppers", productId: "mixed-bell-peppers-3pack", isAvailable: true },
      { name: "Purple Nigerian Onions", productId: "purple-nigerian-onions", isAvailable: true },
      { name: "Scotch Bonnet Peppers", productId: "scotch-bonnet-peppers", isAvailable: true },
      { name: "Dried Smoked Catfish", isAvailable: false },
    ]
  }
};

interface OrderWizardCardProps {
  messageId: string;
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
  onNextStep: (msgId: string, ownedList: string[], servings: number) => void;
  onApproveOrder: (msgId: string, itemsToBuy: { product: Product; quantity: number }[]) => void;
  cartItems: CartItem[];
  products: Product[];
}

const OrderWizardCard: React.FC<OrderWizardCardProps> = ({
  messageId,
  recipeId,
  recipeName,
  step,
  servings: initialServings = 4,
  ingredients,
  onNextStep,
  onApproveOrder,
  cartItems,
  products,
}) => {
  const [servings, setServings] = useState<number>(initialServings);
  const [selectedOwned, setSelectedOwned] = useState<string[]>(() =>
    ingredients.filter(i => i.isOwned).map(i => i.name)
  );

  // Default serving size base is 4. Calculate scaling multiplier.
  const multiplier = Math.ceil(servings / 4);

  // Local state for tracking quantities of ingredients to buy
  const [itemQuantities, setItemQuantities] = useState<{ [productId: string]: number }>(() => {
    const qtyMap: { [productId: string]: number } = {};
    ingredients.forEach(ing => {
      if (ing.productId) {
        qtyMap[ing.productId] = multiplier;
      }
    });
    return qtyMap;
  });

  // Keep itemQuantities in sync when servings or multiplier changes
  useEffect(() => {
    setItemQuantities(prev => {
      const updated = { ...prev };
      ingredients.forEach(ing => {
        if (ing.productId) {
          updated[ing.productId] = multiplier;
        }
      });
      return updated;
    });
  }, [servings, multiplier]);

  const toggleIngredient = (name: string) => {
    setSelectedOwned(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  if (step === "ask_owned") {
    return (
      <div className="w-full bg-white rounded-2xl border-2 border-[#0B3014] p-4 shadow-md space-y-3 mt-2 animate-fade-in text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0B3014] text-xl font-black">restaurant_menu</span>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Oja Recipe Order Helper</h4>
              <p className="text-[10px] text-slate-400 font-medium">Recipe: <span className="text-[#FF4D00] font-bold">{recipeName}</span></p>
            </div>
          </div>

          {/* Interactive Servings Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
            <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">Servings</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setServings(s => Math.max(1, s - 1))}
                className="w-4 h-4 rounded bg-white border border-slate-200 text-[10px] font-black flex items-center justify-center hover:bg-slate-100 active:scale-90"
              >
                -
              </button>
              <span className="text-[10px] font-black text-[#0B3014] min-w-[12px] text-center">{servings}</span>
              <button
                type="button"
                onClick={() => setServings(s => Math.min(100, s + 1))}
                className="w-4 h-4 rounded bg-white border border-slate-200 text-[10px] font-black flex items-center justify-center hover:bg-slate-100 active:scale-90"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {RECIPES_DB[recipeId]?.image && (
          <div className="relative w-full h-28 rounded-xl overflow-hidden shadow-inner bg-slate-100">
            <img 
              src={RECIPES_DB[recipeId].image} 
              alt={recipeName} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black uppercase text-amber-300 tracking-wider">
              <span className="material-symbols-outlined text-[10px]">photo_camera</span>
              Serving Suggestion
            </div>
          </div>
        )}

        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          Cooking for <span className="font-bold text-[#0B3014]">{servings} {servings === 1 ? "person" : "people"}</span>. 
          Which ingredients do you **already have at home**? Select them to exclude them from your order.
        </p>

        <div className="space-y-1.5 pt-1">
          {ingredients.map((ing) => {
            const isChecked = selectedOwned.includes(ing.name);
            return (
              <div
                key={ing.name}
                onClick={() => toggleIngredient(ing.name)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-[11px] cursor-pointer transition-all duration-150 ${
                  isChecked
                    ? "border-[#0B3014] bg-[#0B3014]/5 text-[#0B3014] font-bold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">
                    {isChecked ? "check_box" : "check_box_outline_blank"}
                  </span>
                  <span>
                    {ing.name} {ing.productId && `(Required: ${multiplier}x)`}
                  </span>
                </div>
                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                  ing.isAvailable 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                    : "bg-red-50 text-red-600 border border-red-100"
                }`}>
                  {ing.isAvailable ? "In Stock" : "Unavailable"}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onNextStep(messageId, selectedOwned, servings)}
          className="w-full py-2.5 bg-[#0B3014] text-white hover:bg-[#FF4D00] text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 active:scale-95"
        >
          <span className="material-symbols-outlined text-xs">calculate</span>
          Calculate Remaining Ingredients
        </button>
      </div>
    );
  }

  const toBuy = ingredients.filter(i => !i.isOwned && i.isAvailable);
  const unavailable = ingredients.filter(i => !i.isOwned && !i.isAvailable);
  const alreadyOwned = ingredients.filter(i => i.isOwned);

  // Map toBuy to real products
  const productsToBuy: Product[] = toBuy
    .map(ing => products.find(p => p.id === ing.productId))
    .filter((p): p is Product => !!p);

  const totalCost = productsToBuy.reduce((sum, p) => {
    const qty = itemQuantities[p.id] || 1;
    return sum + p.price * qty;
  }, 0);

  if (step === "summary") {
    return (
      <div className="w-full bg-white rounded-2xl border-2 border-[#0B3014] p-4 shadow-lg space-y-3 mt-2 animate-fade-in text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0B3014] text-xl font-black">checklist</span>
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Recipe Order Summary</h4>
              <p className="text-[10px] text-slate-400 font-medium">Recipe: <span className="text-[#FF4D00] font-bold">{recipeName}</span></p>
            </div>
          </div>
          <div className="text-[9px] font-extrabold bg-[#0B3014]/5 text-[#0B3014] px-2.5 py-1 rounded-full uppercase tracking-wider">
            {servings} Servings
          </div>
        </div>

        {RECIPES_DB[recipeId]?.image && (
          <div className="relative w-full h-24 rounded-xl overflow-hidden shadow-inner bg-slate-100">
            <img 
              src={RECIPES_DB[recipeId].image} 
              alt={recipeName} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black uppercase text-amber-300 tracking-wider">
              <span className="material-symbols-outlined text-[10px]">photo_camera</span>
              Serving Suggestion
            </div>
          </div>
        )}

        {/* Ingredients to Buy */}
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-[9px] text-[#0B3014] font-extrabold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm font-bold">shopping_basket</span>
            Ingredients to Buy ({productsToBuy.length})
          </div>
          {productsToBuy.length > 0 ? (
            <div className="space-y-2">
              {productsToBuy.map(p => {
                const qty = itemQuantities[p.id] || 1;
                return (
                  <div key={p.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                    <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                      <img src={p.image} className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-700 truncate">{p.name}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">₦{p.price.toLocaleString()} / {p.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Interactive Plus / Minus Selector */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setItemQuantities(prev => ({
                              ...prev,
                              [p.id]: Math.max(1, (prev[p.id] || 1) - 1)
                            }));
                          }}
                          className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 font-black text-xs active:scale-75 transition-transform"
                        >
                          -
                        </button>
                        <span className="px-1 text-[11px] font-black text-[#0B3014] min-w-[14px] text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setItemQuantities(prev => ({
                              ...prev,
                              [p.id]: (prev[p.id] || 1) + 1
                            }));
                          }}
                          className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 font-black text-xs active:scale-75 transition-transform"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-black text-[#0B3014] text-right min-w-[55px]">
                        ₦{(p.price * qty).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 italic pl-1">No ingredients left to buy!</p>
          )}
        </div>

        {/* Unavailable Ingredients */}
        {unavailable.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1 text-[9px] text-red-600 font-extrabold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm font-bold">gpp_maybe</span>
              Currently Unavailable in Oja ({unavailable.length})
            </div>
            <div className="space-y-1">
              {unavailable.map(ing => (
                <div key={ing.name} className="flex justify-between items-center p-2 rounded-xl bg-rose-50/50 border border-rose-100 text-[11px] text-rose-700">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">error_outline</span>
                    <span className="font-semibold">{ing.name}</span>
                  </div>
                  <span className="text-[9px] font-bold bg-rose-100 px-1.5 py-0.5 rounded uppercase tracking-wider text-rose-800">Unavailable</span>
                </div>
              ))}
            </div>
            <p className="text-[8px] text-slate-400 italic pl-1">
              *You can substitute these or source them locally. The rest can be processed immediately!
            </p>
          </div>
        )}

        {/* Already Have */}
        {alreadyOwned.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm font-bold">task_alt</span>
              Already Have (Excluded) ({alreadyOwned.length})
            </div>
            <div className="flex flex-wrap gap-1.5 px-1 py-1">
              {alreadyOwned.map(ing => (
                <span key={ing.name} className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] line-through font-medium">
                  {ing.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action area */}
        <div className="border-t border-slate-100 pt-3 space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Subtotal</span>
            <span className="text-sm font-black text-slate-900">₦{totalCost.toLocaleString()}</span>
          </div>

          <button
            onClick={() => {
              const itemsToBuy = productsToBuy.map(p => ({
                product: p,
                quantity: itemQuantities[p.id] || 1
              }));
              onApproveOrder(messageId, itemsToBuy);
            }}
            className="w-full py-2.5 bg-[#0B3014] text-white hover:bg-[#FF4D00] text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-xs">shopping_cart_checkout</span>
            Approve Ingredients & Pay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-tr from-[#0b3014] to-[#00450d] rounded-2xl p-4 shadow-lg text-white space-y-2.5 mt-2 animate-fade-in border-2 border-emerald-100">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-400 text-2xl">verified</span>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wide">Ingredients Sent to Basket!</h4>
          <p className="text-[9px] text-emerald-100 uppercase tracking-widest font-bold">Recipe: {recipeName}</p>
        </div>
      </div>
      <p className="text-[10px] text-emerald-50 leading-relaxed font-medium">
        All remaining available ingredients have been successfully loaded into your Basket, and you have been routed to checkout to complete your purchase!
      </p>
      <div className="flex gap-2 pt-1">
        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-white/15 px-2.5 py-1 rounded-full text-white">
          <span className="material-symbols-outlined text-xs">payments</span>
          Approval Logged
        </span>
      </div>
    </div>
  );
};

interface MobileAppProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  orders: Order[];
  onUpdateOrders: (orders: Order[]) => void;
  user: User;
  onUpdateUser: (user: User) => void;
  currentScreen: string;
  onScreenChange: (screen: string) => void;
}

export const MobileApp: React.FC<MobileAppProps> = ({
  products,
  onUpdateProducts: setProducts,
  orders,
  onUpdateOrders: setOrders,
  user,
  onUpdateUser: setUser,
  currentScreen,
  onScreenChange: setCurrentScreen,
}) => {
  // Authentication status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    username: user.username ? (user.username.startsWith("@") ? user.username : "@" + user.username) : "",
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: user.phone,
    address: user.address || "",
    deliveryInstructions: user.deliveryInstructions || "",
    twoFactorEnabled: user.twoFactorEnabled ?? false,
    avatar: user.avatar,
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });

  // Notification auto-dismiss
  useEffect(() => {
    if (notificationMessage) {
      const timer = setTimeout(() => {
        setNotificationMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notificationMessage]);

  // Sync edit form with user when opening edit screen
  useEffect(() => {
    if (currentScreen === "edit-profile") {
      setEditForm({
        username: user.username ? (user.username.startsWith("@") ? user.username : "@" + user.username) : "",
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phone,
        address: user.address || "",
        deliveryInstructions: user.deliveryInstructions || "",
        twoFactorEnabled: user.twoFactorEnabled ?? false,
        avatar: user.avatar,
      });
      setIsEditingAddress(false);
      setIsChangingPassword(false);
      setIsDeactivating(false);
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    }
  }, [currentScreen, user]);

  // Keyboard state for padding content
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Hide the ugly iOS "Done" accessory bar to prevent layout constraint errors
      Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(console.warn);

      Keyboard.addListener("keyboardWillShow", (info) => {
        setKeyboardHeight(info.keyboardHeight);
      });
      Keyboard.addListener("keyboardWillHide", () => {
        setKeyboardHeight(0);
      });

      return () => {
        Keyboard.removeAllListeners();
      };
    }
  }, []);

  // Cart & Wishlist states
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: products.find((p) => p.id === "vine-tomatoes-500g") || products[0],
      quantity: 2,
    },
    {
      product: products.find((p) => p.id === "mixed-bell-peppers-3pack") || products[0],
      quantity: 1,
    },
  ]);

  const [wishlist, setWishlist] = useState<Product[]>([
    products.find((p) => p.id === "premium-puna-yams") || products[0],
  ]);

  // Orders and Tracking states are passed as props

  const [activeOrder, setActiveOrder] = useState<Order | null>({
    id: "OJ-59921-LA",
    date: "Today",
    items: [
      {
        product: products.find((p) => p.id === "organic-bell-peppers-detail") || products[0],
        quantity: 1,
      },
      {
        product: products.find((p) => p.id === "fresh-ugu-leaves") || products[0],
        quantity: 2,
      },
    ],
    subtotal: 4850,
    deliveryFee: 1500,
    serviceFee: 250,
    total: 6600,
    status: "In Transit",
    estDeliveryTime: "Today, 02:45 PM",
    trackingTimeline: [
      { status: "Order Confirmed", time: "09:00 AM", description: "Oja validated payment securely.", isCompleted: true, isCurrent: false },
      { status: "Harvesting & Inspection", time: "10:30 AM", description: "Epe Farm picked ingredients; Oja verified quality.", isCompleted: true, isCurrent: false },
      { status: "Dispatched from Hub", time: "11:45 AM", description: "In cold-chain transport truck to Lagos central hub.", isCompleted: true, isCurrent: true },
      { status: "Out for Delivery", time: "02:00 PM", description: "Courier Chinedu Okafor on his last mile route.", isCompleted: false, isCurrent: false },
    ],
    courierName: "Chinedu Okafor",
    courierPhone: "+234 809 112 3456",
    courierAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuACtDNEH19rNddCidt7GAH9CvrSpyvMzGFbfPLz53Mj26UvHguzremSZQLaY1qaf3cGqD-zX_YA_G0bS7Np82TU42r2kEVkoBdTrOJiCAFj4AKkhCcl60gFpTc5skHCHYl8J_tgMD_wRY1I_lwXvxHhgIVDF5ZBtX5xlg11npaGtFO2GLDMoyj-jcnbT-9_nn4hbNjwVzfrxte8JSqcqq09uI9UYsu6bVqeusxiBOMtWRutvpqe5vJXUT6mX6uMNFLaj6qhz2B7sUg",
  });

  // Category filter state
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Checkout states
  const [selectedAddressId, setSelectedAddressId] = useState<string>("addr-home");
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<string>("Standard (Today 2PM - 5PM)");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("wallet");
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoApplied, setPromoApplied] = useState<boolean>(false);

  // Chat/Assistant states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      text: "Hello, Chioma! I am your Oja AI Assistant. 🌟\n\nI can help you:\n• Verify the **freshness credentials** of any vegetable\n• Suggest custom **traditional Nigerian recipes** based on what's in your basket\n• Help you optimize **storage/shelf life** to prevent food waste\n\n*What delicious meal are we preparing today?*",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatLoading]);

  // Auth state inputs
  const [loginEmail, setLoginEmail] = useState<string>("chioma.adebayo@example.com");
  const [loginPassword, setLoginPassword] = useState<string>("password123");
  const [signUpFirstName, setSignUpFirstName] = useState<string>("");
  const [signUpLastName, setSignUpLastName] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      alert("Please enter both email and password.");
      return;
    }
    
    setAuthLoading(true);
    try {
      if (isSignUp) {
        if (!signUpFirstName.trim() || !signUpLastName.trim()) {
          alert("First name and Last name are required for registration.");
          setAuthLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: loginEmail,
          password: loginPassword,
          options: {
            data: {
              first_name: signUpFirstName.trim(),
              last_name: signUpLastName.trim(),
            }
          }
        });
        if (error) throw error;
        alert("Registration completed! If you configured email confirmation, check your inbox to confirm. Otherwise, you can now log in.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      alert(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Quick helper: Apply Promo Code
  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "FRESH20") {
      setPromoDiscount(0.2); // 20% off subtotal
      setPromoApplied(true);
    } else {
      alert("Invalid promo code! Try using 'FRESH20' for 20% off.");
    }
  };

  // Cart helper functions
  const addToCart = (product: Product, qty: number = 1) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += qty;
      setCart(updated);
    } else {
      setCart([...cart, { product, quantity: qty }]);
    }
  };

  const updateCartQty = (productId: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    setCart(updated);
  };

  const toggleWishlist = (product: Product) => {
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter((p) => p.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  // Checkout placing order
  const placeOrder = () => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const finalSubtotal = subtotal * (1 - promoDiscount);
    const deliveryFee = 1500;
    const serviceFee = 250;
    const total = finalSubtotal + deliveryFee + serviceFee;

    if (selectedPaymentMethod === "wallet" && user.balance < total) {
      alert("Insufficient wallet balance! Please choose bank transfer or fund your account.");
      return;
    }

    if (selectedPaymentMethod === "wallet") {
      setUser({ ...user, balance: user.balance - total });
    }

    const newOrder: Order = {
      id: `OJ-${Math.floor(10000 + Math.random() * 90000)}-LA`,
      date: "Today",
      items: [...cart],
      subtotal: finalSubtotal,
      deliveryFee,
      serviceFee,
      total,
      status: "Processing",
      estDeliveryTime: "Today by " + (selectedDeliveryTime.includes("Express") ? "12:30 PM" : "04:30 PM"),
      trackingTimeline: [
        { status: "Order Confirmed", time: "Just now", description: "Oja received order and secured payment.", isCompleted: true, isCurrent: true },
        { status: "Harvesting & Inspection", time: "Pending", description: "Partner farm harvesting fresh produce.", isCompleted: false, isCurrent: false },
        { status: "Dispatched from Hub", time: "Pending", description: "Preparing cold chain logistics transport.", isCompleted: false, isCurrent: false },
        { status: "Out for Delivery", time: "Pending", description: "Lagos delivery courier route assignment.", isCompleted: false, isCurrent: false },
      ],
      courierName: "Chinedu Okafor",
      courierPhone: "+234 809 112 3456",
      courierAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuACtDNEH19rNddCidt7GAH9CvrSpyvMzGFbfPLz53Mj26UvHguzremSZQLaY1qaf3cGqD-zX_YA_G0bS7Np82TU42r2kEVkoBdTrOJiCAFj4AKkhCcl60gFpTc5skHCHYl8J_tgMD_wRY1I_lwXvxHhgIVDF5ZBtX5xlg11npaGtFO2GLDMoyj-jcnbT-9_nn4hbNjwVzfrxte8JSqcqq09uI9UYsu6bVqeusxiBOMtWRutvpqe5vJXUT6mX6uMNFLaj6qhz2B7sUg",
    };

    setOrders([newOrder, ...orders]);
    setActiveOrder(newOrder);
    setCart([]);
    setPromoCode("");
    setPromoDiscount(0);
    setPromoApplied(false);
    setCurrentScreen("tracking");
  };

  // AI Chat Submission
  const handleWizardNext = (msgId: string, ownedList: string[], servings: number) => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === msgId && msg.orderWizard) {
        const updatedIngredients = msg.orderWizard.ingredients.map(ing => ({
          ...ing,
          isOwned: ownedList.includes(ing.name)
        }));
        return {
          ...msg,
          orderWizard: {
            ...msg.orderWizard,
            step: "summary",
            servings,
            ingredients: updatedIngredients
          }
        };
      }
      return msg;
    }));
  };

  const handleWizardApprove = (msgId: string, itemsToBuy: { product: Product; quantity: number }[]) => {
    itemsToBuy.forEach(it => addToCart(it.product, it.quantity));
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === msgId && msg.orderWizard) {
        return {
          ...msg,
          orderWizard: {
            ...msg.orderWizard,
            step: "approved"
          }
        };
      }
      return msg;
    }));
    setTimeout(() => {
      setCurrentScreen("checkout");
    }, 1200);
  };

  const handleChatSubmit = async (textToSend?: string) => {
    const rawPrompt = textToSend || chatInput;
    if (!rawPrompt.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: rawPrompt,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    const promptLower = rawPrompt.toLowerCase();
    
    // Check if user is asking to help order a recipe
    let matchedRecipeKey: string | null = null;
    if (promptLower.includes("jollof")) {
      matchedRecipeKey = "jollof";
    } else if (promptLower.includes("edikang") || promptLower.includes("vegetable soup") || (promptLower.includes("ugu") && promptLower.includes("soup"))) {
      matchedRecipeKey = "edikang";
    } else if (promptLower.includes("asaro") || promptLower.includes("yam") || promptLower.includes("porridge")) {
      matchedRecipeKey = "asaro";
    }

    if (matchedRecipeKey && (promptLower.includes("order") || promptLower.includes("buy") || promptLower.includes("make") || promptLower.includes("cook") || promptLower.includes("prep") || promptLower.includes("ingredient") || promptLower.includes("want"))) {
      // Parse serving size from rawPrompt (e.g. "for 10", "for 10 people", "10 people", etc.)
      let parsedServings = 4; // default base size
      const servingsRegex = /for\s+(\d+)|(\d+)\s*people|(\d+)\s*person/i;
      const servingMatch = promptLower.match(servingsRegex);
      if (servingMatch) {
        const digitStr = servingMatch[1] || servingMatch[2] || servingMatch[3];
        if (digitStr) {
          parsedServings = parseInt(digitStr, 10);
        }
      }

      // Simulate/Trigger local Interactive Recipe Order Wizard!
      setTimeout(() => {
        const recipe = RECIPES_DB[matchedRecipeKey!];
        const assistantMsg: ChatMessage = {
          id: `ai-wizard-${Date.now()}`,
          role: "assistant",
          text: `Great choice! Preparing **${recipe.name}** for **${parsedServings} ${parsedServings === 1 ? 'person' : 'people'}** requires certified, farm-fresh ingredients for that authentic local flavor base. 🥘\n\nTo help you place your order, could you tell me: **which of these ingredients do you already have at home?** Check them below and I will set up the rest of your order!`,
          timestamp: new Date(),
          orderWizard: {
            recipeId: matchedRecipeKey!,
            recipeName: recipe.name,
            step: "ask_owned",
            servings: parsedServings,
            ingredients: recipe.ingredients.map(ing => ({ ...ing, isOwned: false }))
          }
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
        setChatLoading(false);
      }, 800);
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: rawPrompt, username: user.username }),
      });
      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: data.text || "An unexpected error occurred. Please try again.",
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        text: "I had a bit of trouble reaching the fields. Please check your network or try again soon!",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Quick Action Recipe Trigger
  const triggerRecipeInChat = (recipeName: string) => {
    setCurrentScreen("ai-chat");
    const prefilledPrompt = `Can you show me the official Oja recipe for ${recipeName} using organic, traceable Nigerian ingredients?`;
    handleChatSubmit(prefilledPrompt);
  };

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full h-full bg-[#F5F5F0] relative overflow-hidden flex flex-col z-10 font-sans">

        {/* Dynamic Screen Content Wrapper */}
        <div 
          className="flex-1 overflow-y-auto relative custom-scrollbar bg-[#F5F5F0]"
          style={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight : 0 }}
        >
          
          {/* ==================== 1. SPLASH SCREEN ==================== */}
          {currentScreen === "splash" && (
            <div className="min-h-full flex flex-col items-center justify-between bg-[#0B3014] text-white p-8 pt-24 fade-in">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 border-4 border-[#FF4D00] shadow-[4px_4px_0px_0px_#FF4D00]">
                  <span className="material-symbols-outlined text-[#0B3014] text-4xl font-bold">
                    compost
                  </span>
                </div>
                <div className="inline-block bg-[#FF4D00] text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 border border-white">
                  OJA CERTIFIED FRESH
                </div>
                <h1 className="text-4xl font-black tracking-tighter mt-6 uppercase leading-none font-headline">
                  FARM FRESH.<br />OJA ASSURED.
                </h1>
                <p className="text-xs text-[#F5F5F0]/70 max-w-xs mt-4 leading-relaxed font-sans">
                  Rural freshness secured with 100% certified hygiene, transparent fair pricing, and organic blockchain traceability.
                </p>
              </div>

              <div className="w-full space-y-3 pb-8">
                <button
                  onClick={() => setCurrentScreen("welcome")}
                  className="w-full bg-[#FF4D00] hover:bg-white hover:text-black text-white font-black py-4 rounded-xl border-2 border-white shadow-[4px_4px_0px_0px_#FFFFFF] transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  Explore Marketplace
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button
                  onClick={() => setCurrentScreen("partner-portal")}
                  className="w-full bg-transparent hover:bg-white/10 text-white font-black py-3 rounded-xl border-2 border-[#F5F5F0]/40 text-[10px] uppercase tracking-widest"
                >
                  Join as Farm Partner
                </button>
              </div>
            </div>
          )}

          {/* ==================== 2. WELCOME / ONBOARDING SCREEN ==================== */}
          {currentScreen === "welcome" && (
            <div className="min-h-full flex flex-col bg-[#F5F5F0] fade-in">
              {/* Image Section */}
              <div className="relative h-80 bg-slate-200 border-b-4 border-[#0B3014]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnlI6LCmsR5T9hsipNORGEZYF9QAP2YIcCwMU_b4ore0JpjyJ09roN4sK3Xzyxtwb1fj3jUvzSAHsrtH_21GhRfLwmIom9neXf_3aF_0SFY9nR4yFkavw-DxdSojNsj_pDY1VR5mf4SPq_PpFJPFa4zJw8aEEGTJ-MngvFHJOzLTzOVvjiJrmFDPPnS14ZGRpHE50rFRfge7ujjWwe4mMq_C3susXuMDCGMhPCrz3BO5a0bfNfSk7WAi9S12Z2xUi91tdpUc4ihuI"
                  alt="Onboarding Produce"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Certified Badge Overlay */}
                <div className="absolute top-12 right-4 bg-[#FF4D00] text-white font-black text-[9px] uppercase tracking-widest px-3 py-1.5 border-2 border-[#0B3014] flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#0B3014]">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  Oja Certified
                </div>

                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="text-[9px] bg-[#0B3014] text-white font-black uppercase tracking-wider px-2 py-1 border border-[#F5F5F0]">
                    Handled by Oja
                  </span>
                  <span className="text-[9px] bg-[#FF4D00] text-white font-black uppercase tracking-wider px-2 py-1 border border-[#F5F5F0]">
                    Farm Direct
                  </span>
                </div>
              </div>

              {/* Text content */}
              <div className="p-6 flex-1 flex flex-col justify-between -mt-6 bg-[#F5F5F0] rounded-t-3xl relative z-10 border-t-4 border-[#0B3014]">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black text-[#0B3014] uppercase tracking-tighter font-headline">
                    Trust Every Bite
                  </h2>
                  <p className="text-xs text-[#0B3014]/70 leading-relaxed font-sans">
                    Connecting Lagos with fresh agricultural produce direct from certified farms in Jos, Epe, and Kaduna. Logged with immutable batch credentials.
                  </p>

                  {/* Value Props Bento Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-[#E8E8E3] p-3 rounded-xl border-2 border-[#0B3014] shadow-[3px_3px_0px_0px_#0B3014]">
                      <div className="w-8 h-8 rounded-full bg-[#0B3014] flex items-center justify-center text-[#F5F5F0] mb-2">
                        <span className="material-symbols-outlined text-sm">local_shipping</span>
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-tight text-[#0B3014]">Cold Chain</h4>
                      <p className="text-[9.5px] text-[#0B3014]/60 mt-1 leading-snug">Continuous refrigerated logistics to block bruising.</p>
                    </div>
                    <div className="bg-[#E8E8E3] p-3 rounded-xl border-2 border-[#0B3014] shadow-[3px_3px_0px_0px_#0B3014]">
                      <div className="w-8 h-8 rounded-full bg-[#FF4D00] flex items-center justify-center text-white mb-2">
                        <span className="material-symbols-outlined text-sm">barcode_scanner</span>
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-tight text-[#0B3014]">100% Trace</h4>
                      <p className="text-[9.5px] text-[#0B3014]/60 mt-1 leading-snug">Scan QR on package to view farmer, soil & lab results.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <button
                    onClick={() => setCurrentScreen("auth")}
                    className="w-full bg-[#0B3014] hover:bg-[#FF4D00] hover:text-white text-white font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_#FF4D00] border-2 border-[#0B3014] transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    Get Started Securely
                    <span className="material-symbols-outlined">arrow_right_alt</span>
                  </button>
                  <p className="text-[9px] text-[#0B3014]/50 text-center font-bold uppercase tracking-wider">
                    Meets National High-Hygiene Standards.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 3. AUTHENTICATION SCREEN ==================== */}
          {currentScreen === "auth" && (
            <div className="min-h-full p-6 flex flex-col justify-between bg-white fade-in pt-12">
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-[#00450d] text-4xl">
                      gpp_good
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 font-headline">Secure Authentication</h2>
                  <p className="text-xs text-slate-500 mt-1">Authenticate safely to view certified prices.</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setIsSignUp(false)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      !isSignUp ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsSignUp(true)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      isSignUp ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  {isSignUp && (
                    <div className="grid grid-cols-2 gap-3 fade-in">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">First Name</label>
                        <input
                          type="text"
                          value={signUpFirstName}
                          onChange={(e) => setSignUpFirstName(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-emerald-600 transition-colors mt-1"
                          placeholder="Chioma"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Last Name</label>
                        <input
                          type="text"
                          value={signUpLastName}
                          onChange={(e) => setSignUpLastName(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-emerald-600 transition-colors mt-1"
                          placeholder="Adebayo"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Email Address</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-emerald-600 transition-colors mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Password</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-emerald-600 transition-colors mt-1"
                    />
                  </div>

                  {!isSignUp && (
                    <div className="text-right">
                      <a href="#" className="text-[11px] text-[#00450d] font-bold hover:underline">Forgot password?</a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-8 space-y-4">
                <button
                  onClick={handleAuth}
                  disabled={authLoading}
                  className="w-full bg-[#00450d] hover:bg-[#055f18] disabled:bg-slate-400 text-white font-bold py-3 rounded-xl shadow-md text-xs uppercase tracking-wider transition-all"
                >
                  {authLoading ? "Processing secure request..." : (isSignUp ? "Create Secured Account" : "Sign In Securely")}
                </button>

                <div className="border-t border-slate-100 pt-4 flex flex-col items-center space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <span className="material-symbols-outlined text-[12px] text-emerald-600">lock</span>
                    128-bit Encrypted SSL Gateway
                  </div>
                  <div className="text-[9px] text-slate-400 text-center max-w-xs leading-normal">
                    Payments processed securely via local partner gateways. Your bio-metric data remains isolated.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 4. HOME / MARKETPLACE SCREEN ==================== */}
          {currentScreen === "home" && (
            <div className="fade-in flex flex-col h-full">
              {/* Sticky Top Header */}
              <div className="sticky top-0 z-50 bg-[#F5F5F0]/95 backdrop-blur-sm pt-[calc(env(safe-area-inset-top)+12px)] pb-4 px-4 space-y-4 border-b border-[#0B3014]/5 shadow-sm">
              {/* Profile Greeting Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt="User Profile"
                    className="w-10 h-10 rounded-full border border-[#00450d]/20 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 leading-tight">
                      Moni, {user.username ? (user.username.startsWith("@") ? user.username : "@" + user.username) : "User"}! 👋
                    </h3>
                    <p className="text-[10px] text-[#00450d] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-amber-500">
                        military_tech
                      </span>
                      {user.points.toLocaleString()} Oja Points
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentScreen("ai-chat")}
                    className="w-8.5 h-8.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-full flex items-center justify-center border border-amber-200 shadow-sm"
                    title="Ask Oja AI"
                  >
                    <span className="material-symbols-outlined text-[18px]">forum</span>
                  </button>
                  <button
                    onClick={() => setCurrentScreen("cart")}
                    className="w-8.5 h-8.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full flex items-center justify-center border border-slate-200 shadow-sm relative"
                  >
                    <span className="material-symbols-outlined text-[18px]">shopping_basket</span>
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                        {cart.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Dynamic Search Bar */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search fresh pumpkin leaves, peppers, ginger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-emerald-600 transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-8">
              {/* Persistent AI Prompt Assistant Banner */}
              <div className="bg-gradient-to-r from-emerald-950 to-[#00450d] text-white p-3 rounded-2xl flex items-center justify-between border border-emerald-800 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-black">
                    <span className="material-symbols-outlined text-lg">smart_toy</span>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-amber-400">Oja AI Culinary Assistant</h4>
                    <p className="text-[9px] text-slate-200">\"What local recipe should we cook today?\"</p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentScreen("ai-chat")}
                  className="bg-amber-500 hover:bg-amber-600 text-black text-[9px] font-extrabold uppercase px-3 py-1.5 rounded-full shadow-inner tracking-wider"
                >
                  Chat AI
                </button>
              </div>

              {/* Horizontal Category Chips */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 font-headline">Browse Categories</h3>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {["All", "Vegetables", "Fruits", "Organic"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        if (cat === "Vegetables") {
                          setCurrentScreen("vegetables");
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                        activeCategory === cat
                          ? "bg-[#00450d] text-white border-transparent shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Oja Certified Picks Horizontal Scroll */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-800 font-headline">Oja Certified Picks</h3>
                  <button
                    onClick={() => setCurrentScreen("vegetables")}
                    className="text-[#00450d] text-[10px] font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>
                
                <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2">
                  {products.slice(0, 3).map((prod) => (
                    <div
                      key={prod.id}
                      className="w-48 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between shrink-0 transition-all hover:shadow-md"
                    >
                      <div className="relative h-28 bg-slate-50">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onClick={() => {
                            if (prod.id === "organic-bell-peppers-detail") {
                              setCurrentScreen("product-detail");
                            }
                          }}
                        />
                        <button
                          onClick={() => toggleWishlist(prod)}
                          className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white text-slate-700 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]"
                                style={{ fontVariationSettings: wishlist.some(p => p.id === prod.id) ? "'FILL' 1" : "'FILL' 0", color: wishlist.some(p => p.id === prod.id) ? "red" : "inherit" }}
                          >
                            favorite
                          </span>
                        </button>
                        
                        {prod.isOjaCertified && (
                          <span className="absolute bottom-2 left-2 bg-[#ff8f00] text-black text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
                            Certified
                          </span>
                        )}
                      </div>
                      <div className="p-3 space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{prod.name}</h4>
                        <p className="text-[9px] text-slate-400 font-medium">{prod.unit}</p>
                        <div className="flex justify-between items-center pt-1.5">
                          <span className="text-xs font-extrabold text-[#00450d]">
                            ₦{prod.price.toLocaleString()}
                          </span>
                          <button
                            onClick={() => {
                              addToCart(prod);
                              alert(`${prod.name} added to cart!`);
                            }}
                            className="bg-[#00450d] hover:bg-[#055f18] text-white p-1.5 rounded-lg flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fresh Today Grid Section */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-800 font-headline">Fresh Produce Near You</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {filteredProducts.slice(2, 6).map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div className="relative h-28 bg-slate-100">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover cursor-pointer"
                          referrerPolicy="no-referrer"
                          onClick={() => {
                            if (prod.id === "organic-bell-peppers-detail") {
                              setCurrentScreen("product-detail");
                            } else {
                              // Direct modal or fallback
                              addToCart(prod);
                              alert(`${prod.name} added to basket!`);
                            }
                          }}
                        />
                        <span className="absolute top-2 left-2 bg-slate-900/65 text-white text-[7px] font-bold px-1.5 py-0.5 rounded">
                          {prod.harvestedTimeAgo}
                        </span>
                      </div>
                      <div className="p-3 space-y-1">
                        <h4 className="text-[11px] font-bold text-slate-800 truncate">{prod.name}</h4>
                        <p className="text-[9px] text-slate-400">{prod.farmSource}</p>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-xs font-extrabold text-[#00450d]">
                            ₦{prod.price.toLocaleString()}
                          </span>
                          <button
                            onClick={() => {
                              addToCart(prod);
                              alert(`${prod.name} added to basket!`);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-1 rounded-lg"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              </div>
            </div>
          )}

          {/* ==================== 5. VEGETABLES CATEGORY LIST SCREEN ==================== */}
          {currentScreen === "vegetables" && (
            <div className="p-4 space-y-4 fade-in pt-[calc(env(safe-area-inset-top)+12px)]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentScreen("home")}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-800"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </button>
                <h2 className="text-base font-bold text-slate-800 font-headline">Fresh Vegetables</h2>
              </div>

              {/* Guarantee Refund Alert */}
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#00450d] text-lg mt-0.5">
                  health_and_safety
                </span>
                <div>
                  <h4 className="text-[11px] font-bold text-emerald-900">100% Freshness Refund Policy</h4>
                  <p className="text-[9.5px] text-emerald-700 leading-normal mt-0.5">
                    If any vegetable arrives bruised, withered, or fails to meet your standard, request a full refund within 3 hours.
                  </p>
                </div>
              </div>

              {/* Filters Panel */}
              <div className="flex gap-2 text-[10px] font-bold text-slate-600">
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00450d]" />
                  Oja Handled Only
                </span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Farm Direct Direct
                </span>
              </div>

              {/* Veggies Grid */}
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                {products.filter((p) => p.category === "vegetables").map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="relative h-28 bg-slate-50">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover cursor-pointer"
                        referrerPolicy="no-referrer"
                        onClick={() => {
                          if (prod.id === "organic-bell-peppers-detail") {
                            setCurrentScreen("product-detail");
                          } else {
                            addToCart(prod);
                            alert(`${prod.name} added to cart!`);
                          }
                        }}
                      />
                      {prod.isOjaCertified && (
                        <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm">
                          Certified
                        </span>
                      )}
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[7px] font-bold px-1 py-0.5 rounded">
                        {prod.harvestedTimeAgo}
                      </span>
                    </div>

                    <div className="p-3 space-y-1">
                      <h4 className="text-[11.5px] font-bold text-slate-800 truncate">{prod.name}</h4>
                      <p className="text-[9px] text-slate-400 font-medium">{prod.unit}</p>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs font-extrabold text-[#00450d]">
                          ₦{prod.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => {
                            addToCart(prod);
                            alert(`${prod.name} added to basket!`);
                          }}
                          className="bg-[#00450d] hover:bg-[#055f18] text-white p-1.5 rounded-lg flex items-center justify-center transition-transform active:scale-90"
                        >
                          <span className="material-symbols-outlined text-[14px]">shopping_cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== 6. PRODUCT DETAILS SCREEN ==================== */}
          {currentScreen === "product-detail" && (
            <div className="space-y-4 fade-in relative pt-[calc(env(safe-area-inset-top)+12px)]">
              {/* Back Button Floating */}
              <div className="absolute top-[calc(env(safe-area-inset-top)+16px)] left-4 z-20">
                <button
                  onClick={() => setCurrentScreen("vegetables")}
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md border border-slate-100"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </button>
              </div>

              {/* Main Banner Image */}
              <div className="relative h-72 bg-slate-200">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDq6b_H6LGc0IUYcy2FM77SLUnn601EwAQdsB7SJ0GnUWr41r447rW5WAEeCnEYqAC8SM8CsktWfmB0GqX60MHvIQWN_gGyDsrpZL84eh8NKEvWB8txduuGQh3HfRZ5yO2wO5BoJ1FNh-1yWq8TdxUT7fqkC6AckUZ5nXWWPHBsrUvgFza4l0cmI7dS0PW8NOs8YOGRxX5jUvjTBNvCP1Uu7X5ENvWgoR9s-XAJYo_tdyncSSKt0luVxLrOWkoh50fbBGM1U_VU8Ho"
                  alt="Organic Bell Peppers"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="bg-amber-500 text-black text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                    Verified Organic
                  </span>
                  <h2 className="text-xl font-extrabold font-headline mt-1">Organic Bell Peppers</h2>
                  <p className="text-[10px] text-slate-200">Harvested Today at 05:30 AM • Salinas Valley Partner Farm</p>
                </div>
              </div>

              {/* Price and Add Area */}
              <div className="px-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xl font-black text-[#00450d]">₦2,450</span>
                    <span className="text-[10px] text-slate-500 ml-1">/ 500g basket</span>
                  </div>
                  
                  {/* Stock left Indicator */}
                  <span className="text-[9.5px] bg-red-50 text-red-700 font-extrabold px-2 py-1 rounded-full animate-bounce">
                    Only 14 items left!
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Vibrant, crunchy, and packed with vitamins. These organic bell peppers are grown using certified spring water and zero chemical fertilizers. Perfect for stews, salads, or authentic Nigerian Jollof.
                </p>

                {/* Oja Clean Cold Chain Promise */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex gap-3">
                  <span className="material-symbols-outlined text-[#00450d] text-xl">
                    ac_unit
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Continuous Cold Storage</h4>
                    <p className="text-[10px] text-emerald-800 leading-normal mt-0.5">
                      Kept in our 4.5°C transit container to lock in moisture and crispness. 100% turgidity guaranteed!
                    </p>
                  </div>
                </div>

                {/* Interactive Traceability Segment */}
                <TraceabilityCard />

                {/* Freshness Timeline Path */}
                <FreshnessTimeline />

                {/* Chef Recipe Suggestions */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-800 font-headline">Oja Recommended Chef Recipes</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3a55X6EaYtpmaI4XShAd0tGGu9iReSHyBUfo92NxRENmkaB5HYMHHcPAdW8PR4LOiH5tBDEgnmQ_RaWgpNr-Ksxdi17NijOwgBsT06Sw1WUGjxHhBBnv-m6ue3JgTcYvNGMYQXqa3IgrCLa5Ckm9NuvLsNptBM-5ESSFbvQH1yO5kRzaPvmfTCSp-Qe44nwbeoBhehHQZ711ftS7BL8PTixBs5EMot5KJeNlXom5Lv3qfuVeadxrHaklz0-sxluMMkeXtNje__IE"
                        alt="Jollof Rice"
                        className="h-20 w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-2 space-y-1">
                        <h4 className="text-[10px] font-bold text-slate-800">Smoky Jollof Rice</h4>
                        <button
                          onClick={() => triggerRecipeInChat("Smoky Jollof Rice")}
                          className="w-full bg-[#00450d] hover:bg-[#055f18] text-white text-[9px] font-bold py-1 rounded mt-1"
                        >
                          View AI Recipe
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB188xy-rcpbAFIS_UvXV4C212myt0HfYdTQ4JlJQsfBoQMM3W6PViAySuQZGiDWUmQkfO-Z3tZwyqJwIqurYe4_TfC32HU-k-rjp2IoaJmiZJ7fHWH_2pAE20678yIAkYLtpglWyC7yu17Nu2siDiTuwIH9YqidmQ7n3KQub2u3TpzmYxJ55tOL-EPAE98lrf3gUT25Q_x3iVpX8POSaRsJlecrfBB3kd0oUw6_gzrIb3CjDlEY3IgmU63bn5jpGmPXKVciabgeI8"
                        alt="Veg Stir fry"
                        className="h-20 w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-2 space-y-1">
                        <h4 className="text-[10px] font-bold text-slate-800">Garden Vegetable Stir-fry</h4>
                        <button
                          onClick={() => triggerRecipeInChat("Garden Vegetable Stir-fry")}
                          className="w-full bg-[#00450d] hover:bg-[#055f18] text-white text-[9px] font-bold py-1 rounded mt-1"
                        >
                          View AI Recipe
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Frequently Bought Together */}
                <div className="space-y-2.5 pb-8">
                  <h3 className="text-xs font-bold text-slate-800 font-headline">Frequently Bought Together</h3>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDf1tVSHXSNGy1FLjEBN2RpnAMKFG4mb9RzCrNr-fKZNXTmnHGMrKSFpgffQTantbeVewPBntSuFcLdC9ePcO5z6L1AEsTcpO8Bnh4JyHnRmT0h0BvZDDQf8s06tqiiVmuoI-QQxX9qTkjSlL5bx6s5HzYlLRdjw9T6GLMl4p9O3LgnrVGxH5_6h_3lBfI4-7GQ1c9gVss4nQHrUqLdl7Jr0G9OzBfJkts5TSMkPRdrf_GkmlKHNJVZN-THs5askEUScdInfwIQaRI"
                          alt="Habanero"
                          className="w-8 h-8 rounded-lg object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-800 leading-none">Habanero Peppers</h4>
                          <span className="text-[9px] text-[#00450d] font-bold mt-1 inline-block">₦800 /kg</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const prod = products.find(p => p.id === "scotch-bonnet-peppers");
                          if (prod) addToCart(prod);
                          alert("Habanero added to basket!");
                        }}
                        className="bg-emerald-50 text-[#00450d] hover:bg-[#00450d] hover:text-white p-1 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </button>
                    </div>

                    <div className="flex-1 bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK5nbg9l8ZFBh7QbWLTg8N3MMA39jekLFfmoeVkE8PexY8TJZSdBuwvRr7h6RO-PpyZ3wrOsrG3jPYC_2M3PCDeA7-UcuSSmOJT4yD3rqnBjNJespWwI9h32W_4QcQbMYMwyvb8mRkJf2JmSrI6zHLanEg6JO4XLozGSBciPoUOnamkFunUaSpvoNMmbKpi1nuE11c3BsmxoDChYBkV6_sdFx5q2hg_d3ZpII5i9XWs07xVJ4puiefN_wlWDAJ8QjOa6kJUKyJ0J4"
                          alt="Red Onions"
                          className="w-8 h-8 rounded-lg object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-800 leading-none">Red Onions</h4>
                          <span className="text-[9px] text-[#00450d] font-bold mt-1 inline-block">₦650 / 500g</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const prod = products.find(p => p.id === "purple-nigerian-onions");
                          if (prod) addToCart(prod);
                          alert("Red Onions added to basket!");
                        }}
                        className="bg-emerald-50 text-[#00450d] hover:bg-[#00450d] hover:text-white p-1 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Floating Add to Cart Footer */}
              <div className="bg-white border-t border-slate-100 p-4 flex gap-3 shadow-2xl fixed bottom-14 left-0 right-0 max-w-md mx-auto rounded-t-2xl z-30">
                <button
                  onClick={() => {
                    const prod = products.find(p => p.id === "organic-bell-peppers-detail");
                    if (prod) {
                      addToCart(prod, 1);
                      alert("Added 500g basket to Cart!");
                    }
                  }}
                  className="flex-1 bg-[#00450d] hover:bg-[#055f18] text-white font-extrabold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-wider transition-all active:scale-95 shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">shopping_cart</span>
                  Add 500g Basket to Basket
                </button>
              </div>
            </div>
          )}

          {/* ==================== 7. SHOPPING BASKET / CART SCREEN ==================== */}
          {currentScreen === "cart" && (
            <div className="p-4 space-y-4 fade-in pt-[calc(env(safe-area-inset-top)+12px)]">
              <h2 className="text-base font-bold text-slate-800 font-headline">Your Shopping Basket</h2>

              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <span className="material-symbols-outlined text-3xl">shopping_basket</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">Your Basket is Empty</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    You haven't added any certified fresh produce to your shopping basket yet.
                  </p>
                  <button
                    onClick={() => setCurrentScreen("home")}
                    className="bg-[#00450d] text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Browse Produce
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items List */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        
                        <div className="flex-1 space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-800">{item.product.name}</h4>
                          <p className="text-[10px] text-slate-400">{item.product.unit || item.product.farmSource}</p>
                          <p className="text-xs font-extrabold text-[#00450d]">
                            ₦{item.product.price.toLocaleString()}
                          </p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2 py-1 bg-slate-50">
                          <button
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="text-slate-500 hover:text-slate-800"
                          >
                            <span className="material-symbols-outlined text-sm font-bold">remove</span>
                          </button>
                          <span className="text-xs font-bold text-slate-800 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="text-slate-500 hover:text-slate-800"
                          >
                            <span className="material-symbols-outlined text-sm font-bold">add</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Lifecycle Progress Bar */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[11px] font-bold text-slate-700">Order Life Cycle Tracker</h4>
                      <span className="text-[9px] bg-[#00450d]/10 text-[#00450d] font-bold px-2 py-0.5 rounded-full">
                        Secure Dispatch
                      </span>
                    </div>

                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="text-[#00450d]">Harvest</span>
                      <span className="text-[#00450d]">Inspect</span>
                      <span className="text-[#00450d]">Pack</span>
                      <span>Delivery</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
                      <div className="bg-[#00450d] h-full w-3/4 rounded-full" />
                    </div>
                  </div>

                  {/* Calculations card */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Basket Subtotal</span>
                      <span className="font-extrabold text-slate-800">
                        ₦{cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Certified Cold Chain Fee</span>
                      <span className="font-bold text-slate-800">₦1,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Local Farmer Service Levy</span>
                      <span className="font-bold text-slate-800">₦250</span>
                    </div>
                    
                    <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-sm font-headline">
                      <span className="font-extrabold text-slate-800">Estimated Total</span>
                      <span className="text-base font-black text-[#00450d]">
                        ₦{(cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) + 1750).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <button
                    onClick={() => setCurrentScreen("checkout")}
                    className="w-full bg-[#00450d] hover:bg-[#055f18] text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    Proceed to Secure Checkout
                    <span className="material-symbols-outlined">shield_lock</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================== 8. SECURE CHECKOUT SCREEN ==================== */}
          {currentScreen === "checkout" && (
            <div className="p-4 space-y-4 fade-in pt-[calc(env(safe-area-inset-top)+12px)]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentScreen("cart")}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-800"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                </button>
                <h2 className="text-base font-bold text-slate-800 font-headline">Secure Checkout</h2>
              </div>

              {/* Delivery Address selection */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700">Delivery Address</h3>
                <div className="space-y-2">
                  {DEFAULT_ADDRESSES.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        selectedAddressId === addr.id
                          ? "border-[#00450d] bg-emerald-50/40 shadow-sm"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800">{addr.label}</span>
                        {selectedAddressId === addr.id && (
                          <span className="material-symbols-outlined text-xs text-[#00450d] font-bold">check_circle</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">{addr.address}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scheduled Delivery Slots */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700">Delivery Schedule</h3>
                <select
                  value={selectedDeliveryTime}
                  onChange={(e) => setSelectedDeliveryTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-emerald-600"
                >
                  <option>Standard (Today 2PM - 5PM)</option>
                  <option>Express Cold Chain (Within 3 Hours) [Add ₦1,000]</option>
                  <option>Next-Day Morning (Tomorrow 8AM - 11AM)</option>
                </select>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700">Payment Option</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setSelectedPaymentMethod("wallet")}
                    className={`p-3 rounded-xl border cursor-pointer text-center space-y-1 transition-all ${
                      selectedPaymentMethod === "wallet"
                        ? "border-[#00450d] bg-emerald-50/40"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-emerald-800">account_balance_wallet</span>
                    <h4 className="text-[10px] font-bold text-slate-800">Oja Wallet</h4>
                    <p className="text-[9px] text-slate-400">Bal: ₦{user.balance.toLocaleString()}</p>
                  </div>

                  <div
                    onClick={() => setSelectedPaymentMethod("transfer")}
                    className={`p-3 rounded-xl border cursor-pointer text-center space-y-1 transition-all ${
                      selectedPaymentMethod === "transfer"
                        ? "border-[#00450d] bg-emerald-50/40"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-slate-600">account_balance</span>
                    <h4 className="text-[10px] font-bold text-slate-800">Bank Transfer</h4>
                    <p className="text-[9px] text-slate-400">Instant Verification</p>
                  </div>
                </div>
              </div>

              {/* Promo code card */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-[11px] font-bold text-slate-700">Do you have a Promo Code?</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. FRESH20)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-emerald-600"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-[#00450d] hover:bg-[#055f18] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Promo 'FRESH20' applied! 20% Discount secured.
                  </p>
                )}
              </div>

              {/* Final calculation details */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-slate-800">
                    ₦{cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toLocaleString()}
                  </span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount (20%)</span>
                    <span>-₦{(cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) * 0.2).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Certified Cold Chain Logistics</span>
                  <span className="font-bold text-slate-800">₦1,500</span>
                </div>
                <div className="flex justify-between">
                  <span>Farmer Service Levy</span>
                  <span className="font-bold text-slate-800">₦250</span>
                </div>
                
                <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-sm font-headline">
                  <span className="font-extrabold text-slate-800 font-headline">Total Secure Charge</span>
                  <span className="text-base font-black text-[#00450d]">
                    ₦{(
                      cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) * (1 - promoDiscount) + 1750
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={placeOrder}
                className="w-full bg-[#00450d] hover:bg-[#055f18] text-white font-extrabold py-3.5 rounded-2xl shadow-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95"
              >
                Place Secure Order (🔒 Verified Payment)
              </button>

            </div>
          )}

          {/* ==================== 9. ACTIVE ORDER TRACKING SCREEN ==================== */}
          {currentScreen === "tracking" && activeOrder && (
            <div className="p-4 space-y-4 fade-in pt-[calc(env(safe-area-inset-top)+12px)]">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-800 font-headline">Live Order Tracking</h2>
                <span className="text-[10px] bg-amber-500 text-black font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                  {activeOrder.id}
                </span>
              </div>

              {/* Satellite Route Map Mockup */}
              <div className="relative h-64 rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBenFelvkmAzjEvFrEBjyb0A-9SX95t_KJJyk_KCW7-ZTWnfFBexGU0JvvSA6Sqdoy1vICfFugkNVY4HKQb9iM6eyXqPuyObo7y7h4bm0_TidgjQDw46eAlozXdrtvkCPESTus9dkgkkv142cyZQY4A44zhjDVLtKGJFEaoiZa9Ckj7ZyB4IyR3t1idIZu31xVMlUDcPLuFljFIUZw9E6fGwGJu3duh3_rz4h_8wTJqhjCGqVljGKdXsO_X3fzmg3RoumY3L1WGoVk"
                  alt="GPS route mapping"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-[#00450d] text-white text-[9px] font-extrabold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  In Cold Transport (4.2°C)
                </div>
              </div>

              {/* Courier details contact area */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activeOrder.courierAvatar}
                    alt={activeOrder.courierName}
                    className="w-11 h-11 rounded-full object-cover border border-emerald-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{activeOrder.courierName}</h4>
                    <p className="text-[10px] text-slate-400">Oja Certified Delivery Partner</p>
                    <p className="text-[10px] text-[#00450d] font-bold mt-0.5">★ 4.9 (1,480 trips)</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`tel:${activeOrder.courierPhone}`}
                    className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-[#00450d] hover:bg-slate-200 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">call</span>
                  </a>
                  <button
                    onClick={() => {
                      setCurrentScreen("ai-chat");
                      setChatMessages([
                        ...chatMessages,
                        {
                          id: `dispatch-${Date.now()}`,
                          role: "assistant",
                          text: `Sure Chioma, I can ping your dispatch courier, **Chinedu Okafor**. He is currently around Victoria Island heading your way with your fresh basket! Feel free to call him at ${activeOrder.courierPhone}.`,
                          timestamp: new Date()
                        }
                      ]);
                    }}
                    className="w-9 h-9 bg-[#00450d] text-white hover:bg-[#055f18] rounded-full flex items-center justify-center shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </button>
                </div>
              </div>

              {/* Vertical tracking milestones */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-bold text-slate-700 font-headline mb-3">Order Status Milestones</h3>
                <div className="relative border-l border-slate-100 pl-6 ml-2 space-y-4 py-1">
                  {activeOrder.trackingTimeline?.map((t, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                        t.isCompleted
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : t.isCurrent
                            ? "bg-amber-500 border-amber-500 text-black animate-pulse"
                            : "bg-white border-slate-200 text-slate-300"
                      }`}>
                        <span className="material-symbols-outlined text-[8px] font-bold">
                          {t.isCompleted ? "check" : t.isCurrent ? "sync" : "hourglass_empty"}
                        </span>
                      </div>
                      <div>
                        <div className="flex justify-between items-baseline">
                          <h4 className={`text-xs font-bold ${t.isCompleted || t.isCurrent ? "text-slate-800" : "text-slate-400"}`}>
                            {t.status}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-mono">{t.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{t.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==================== 10. ORDER HISTORY LOG SCREEN ==================== */}
          {currentScreen === "order-history" && (
            <div className="p-4 space-y-4 fade-in pt-[calc(env(safe-area-inset-top)+12px)]">
              <h2 className="text-base font-bold text-slate-800 font-headline">Your Order History</h2>

              {/* Filter chips */}
              <div className="flex gap-2 text-[10px] font-bold text-slate-500">
                <span className="bg-[#00450d] text-white px-3 py-1.5 rounded-lg border border-transparent shadow-sm">All Past Orders</span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">Completed</span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">Active</span>
              </div>

              {/* List of past orders */}
              <div className="space-y-3">
                {orders.map((ord, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">Order ID: </span>
                        <span className="text-[11px] font-bold text-slate-800">{ord.id}</span>
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        ord.status === "Delivered"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-100 text-amber-800 animate-pulse"
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                      {ord.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-7 h-7 rounded-lg object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[10px] font-bold text-slate-700">{item.product.name} x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400">Date: {ord.date}</p>
                        <p className="text-xs font-black text-[#00450d] mt-0.5">₦{ord.total.toLocaleString()}</p>
                      </div>

                      {ord.status === "Delivered" ? (
                        <button
                          onClick={() => {
                            ord.items.forEach(it => addToCart(it.product, it.quantity));
                            alert("Items re-added to basket successfully!");
                            setCurrentScreen("cart");
                          }}
                          className="bg-[#00450d] hover:bg-[#055f18] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider"
                        >
                          Buy Again
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentScreen("tracking")}
                          className="bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider"
                        >
                          Track Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ==================== 11. SAVED WISHLIST SCREEN ==================== */}
          {currentScreen === "wishlist" && (
            <div className="p-4 space-y-4 fade-in pt-[calc(env(safe-area-inset-top)+12px)]">
              <h2 className="text-base font-bold text-slate-800 font-headline">My Wishlist</h2>

              {wishlist.length === 0 ? (
                <div className="text-center py-12 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <span className="material-symbols-outlined text-4xl text-slate-300">favorite</span>
                  <h3 className="text-xs font-bold text-slate-700">No Wishlist Saved</h3>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Save fresh essentials to monitor harvesting times and price notifications easily.
                  </p>
                  <button
                    onClick={() => setCurrentScreen("home")}
                    className="bg-[#00450d] text-white text-xs font-bold px-4 py-2 rounded-xl mt-2"
                  >
                    Find More Essentials
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlist.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3"
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-800">{prod.name}</h4>
                          <span className="bg-amber-50 text-amber-800 text-[8px] font-bold px-1 py-0.2 rounded uppercase">Certified</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{prod.unit || prod.farmSource}</p>
                        <p className="text-xs font-extrabold text-[#00450d]">₦{prod.price.toLocaleString()}</p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => {
                            addToCart(prod);
                            alert(`${prod.name} added to cart!`);
                          }}
                          className="bg-[#00450d] text-white p-1.5 rounded-lg flex items-center justify-center hover:bg-[#055f18]"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                        </button>
                        <button
                          onClick={() => toggleWishlist(prod)}
                          className="text-red-500 hover:text-red-700 flex items-center justify-center text-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Based on Wishlist recommendations */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-700 font-headline">Based on your Wishlist</h3>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeCItMTD2T7QjkPjwrycQfjWUuYfNo-jfAbEJt4flGzXn3IEHdYbJhTMADMsjpFlW8ivD6BIK4zcPpFQl0ztLS9rYPONyduRhyQCwHBsNXspN15pGqT-krYJr-sIrI4-1NEyd9M6qx9Ccc4G7XhkQYeDnelN_z7kapV48wT4UBzjGitCoEytfVhttDZa6tJu7tIobncfTbExjoWqleL2tlK8fIJxFm8KqNyFjBCkhBQWwCIqHAYKj1UjNKYRhtlP92DMs8CxSIYTc"
                      alt="Plantains"
                      className="w-10 h-10 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Ripe Plantains (Direct bunch)</h4>
                      <p className="text-[9px] text-slate-400">Shagamu Farms</p>
                      <p className="text-xs font-extrabold text-[#00450d] mt-0.5">₦1,200</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const prod = products.find(p => p.id === "ripe-plantains") || products[products.length-1];
                      addToCart(prod);
                      alert(`${prod.name} added to cart!`);
                    }}
                    className="bg-slate-100 text-[#00450d] hover:bg-slate-200 text-xs font-bold p-2 rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ==================== 12. USER PROFILE SCREEN ==================== */}
          {currentScreen === "profile" && (
            <div className="p-4 space-y-4 fade-in pt-[calc(env(safe-area-inset-top)+12px)]">
              {/* Profile Top Header */}
              <div className="flex justify-between items-center pb-1">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#0B3014] text-lg font-bold">account_circle</span>
                  My Profile
                </h2>
                <button
                  onClick={() => setCurrentScreen("edit-profile")}
                  className="flex items-center gap-1 text-[9px] font-black uppercase text-[#0B3014] bg-white border-2 border-[#0B3014] px-2.5 py-1 rounded-full shadow-[2px_2px_0px_0px_#FF4D00] hover:bg-slate-50 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[11px] font-black">edit</span>
                  Edit Profile
                </button>
              </div>

              {/* Profile Card */}
              <div className="bg-gradient-to-r from-emerald-950 to-[#00450d] text-white p-5 rounded-3xl shadow-md space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={user.avatar}
                    alt="User profile"
                    className="w-14 h-14 rounded-full border-2 border-white/50 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold font-headline leading-none">
                      {user.username ? (user.username.startsWith("@") ? user.username : "@" + user.username) : "@ojacustomer"}
                    </h3>
                    <p className="text-[10px] text-emerald-200 font-bold mt-1">{user.firstName} {user.lastName}</p>
                    <p className="text-[9px] text-slate-200 opacity-80 mt-0.5">{user.email}</p>
                    <span className="inline-block bg-amber-500 text-black text-[8px] font-extrabold uppercase px-2 py-0.5 rounded mt-1.5 shadow-sm">
                      Level 3 Elite Customer
                    </span>
                  </div>
                </div>

                {/* Account Balances Bento */}
                <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-emerald-800">
                  <div>
                    <p className="text-[9px] text-emerald-100/70 font-bold uppercase tracking-wider">Oja Points</p>
                    <p className="text-base font-black text-amber-400 mt-0.5">{user.points.toLocaleString()} PTS</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-emerald-100/70 font-bold uppercase tracking-wider">Wallet Balance</p>
                    <p className="text-base font-black text-white mt-0.5">₦{user.balance.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Verified Account Settings */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-xs">
                <div className="p-3 border-b border-slate-100 font-bold text-slate-700 bg-slate-50">
                  Account Settings
                </div>
                
                <div className="divide-y divide-slate-100">
                  <div 
                    onClick={() => setCurrentScreen("edit-profile")}
                    className="p-3 flex justify-between items-center text-[#0B3014] font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#0B3014]">manage_accounts</span>
                      Complete & Edit Profile
                    </span>
                    <span className="text-slate-400 material-symbols-outlined">chevron_right</span>
                  </div>

                  <div className="p-3 flex justify-between items-center text-slate-600 hover:bg-slate-50 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">pin_drop</span>
                      Saved Delivery Addresses
                    </span>
                    <span className="text-slate-400 material-symbols-outlined">chevron_right</span>
                  </div>

                  <div className="p-3 flex justify-between items-center text-slate-600 hover:bg-slate-50 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">payment</span>
                      Manage Verified Bank Cards
                    </span>
                    <span className="text-slate-400 material-symbols-outlined">chevron_right</span>
                  </div>

                  <div className="p-3 flex justify-between items-center text-slate-600 hover:bg-slate-50 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">fingerprint</span>
                      Registered Bio-Metrics
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">Enabled</span>
                  </div>

                  <div className="p-3 flex justify-between items-center text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">notifications_active</span>
                      Harvest Notifications Setup
                    </span>
                    <span className="text-slate-400 material-symbols-outlined">chevron_right</span>
                  </div>

                  <div 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-3 flex justify-between items-center text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">
                        {darkMode ? "dark_mode" : "light_mode"}
                      </span>
                      Dark Mode Theme
                    </span>
                    <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                      darkMode ? "bg-[#0B3014] dark:bg-[#95d78e]" : "bg-slate-200"
                    }`}>
                      <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform shadow-sm ${
                        darkMode ? "translate-x-3.5" : "translate-x-0"
                      }`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* safety standard credentials badge list */}
              <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-bold text-slate-500">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col items-center">
                  <span className="material-symbols-outlined text-[#00450d] mb-1">workspace_premium</span>
                  GAP Certified
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col items-center">
                  <span className="material-symbols-outlined text-[#00450d] mb-1">security</span>
                  Biometric Lock
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col items-center">
                  <span className="material-symbols-outlined text-[#00450d] mb-1">history</span>
                  Immutable Logs
                </div>
              </div>

            </div>
          )}

          {/* ==================== 12b. EDIT PROFILE SCREEN ==================== */}
          {currentScreen === "edit-profile" && (
            <div className="bg-[#F8F9FA] min-h-full flex flex-col pb-10 animate-fade-in relative text-slate-800">
              {/* Notification Message Toast */}
              {notificationMessage && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0B3014] border-2 border-amber-400 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 max-w-[90%] text-xs font-bold animate-fade-in">
                  <span className="material-symbols-outlined text-amber-400">check_circle</span>
                  <span>{notificationMessage}</span>
                </div>
              )}

              {/* Deactivate Modal */}
              {isDeactivating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                  <div className="bg-white rounded-3xl border-2 border-[#0B3014] p-5 max-w-sm w-full space-y-4 shadow-2xl">
                    <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
                      <span className="material-symbols-outlined text-2xl font-bold">no_accounts</span>
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Deactivate Oja Account?</h3>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Are you sure you want to deactivate your profile? You will lose your verified freshness credentials, active shopping streaks, and your accumulated <span className="font-extrabold text-[#0B3014]">{user.points.toLocaleString()} Oja points</span>.
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsDeactivating(false)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDeactivating(false);
                          setNotificationMessage("Account deactivation requested. Oja security desk will verify your request within 24 hours.");
                        }}
                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 shadow-md"
                      >
                        Yes, Deactivate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="bg-white border-b border-slate-100 px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("profile")}
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                </button>
                <h1 className="text-sm font-black text-slate-800 uppercase tracking-wider font-headline">Edit Profile</h1>
                <button
                  type="button"
                  onClick={() => {
                    // Save form values to user details
                    const parts = editForm.fullName.trim().split(" ");
                    const firstName = parts[0] || "Oja";
                    const lastName = parts.slice(1).join(" ") || "Customer";
                    
                    setUser({
                      ...user,
                      firstName,
                      lastName,
                      email: editForm.email,
                      phone: editForm.phone,
                      username: editForm.username.startsWith("@") ? editForm.username.slice(1) : editForm.username,
                      address: editForm.address,
                      deliveryInstructions: editForm.deliveryInstructions,
                      twoFactorEnabled: editForm.twoFactorEnabled,
                      avatar: editForm.avatar
                    });
                    setNotificationMessage("Your Oja profile has been successfully saved & updated!");
                    setTimeout(() => {
                      setCurrentScreen("profile");
                    }, 1200);
                  }}
                  className="bg-[#0B3014] text-white hover:bg-[#FF4D00] text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full transition-all duration-200 shadow-sm active:scale-95"
                >
                  Save
                </button>
              </div>

              {/* Edit Profile Body Content */}
              <div className="p-4 space-y-5">
                {/* Avatar Selection Card */}
                <div className="flex flex-col items-center py-2 relative">
                  <div className="relative">
                    <img
                      src={editForm.avatar}
                      alt="User edit avatar"
                      className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      className="absolute bottom-1 right-1 w-8 h-8 bg-[#0B3014] text-white border-2 border-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#FF4D00] transition-colors active:scale-90"
                    >
                      <span className="material-symbols-outlined text-sm font-black">photo_camera</span>
                    </button>
                  </div>

                  <h3 className="text-xs font-black text-slate-800 mt-2">{editForm.fullName || "Oja Customer"}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Freshness Enthusiast</p>

                  {/* Curated Avatar Selection Dropdown/Drawer */}
                  {showAvatarPicker && (
                    <div className="w-full bg-white rounded-2xl border-2 border-[#0B3014] p-4 mt-3 shadow-lg space-y-3 animate-fade-in z-10">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Choose curated avatar</h4>
                        <button
                          type="button"
                          onClick={() => setShowAvatarPicker(false)}
                          className="text-[10px] text-[#0B3014] font-black uppercase tracking-wider"
                        >
                          Done
                        </button>
                      </div>

                      {/* Presets Grid */}
                      <div className="grid grid-cols-5 gap-2">
                        {AVATAR_PRESETS.map((p, idx) => {
                          const isSelected = editForm.avatar === p.url;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setEditForm(prev => ({ ...prev, avatar: p.url }))}
                              className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                                isSelected ? "border-[#0B3014] scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img src={p.url} className="w-full h-10 object-cover" referrerPolicy="no-referrer" />
                              {isSelected && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[10px] text-white font-bold">check</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom URL Input */}
                      <div className="space-y-1 pt-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Or enter custom image URL</label>
                        <input
                          type="text"
                          value={editForm.avatar}
                          onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full text-[10px] border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 outline-none focus:border-[#0B3014] focus:bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 1. PERSONAL INFORMATION SECTION */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 border-b border-slate-200/60 pb-1.5">
                    <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Personal Information</h3>
                  </div>

                  {/* Username Field */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-1">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val && !val.startsWith("@")) {
                          val = "@" + val;
                        }
                        setEditForm(prev => ({ ...prev, username: val }));
                      }}
                      className="w-full text-xs font-bold border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-800 focus:border-[#0B3014] focus:ring-1 focus:ring-[#0B3014] outline-none shadow-sm transition-all"
                    />
                  </div>

                  {/* Full Name Field */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full text-xs font-bold border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-800 focus:border-[#0B3014] focus:ring-1 focus:ring-[#0B3014] outline-none shadow-sm transition-all"
                    />
                  </div>

                  {/* Email Address Field */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-1">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full text-xs font-bold border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-800 focus:border-[#0B3014] focus:ring-1 focus:ring-[#0B3014] outline-none shadow-sm transition-all"
                    />
                  </div>

                  {/* Phone Number Field */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-1">Phone Number</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full text-xs font-bold border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-800 focus:border-[#0B3014] focus:ring-1 focus:ring-[#0B3014] outline-none shadow-sm transition-all"
                    />
                  </div>
                </div>

                {/* 2. DELIVERY PREFERENCES SECTION */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-200/60 pb-1.5">
                    <span className="material-symbols-outlined text-slate-400 text-lg">local_shipping</span>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Delivery Preferences</h3>
                  </div>

                  {/* Default Address Block */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-[#0B3014] uppercase tracking-wider">Default Address</span>
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(!isEditingAddress)}
                        className="text-[9px] font-black text-[#FF4D00] uppercase tracking-wider hover:underline"
                      >
                        {isEditingAddress ? "Done" : "Edit"}
                      </button>
                    </div>

                    {isEditingAddress ? (
                      <textarea
                        rows={2}
                        value={editForm.address}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full text-xs font-bold border border-slate-300 rounded-xl p-2 bg-slate-50 text-slate-800 outline-none focus:border-[#0B3014] focus:bg-white transition-all"
                      />
                    ) : (
                      <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                        {editForm.address || "No address configured yet."}
                      </p>
                    )}
                  </div>

                  {/* Delivery Instructions */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-1">Delivery Instructions</label>
                    <textarea
                      rows={2}
                      value={editForm.deliveryInstructions}
                      onChange={(e) => setEditForm(prev => ({ ...prev, deliveryInstructions: e.target.value }))}
                      className="w-full text-xs font-bold border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-800 focus:border-[#0B3014] focus:ring-1 focus:ring-[#0B3014] outline-none shadow-sm transition-all"
                      placeholder="e.g. Leave package with gatekeeper..."
                    />
                  </div>
                </div>

                {/* 3. ACCOUNT SECURITY SECTION */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-200/60 pb-1.5">
                    <span className="material-symbols-outlined text-slate-400 text-lg">shield</span>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Security</h3>
                  </div>

                  {/* Change Password Panel */}
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 text-xs">
                    <div
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                      className="p-3.5 flex justify-between items-center text-slate-700 hover:bg-slate-50 cursor-pointer font-bold transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-slate-400 text-base">vpn_key</span>
                        Change Password
                      </span>
                      <span className="text-slate-400 material-symbols-outlined transition-transform duration-200" style={{ transform: isChangingPassword ? 'rotate(90deg)' : 'none' }}>
                        chevron_right
                      </span>
                    </div>

                    {isChangingPassword && (
                      <div className="p-4 bg-slate-50 space-y-3 animate-fade-in">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Current Password</label>
                          <input
                            type="password"
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                            className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-800 outline-none"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider">New Password</label>
                          <input
                            type="password"
                            value={passwordForm.newPass}
                            onChange={(e) => setPasswordForm(p => ({ ...p, newPass: e.target.value }))}
                            className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-800 outline-none"
                            placeholder="Minimum 8 characters"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                          <input
                            type="password"
                            value={passwordForm.confirm}
                            onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                            className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-800 outline-none"
                            placeholder="Re-type new password"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
                              alert("Please fill in all password fields!");
                              return;
                            }
                            if (passwordForm.newPass !== passwordForm.confirm) {
                              alert("New passwords do not match!");
                              return;
                            }
                            setPasswordForm({ current: "", newPass: "", confirm: "" });
                            setIsChangingPassword(false);
                            setNotificationMessage("Security credentials changed. Password updated successfully!");
                          }}
                          className="w-full py-2 bg-[#0B3014] text-white hover:bg-[#FF4D00] text-[9px] font-black uppercase tracking-wider rounded-xl shadow-sm transition-all duration-200"
                        >
                          Update Password
                        </button>
                      </div>
                    )}

                    {/* Two-Factor Authentication Item */}
                    <div className="p-3.5 flex justify-between items-center text-slate-700 bg-white">
                      <span className="flex items-center gap-2.5 font-bold">
                        <span className="material-symbols-outlined text-slate-400 text-base">verified_user</span>
                        Two-Factor Authentication
                      </span>
                      
                      {/* Interactive Switch */}
                      <button
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                        className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 outline-none ${
                          editForm.twoFactorEnabled ? "bg-[#0B3014]" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                            editForm.twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Deactivate Account Action Button */}
                <div className="pt-4 pb-6">
                  <button
                    type="button"
                    onClick={() => setIsDeactivating(true)}
                    className="w-full py-3.5 bg-white hover:bg-rose-50/50 border border-rose-200 hover:border-rose-300 text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-150 active:scale-95 text-center shadow-sm animate-pulse-subtle"
                  >
                    Deactivate My Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 13. OJA AI ASSISTANT SCREEN ==================== */}
          {currentScreen === "ai-chat" && (
            <div className="min-h-full flex flex-col justify-between bg-slate-50 relative">
              {/* Floating Header */}
              <div className="bg-white border-b border-slate-200 px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00450d] to-amber-500 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Oja AI Assistant</h3>
                    <p className="text-[8px] text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Freshness & Culinary IQ Active
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setChatMessages([
                      {
                        id: `clear-${Date.now()}`,
                        role: "assistant",
                        text: "History refreshed! How can Oja assist you with ingredients, storage, or cooking guidelines today?",
                        timestamp: new Date()
                      }
                    ]);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Clear
                </button>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar max-h-[550px] min-h-[450px]">
                {chatMessages.map((msg) => {
                  const recommended = msg.role === "assistant" ? getRecommendedProducts(msg.text, products) : [];
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} space-y-2`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "bg-[#00450d] text-white rounded-tr-none"
                          : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                      }`}>
                        {/* Decode newline symbols cleanly */}
                        <p className="whitespace-pre-line text-[11px] font-sans">
                          {msg.role === "assistant" 
                            ? cleanMessageText(msg.text).replace(/Chioma/gi, user.username ? (user.username.startsWith("@") ? user.username : "@" + user.username) : "Customer") 
                            : cleanMessageText(msg.text)}
                        </p>
                        <span className="text-[8px] opacity-60 text-right block mt-1">
                          {msg.timestamp instanceof Date 
                            ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {msg.orderWizard && (
                        <div className="w-full max-w-[85%] animate-fade-in">
                          <OrderWizardCard
                            messageId={msg.id}
                            recipeId={msg.orderWizard.recipeId}
                            recipeName={msg.orderWizard.recipeName}
                            step={msg.orderWizard.step}
                            servings={msg.orderWizard.servings}
                            ingredients={msg.orderWizard.ingredients}
                            onNextStep={handleWizardNext}
                            onApproveOrder={handleWizardApprove}
                            cartItems={cart}
                            products={products}
                          />
                        </div>
                      )}

                      {recommended.length > 0 && (
                        <div className="w-full max-w-[90%] pl-1 space-y-1.5 animate-fade-in mt-1 mb-3">
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">
                            <span className="material-symbols-outlined text-[13px] text-[#00450d] font-bold">compost</span>
                            Fresh Ingredient Previews
                          </div>
                          <div className="flex gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth">
                            {recommended.map((product) => (
                              <IngredientCard
                                key={product.id}
                                product={product}
                                onAddToCart={(qty) => addToCart(product, qty)}
                                cartItems={cart}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-2 shadow-sm rounded-tl-none">
                      <span className="w-2 h-2 bg-[#00450d] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-[#00450d] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-[#00450d] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      <span className="text-[10px] text-slate-400 font-mono ml-1">Polling fields...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Prefilled Prompt Suggestions */}
              <div className="p-3 bg-white border-t border-slate-100 space-y-2">
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider pl-1">Quick Suggestions</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {[
                    "I want to make Jollof Rice, help me order the ingredients",
                    "Help me order Edikang Ikong ingredients",
                    "How to store Ugu leaves?",
                    "Check #OJ-59921-LA"
                  ].map((sugg) => (
                    <button
                      key={sugg}
                      onClick={() => handleChatSubmit(sugg)}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 hover:bg-slate-100 whitespace-nowrap"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input form footer */}
              <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Oja AI anything..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleChatSubmit();
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-emerald-600"
                />
                <button
                  onClick={() => handleChatSubmit()}
                  disabled={chatLoading}
                  className="w-10 h-10 rounded-full bg-[#00450d] hover:bg-[#055f18] text-white flex items-center justify-center shadow-md active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== 14. PARTNER LANDING SCREEN ==================== */}
          {currentScreen === "partner-portal" && (
            <div className="space-y-4 fade-in pt-12">
              {/* Hero Header Banner */}
              <div className="relative h-48 bg-slate-200">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6Kc-TeGHevWYGF7Nxakl_GBSNpG4ZfbPpTUH5BsWIafixonJnUW-P0M5Oc8231UYJ9VzMx_czSq36f3HCB_njXI_zSeU-KphQYvHZb4LnFhvvvKFVkSfnbyN25Zxg1ujJU_8tBTHnW6z8IOpoC4Zj85EsFkCtmCCt5QFlAFleANlJsb12h3m6WLvZM6P6VRn-JQXX9oJgRQJR2V9mQsXq9XFyMmiB-SiRXdICsvirKUzfdnN8j3Epgvko2hvaKFUGvFHNV_4gFX0"
                  alt="Grow with Oja"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-lg font-extrabold font-headline leading-none">Partner with Oja</h2>
                  <p className="text-[10px] text-amber-400 font-bold mt-1">Boost Your Yield • Transparent Fair Contracts</p>
                </div>
              </div>

              {/* Farmer Video Feature */}
              <div className="px-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 font-headline">Oja Farm Success Story</h3>
                <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlfoGNDoA9huqxxrkQRP5qsDtUrGgYPT6_i9tnUchCH5R8tE6jvjX2CTtDDC6samRWLpQhX44-cGHJrofRTACPT0KoCw6rd54jEK3Ne2sKmFeXJR_FIpEfUqIRxHpv0lTk5rs0e90I7hgTaeDzrvUb6QVLZvMkh8WR_ueHc_xMLG7_SJFiXvKn7sQwHO1gvdfgZkCss36zXg0JI9FNHKeEdjIi8Gt1Y-ZQgTPKhV3a6LQQJW0BbpyWKeNUj5pEHmQvIPsRIEyWYuE"
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button className="w-12 h-12 rounded-full bg-white text-emerald-900 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform">
                      <span className="material-symbols-outlined text-2xl font-bold">play_arrow</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Verified Locations Map */}
              <div className="px-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 font-headline">Oja Verified Agribusiness Grid</h3>
                <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO6srMRPmNqeKBZ1vk0m0YGKEYdk2aVIumc-z-jipZzAq20K6Lrllw6k24Z4-HMAwd1H4ckuDx6xpsw9E_NDoteT9F2LnrTcLDYgejtBC_fv8ICqa-KjE_v3LY7h2O8Q7D0hxvJ-CnH0imzCbPDCFgdadLQfKi976R-mukgLMOsboEiieslaUxGwM1jOmayuJQ4KZ2gNJx7fb7-QwRWogK5SBTlZPbHJZg_JC_Y8NHpPvKoxOEUh-VMDIXy6Wx-Pgah6VzZ6F9x6A"
                    alt="Verified farm locations map"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Core Offerings Props */}
              <div className="px-4 space-y-3 pb-8">
                <h3 className="text-xs font-bold text-slate-700 font-headline">Our Partnership Values</h3>
                <div className="space-y-2.5">
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#00450d] text-xl mt-0.5">price_check</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Guaranteed Fair Contracts</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Locks in transparent prices independent of local retail volatility.</p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#00450d] text-xl mt-0.5">ac_unit</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Cold Storage & Transit Logistics</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Oja supply chain vehicles pick up products directly to eliminate waste.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <button
                    onClick={() => setCurrentScreen("partner-registration")}
                    className="w-full bg-[#FF4D00] hover:bg-[#0B3014] hover:text-white text-white font-black py-4 rounded-xl border-2 border-[#0B3014] shadow-[4px_4px_0px_0px_#0B3014] transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
                  >
                    Start Partner Registration
                    <span className="material-symbols-outlined text-sm">agriculture</span>
                  </button>

                  <button
                    onClick={() => setCurrentScreen("partner-dashboard")}
                    className="w-full bg-white hover:bg-[#E8E8E3] text-[#0B3014] font-black py-3.5 rounded-xl border-2 border-[#0B3014] shadow-[3px_3px_0px_0px_#0B3014] transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
                  >
                    Access Farm Partner Dashboard
                    <span className="material-symbols-outlined text-sm">analytics</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ==================== 14B. PARTNER REGISTRATION STEPS ==================== */}
          {currentScreen === "partner-registration" && (
            <PartnerRegistration
              onBack={() => setCurrentScreen("partner-portal")}
              onComplete={() => {
                alert("Application submitted! Redirecting to your Live Partner Dashboard...");
                setCurrentScreen("partner-dashboard");
              }}
            />
          )}

        </div>

        {/* persistent navigation bar shown only if authenticated and not in intro screens */}
        {isAuthenticated && currentScreen !== "splash" && currentScreen !== "welcome" && currentScreen !== "auth" && (
          <Navbar
            currentScreen={currentScreen}
            onScreenChange={setCurrentScreen}
            cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
            wishlistCount={wishlist.length}
          />
        )}

      </div>
  );
};
