import React, { useState } from "react";

export const TraceabilityCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"farmer" | "soil" | "compliance">("farmer");

  return (
    <div className="bg-white rounded-2xl border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014] overflow-hidden">
      {/* Header Banner */}
      <div className="bg-[#0B3014] text-white p-4 border-b-2 border-[#0B3014]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#FF4D00] text-lg font-bold">
            verified_user
          </span>
          <span className="text-[9px] uppercase tracking-widest font-black text-[#FF4D00]">
            Oja Blockchain Traceability ID: #OJ-PEPP-7023
          </span>
        </div>
        <h3 className="text-sm font-black font-headline mt-1 uppercase tracking-tight">100% Verified Farm Direct</h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-[#0B3014]">
        {(["farmer", "soil", "compliance"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider border-r-2 last:border-r-0 border-[#0B3014] transition-all ${
              activeTab === tab
                ? "bg-[#FF4D00] text-white"
                : "bg-[#E8E8E3] text-[#0B3014] hover:bg-white"
            }`}
          >
            {tab === "farmer" && "The Farmer"}
            {tab === "soil" && "Soil & Water"}
            {tab === "compliance" && "Lab Certificate"}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="p-4 bg-[#F5F5F0]">
        {activeTab === "farmer" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white p-3 border-2 border-[#0B3014] rounded-xl shadow-[3px_3px_0px_0px_#0B3014]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBl6wF8Q43RqvhJakFmn3PCvyYznSgfuCNMSIFAG25oWx4DCQR1kClA-D8l5e3YyESbTYlMsKTBvGEea55uA_rs7W39JLh1Zctf_ppvrLoHyjD-Jo03552fbvo08q4Vv06T1I-3ZrGv906O-xmX6JETOqalGU6aEeKhb65E2ABn6TFouqhUVq5xxDFlHi2KkSTlTICk9p2b_V6nY-7X1uvVKfH2t7D-7Ynp-Ub0Q5IhWWljGA18G3bqI05NXBqR1pK94GnYF-F8jc"
                alt="Farmer Segun Alao"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#0B3014] shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0B3014]">Segun Alao</h4>
                <p className="text-[10px] text-[#0B3014]/70 font-medium">Jos Highlands Partner Farm, Plateau State</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[10px] text-[#FF4D00] font-black">
                    star
                  </span>
                  <span className="text-[10px] text-[#0B3014] font-black">4.9</span>
                  <span className="text-[10px] text-[#0B3014]/50 font-normal">(184 deliveries)</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-[#0B3014] leading-relaxed italic bg-[#E8E8E3] p-3 border-2 border-[#0B3014] rounded-xl shadow-[3px_3px_0px_0px_#0B3014] font-serif">
              "My family has farmed this high Plateau soil for generations. With Oja, we get cold storage support and transparent pricing directly to our village, ensuring your family eats healthier with no food wasted."
            </p>
          </div>
        )}

        {activeTab === "soil" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2.5 rounded-lg border-2 border-[#0B3014] shadow-[2px_2px_0px_0px_#0B3014]">
                <p className="text-[8px] text-[#0B3014]/50 font-black uppercase tracking-widest">Organic Matter</p>
                <p className="text-base font-black text-[#0B3014] mt-0.5">94% <span className="text-[9px] text-[#FF4D00] font-black">(Optimal)</span></p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border-2 border-[#0B3014] shadow-[2px_2px_0px_0px_#0B3014]">
                <p className="text-[8px] text-[#0B3014]/50 font-black uppercase tracking-widest">Pesticides</p>
                <p className="text-base font-black text-[#FF4D00] mt-0.5">0.00 ppm</p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border-2 border-[#0B3014] shadow-[2px_2px_0px_0px_#0B3014]">
                <p className="text-[8px] text-[#0B3014]/50 font-black uppercase tracking-widest">Soil pH Level</p>
                <p className="text-base font-black text-[#0B3014] mt-0.5">6.8 <span className="text-[9px] text-[#0B3014]/60 font-medium">(Neutral)</span></p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border-2 border-[#0B3014] shadow-[2px_2px_0px_0px_#0B3014]">
                <p className="text-[8px] text-[#0B3014]/50 font-black uppercase tracking-widest">Water Source</p>
                <p className="text-xs font-black text-[#0B3014] mt-1 flex items-center gap-1 uppercase tracking-tight">
                  <span className="material-symbols-outlined text-[12px] text-[#FF4D00] font-black">
                    water_drop
                  </span>
                  Spring
                </p>
              </div>
            </div>
            <p className="text-[9px] text-[#0B3014]/60 text-center font-mono font-bold uppercase tracking-wider">
              Soil audit completed: June 15, 2026 by Oja Agronomy Lab
            </p>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="space-y-2 text-xs">
            <div className="border-2 border-[#0B3014] bg-[#FF4D00]/10 p-3 rounded-lg shadow-[3px_3px_0px_0px_#0B3014] flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#FF4D00] text-lg font-bold">
                workspace_premium
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0B3014]">Hygiene Certified</p>
                <p className="text-[10px] text-[#0B3014]/70 mt-0.5 leading-relaxed">
                  Meets National Good Agricultural Practices (GAP) standards. Logged with immutable batch key <b>OJ-L-49221</b>.
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center bg-white p-2 border-2 border-[#0B3014] rounded-lg text-[9px] text-[#0B3014] font-mono font-bold uppercase tracking-wider">
              <span>Nitrate Levels: 45mg/kg</span>
              <span className="text-white bg-[#0B3014] px-2 py-0.5 text-[8px] font-black border border-[#0B3014]">PASS</span>
            </div>
            <div className="flex justify-between items-center bg-white p-2 border-2 border-[#0B3014] rounded-lg text-[9px] text-[#0B3014] font-mono font-bold uppercase tracking-wider">
              <span>Heavy Metal Ratio: Non-Detect</span>
              <span className="text-white bg-[#0B3014] px-2 py-0.5 text-[8px] font-black border border-[#0B3014]">PASS</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
