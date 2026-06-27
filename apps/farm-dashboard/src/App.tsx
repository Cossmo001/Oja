import React, { useState } from "react";
import { FarmersDashboard } from "./FarmersDashboard";
import { PRODUCTS, DEFAULT_USER, Product, Order, User } from "@oja/shared";
import { ScreenSelector } from "@oja/shared";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>("partner-dashboard");
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "OJ-4929-LA",
      date: "June 25, 2026",
      items: [
        {
          product: PRODUCTS.find((p) => p.id === "premium-harvest-basket") || PRODUCTS[0],
          quantity: 1,
        },
      ],
      subtotal: 12500,
      deliveryFee: 1500,
      serviceFee: 250,
      total: 14250,
      status: "Delivered",
      estDeliveryTime: "Delivered at 03:15 PM, June 25",
    },
  ]);

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col lg:flex-row items-center justify-center font-sans relative overflow-hidden p-2 lg:p-6 select-none">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-[#0B3014]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-[#FF4D00]/5 blur-3xl pointer-events-none" />
      <ScreenSelector currentScreen={currentScreen} onScreenChange={setCurrentScreen} />
      
      <div className="w-full min-h-screen z-10">
        <FarmersDashboard
          products={products}
          onUpdateProducts={setProducts}
          orders={orders}
          user={user}
          onScreenChange={setCurrentScreen}
        />
      </div>
    </div>
  );
}
