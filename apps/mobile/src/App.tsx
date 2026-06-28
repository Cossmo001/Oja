import React, { useState, useEffect } from "react";
import { MobileApp } from "./MobileApp";
import { fetchProducts, fetchUser, Product, Order, User, supabase } from "@oja/shared";
import { ScreenSelector } from "@oja/shared";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>("splash");
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    async function loadData() {
      try {
        const p = await fetchProducts();
        setProducts(p);
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

  useEffect(() => {
    // Listen for auth state changes reactively
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        const u = await fetchUser(session.user.id);
        if (u) {
          setUser(u);
          setCurrentScreen("home");
        }
      } else {
        // Direct to introduction screen/welcome on cold start guest
        setUser({
          firstName: "Guest",
          lastName: "User",
          email: "",
          phone: "",
          avatar: "",
          points: 0,
          joinedDate: new Date().toLocaleDateString(),
          balance: 0.00,
          username: "@guest",
          address: "",
          deliveryInstructions: "",
          twoFactorEnabled: false
        });
        setCurrentScreen("welcome");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!user || products.length === 0) {
    return (
      <div className="h-[100dvh] w-full bg-[#0B3014] flex flex-col items-center justify-between text-white p-8 pt-24 font-sans overflow-hidden">
        <div className="flex flex-col items-center text-center animate-fade-in">
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
            Syncing with local farms...
          </p>
        </div>
        
        <div className="w-full space-y-3 pb-8 flex justify-center">
           <div className="w-8 h-8 border-4 border-[#FF4D00] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }


  return (
    <div className="h-[100dvh] w-full bg-[#F5F5F0] flex flex-col font-sans relative overflow-hidden select-none">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-[#0B3014]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-[#FF4D00]/5 blur-3xl pointer-events-none" />
      
      <MobileApp
        products={products}
        onUpdateProducts={setProducts}
        orders={orders}
        onUpdateOrders={setOrders}
        user={user!}
        onUpdateUser={setUser}
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
      />
    </div>
  );
}
