import React, { useState, useEffect } from "react";
import { ManagementDashboard } from "./ManagementDashboard";
import { fetchProducts, fetchUser, Product, Order, User } from "@oja/shared";
import { ScreenSelector } from "@oja/shared";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>("management-dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    async function loadData() {
      try {
        const [p, u] = await Promise.all([
          fetchProducts(),
          fetchUser()
        ]);
        
        setProducts(p);
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




  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col lg:flex-row items-center justify-center font-sans relative overflow-hidden p-2 lg:p-6 select-none">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-[#0B3014]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-[#FF4D00]/5 blur-3xl pointer-events-none" />
      <ScreenSelector currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
      
      <div className="w-full min-h-screen z-10">
        <ManagementDashboard
          products={products}
          onUpdateProducts={setProducts}
          orders={orders}
          onUpdateOrders={setOrders}
          user={user!}
          onUpdateUser={setUser}
          onScreenChange={setCurrentScreen}
        />
      </div>
    </div>
  );
}
