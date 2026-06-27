import React, { useState } from "react";

interface ScreenSelectorProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
}

export const ScreenSelector: React.FC<ScreenSelectorProps> = ({
  currentScreen,
  onScreenChange,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const groups = [
    {
      title: "Onboarding & Access",
      screens: [
        { id: "splash", name: "Splash / Launch Screen", icon: "offline_bolt" },
        { id: "welcome", name: "Onboarding Welcome", icon: "door_open" },
        { id: "auth", name: "Sign In / Sign Up", icon: "lock_open" },
      ],
    },
    {
      title: "Marketplace Shopping",
      screens: [
        { id: "home", name: "Shop Home Grid", icon: "grid_view" },
        { id: "vegetables", name: "Fresh Vegetables List", icon: "nutrition" },
        { id: "product-detail", name: "Product Detail (Bell Peppers)", icon: "info" },
        { id: "wishlist", name: "My Wishlist", icon: "favorite" },
      ],
    },
    {
      title: "Cart & Checkout Flow",
      screens: [
        { id: "cart", name: "Shopping Basket (Cart)", icon: "shopping_basket" },
        { id: "checkout", name: "Secure Checkout Form", icon: "shopping_cart_checkout" },
        { id: "tracking", name: "Active Order Tracking", icon: "local_shipping" },
        { id: "order-history", name: "Order History Log", icon: "history" },
      ],
    },
    {
      title: "AI Integration",
      screens: [
        { id: "ai-chat", name: "Oja AI Assistant", icon: "forum", highlight: true },
      ],
    },
    {
      title: "Partner & Platform Portals",
      screens: [
        { id: "partner-portal", name: "Grow with Oja (Landing)", icon: "spa" },
        { id: "partner-registration", name: "Partner Registration Steps", icon: "app_registration" },
        { id: "partner-dashboard", name: "Farm Partner Dashboard", icon: "analytics" },
        { id: "management-dashboard", name: "Oja Management Dashboard", icon: "admin_panel_settings" },
      ],
    },
    {
      title: "Account & Settings",
      screens: [
        { id: "profile", name: "User Profile Card", icon: "account_circle" },
        { id: "edit-profile", name: "Edit Profile Form", icon: "manage_accounts" },
      ],
    },
  ];

  return (
    <>
      {/* Floating Toggle Button on Mobile or smaller views */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-[#0B3014] text-white p-3 border-2 border-[#0B3014] shadow-[3px_3px_0px_0px_#FF4D00] flex items-center justify-center hover:bg-[#FF4D00] transition-transform active:scale-95"
        title="Toggle Screen Hub"
      >
        <span className="material-symbols-outlined text-2xl">
          {isOpen ? "close" : "menu_open"}
        </span>
      </button>

      {/* Screen Selection Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#F5F5F0] border-r-4 border-[#0B3014] shadow-none z-40 transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full"
        }`}
      >
        <div className="p-6 border-b-4 border-[#0B3014] flex items-center gap-3 bg-[#0B3014] text-white pt-20">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#FF4D00] shadow-sm">
            <span className="material-symbols-outlined text-[#0B3014] text-2xl font-bold">
              compost
            </span>
          </div>
          <div>
            <h2 className="text-xl font-black font-headline tracking-tighter leading-none uppercase">Oja Screen Hub</h2>
            <p className="text-xs text-[#FF4D00] font-bold uppercase tracking-wider mt-1">15 Custom Screens</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-[#F5F5F0]">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              <h3 className="text-[10px] uppercase font-black text-[#0B3014]/40 tracking-widest pl-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.screens.map((screen) => {
                  const isActive = currentScreen === screen.id;
                  return (
                    <button
                      key={screen.id}
                      onClick={() => onScreenChange(screen.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-black uppercase tracking-wider transition-all duration-200 group relative border-2 ${
                        isActive
                          ? "bg-[#0B3014] text-white border-[#0B3014] shadow-[3px_3px_0px_0px_#FF4D00]"
                          : "text-[#0B3014]/70 border-transparent hover:bg-[#E8E8E3] hover:text-[#0B3014]"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-lg transition-colors ${
                          isActive ? "text-[#FF4D00] font-bold" : "text-[#0B3014]/50 group-hover:text-[#0B3014]"
                        }`}
                      >
                        {screen.icon}
                      </span>
                      <span className="truncate">{screen.name}</span>

                      {isActive && (
                        <span className="absolute right-3 w-2 h-2 rounded-full bg-[#FF4D00] animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t-4 border-[#0B3014] bg-[#E8E8E3] text-center">
          <p className="text-[10px] text-[#0B3014] font-mono font-bold uppercase tracking-widest">
            Oja Platform • Trust Every Bite
          </p>
        </div>
      </div>

      {/* Background overlay for mobile menu */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/10 z-30 lg:hidden"
        />
      )}
    </>
  );
};
