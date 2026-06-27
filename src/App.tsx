import React, { useState } from "react";
import { Product, Order, User } from "./types";
import { PRODUCTS, DEFAULT_USER } from "./data";
import { ScreenSelector } from "./components/ScreenSelector";
import { MobileApp } from "./mobile-app/MobileApp";
import { FarmersDashboard } from "./farm-dashboard/FarmersDashboard";
import { ManagementDashboard } from "./admin/ManagementDashboard";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>("splash");
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

  const isDashboard = currentScreen === "partner-dashboard" || currentScreen === "management-dashboard";

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col lg:flex-row items-center justify-center font-sans relative overflow-hidden p-2 lg:p-6 select-none">
      
      {/* Decorative Brand Circles */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-[#0B3014]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-[#FF4D00]/5 blur-3xl pointer-events-none" />

      {/* Left Docked Screen Quick-Jump Selector */}
      <ScreenSelector currentScreen={currentScreen} onScreenChange={setCurrentScreen} />

      {isDashboard ? (
        <div className="w-full min-h-screen z-10">
          {currentScreen === "partner-dashboard" && (
            <FarmersDashboard
              products={products}
              onUpdateProducts={setProducts}
              orders={orders}
              user={user}
              onScreenChange={setCurrentScreen}
            />
          )}
          {currentScreen === "management-dashboard" && (
            <ManagementDashboard
              products={products}
              onUpdateProducts={setProducts}
              orders={orders}
              onUpdateOrders={setOrders}
              user={user}
              onUpdateUser={setUser}
              onScreenChange={setCurrentScreen}
            />
          )}
        </div>
      ) : (
        <MobileApp
          products={products}
          onUpdateProducts={setProducts}
          orders={orders}
          onUpdateOrders={setOrders}
          user={user}
          onUpdateUser={setUser}
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
        />
      )}
    </div>
  );
}
