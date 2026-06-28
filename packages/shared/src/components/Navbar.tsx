import React from "react";

interface NavbarProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
  cartCount: number;
  wishlistCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onScreenChange,
  cartCount,
  wishlistCount,
}) => {
  const tabs = [
    { id: "home", label: "Shop", icon: "store" },
    { id: "wishlist", label: "Wishlist", icon: "favorite", badge: wishlistCount },
    { id: "ai-chat", label: "Assistant", icon: "forum", highlight: true },
    { id: "cart", label: "Basket", icon: "shopping_basket", badge: cartCount },
    { id: "profile", label: "Profile", icon: "person" },
  ];

  return (
    <nav 
      className="w-full bg-[#F5F5F0] border-t-4 border-[#0B3014] pt-3 px-1 grid grid-cols-5 place-items-end pb-3 z-40 max-w-md mx-auto rounded-t-[24px] mt-auto relative"
      style={{ paddingBottom: 'calc(max(env(safe-area-inset-bottom), 12px) + 8px)' }}
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id || (tab.id === "home" && currentScreen === "vegetables") || (tab.id === "home" && currentScreen === "product-detail");
        
        if (tab.highlight) {
          return (
            <button
              key={tab.id}
              onClick={() => onScreenChange(tab.id)}
              className="flex flex-col items-center justify-center -mt-8 relative w-full"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-[#0B3014] transition-all duration-300 ${
                isActive 
                  ? "bg-[#FF4D00] text-white animate-pulse-glow scale-105 shadow-[4px_4px_0px_0px_#0B3014]" 
                  : "bg-[#0B3014] text-white hover:bg-[#FF4D00] shadow-[3px_3px_0px_0px_#FF4D00]"
              }`}>
                <span className="material-symbols-outlined text-2xl">
                  {tab.icon}
                </span>
              </div>
              <span className={`text-[11px] mt-1 font-black uppercase tracking-wider transition-colors ${
                isActive ? "text-[#FF4D00] font-black" : "text-[#0B3014]"
              }`}>
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onScreenChange(tab.id)}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-lg relative transition-all duration-200 active:scale-95 w-full"
          >
            <div className="relative flex items-center justify-center">
              <span className={`material-symbols-outlined text-2xl transition-colors duration-200 ${
                isActive ? "text-[#FF4D00]" : "text-[#0B3014]/50 hover:text-[#0B3014]"
              }`}
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#FF4D00] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#0B3014] shadow-sm">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className={`text-[11px] mt-0.5 font-black uppercase tracking-wider transition-colors duration-200 ${
              isActive ? "text-[#FF4D00] font-black underline underline-offset-4 decoration-2" : "text-[#0B3014]/50"
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
