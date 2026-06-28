import fs from 'fs';
import path from 'path';

function fixAppTsx(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace imports
  content = content.replace(
    /import \{ PRODUCTS, DEFAULT_USER, Product, Order, User \} from "@oja\/shared";/,
    'import { fetchProducts, fetchUser, Product, Order, User } from "@oja/shared";'
  );
  
  // Add useEffect to import React
  if (content.includes('import React, { useState } from "react";')) {
    content = content.replace(
      'import React, { useState } from "react";',
      'import React, { useState, useEffect } from "react";'
    );
  }

  // Replace state initializations
  content = content.replace(
    /const \[products, setProducts\] = useState<Product\[\]>\(PRODUCTS\);/,
    'const [products, setProducts] = useState<Product[]>([]);'
  );
  content = content.replace(
    /const \[user, setUser\] = useState<User>\(DEFAULT_USER\);/,
    'const [user, setUser] = useState<User | null>(null);'
  );

  // Strip out the hardcoded initial order to simplify, we'll set it in useEffect
  content = content.replace(/const \[orders, setOrders\] = useState<Order\[\]>\(\[\s*\{[\s\S]*?\}\s*\]\);/, 'const [orders, setOrders] = useState<Order[]>([]);');

  // Insert useEffect and loading state before return
  const useEffectCode = `
  useEffect(() => {
    async function loadData() {
      try {
        const p = await fetchProducts();
        setProducts(p);
        const u = await fetchUser();
        if (u) setUser(u);
        if (p.length > 0) {
          setOrders([
            {
              id: "OJ-4929-LA",
              date: "June 25, 2026",
              items: [{ product: p[0], quantity: 1 }],
              subtotal: 12500,
              deliveryFee: 1500,
              serviceFee: 250,
              total: 14250,
              status: "Delivered",
              estDeliveryTime: "Delivered at 03:15 PM, June 25",
            }
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  if (!user || products.length === 0) {
    return <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center font-sans">Loading Oja...</div>;
  }
`;

  // Find where `return (` is and insert before it
  content = content.replace(/(\s*return \(\s*<div className="min-h-screen)/, useEffectCode + '$1');

  // Pass user properly if it was User | null
  content = content.replace(/user=\{user\}/, 'user={user!}');

  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
}

const apps = [
  'apps/admin-dashboard/src/App.tsx',
  'apps/farm-dashboard/src/App.tsx',
  'apps/mobile/src/App.tsx'
];

apps.forEach(app => fixAppTsx(path.join(process.cwd(), app)));

// Fix MobileApp.tsx
const mobileAppPath = path.join(process.cwd(), 'apps/mobile/src/MobileApp.tsx');
let mobileContent = fs.readFileSync(mobileAppPath, 'utf8');

// Replace imports
mobileContent = mobileContent.replace(
  /import \{ Product, CartItem, Order, ChatMessage, User, PRODUCTS, DEFAULT_USER, DEFAULT_ADDRESSES, Navbar, FreshnessTimeline, TraceabilityCard, PartnerRegistration \} from "@oja\/shared";/,
  'import { Product, CartItem, Order, ChatMessage, User, DEFAULT_ADDRESSES, Navbar, FreshnessTimeline, TraceabilityCard, PartnerRegistration } from "@oja/shared";'
);

// Fix getRecommendedProducts signature
mobileContent = mobileContent.replace(
  /const getRecommendedProducts = \(text: string\): Product\[\] => \{/,
  'const getRecommendedProducts = (text: string, products: Product[]): Product[] => {'
);

// Replace all global PRODUCTS with lowercase products where appropriate (in helper functions, we pass it, in the component, it's from props)
mobileContent = mobileContent.replace(/PRODUCTS/g, 'products');
mobileContent = mobileContent.replace(/DEFAULT_USER/g, 'user');

// Fix calls to getRecommendedProducts inside the component
mobileContent = mobileContent.replace(/getRecommendedProducts\(aiResponse\)/g, 'getRecommendedProducts(aiResponse, products)');
mobileContent = mobileContent.replace(/getRecommendedProducts\(text\)/g, 'getRecommendedProducts(text, products)');

fs.writeFileSync(mobileAppPath, mobileContent);
console.log('Fixed MobileApp.tsx');

// Fix server.ts (demo data)
const serverPath = path.join(process.cwd(), 'server.ts');
if (fs.existsSync(serverPath)) {
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    // server.ts doesn't import PRODUCTS directly, just uses strings. But let's check.
}
