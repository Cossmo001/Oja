import React from "react";

interface TimelineStep {
  title: string;
  time: string;
  description: string;
  icon: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export const FreshnessTimeline: React.FC = () => {
  const steps: TimelineStep[] = [
    {
      title: "Field Harvested",
      time: "05:30 AM (Today)",
      description: "Hand-picked by Farmer Segun at Jos Highlands Partner Farm at peak turgor pressure.",
      icon: "agriculture",
      isCompleted: true,
      isCurrent: false,
    },
    {
      title: "Oja Quality Assurance Inspection",
      time: "07:15 AM (Today)",
      description: "Tested for structural firmness, blemish ratio <1%, and pesticide residues.",
      icon: "verified",
      isCompleted: true,
      isCurrent: false,
    },
    {
      title: "Sanitized & Packaged",
      time: "08:30 AM (Today)",
      description: "Micro-washed and sealed in oxygen-permeable, biodegradable breathable liners.",
      icon: "inventory_2",
      isCompleted: true,
      isCurrent: true,
    },
    {
      title: "In Transit to Hub",
      time: "09:45 AM (Today)",
      description: "Loaded into temperature-controlled container trucks headed to Lagos Central Hub.",
      icon: "local_shipping",
      isCompleted: false,
      isCurrent: false,
    },
    {
      title: "Lagos Delivery Courier Dispatch",
      time: "Estimated 02:00 PM",
      description: "Dispatched via Oja Last-Mile Express directly to your doorstep.",
      icon: "distance",
      isCompleted: false,
      isCurrent: false,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border-4 border-[#0B3014] shadow-[6px_6px_0px_0px_#0B3014]">
      <div className="flex items-center justify-between mb-5 border-b-2 border-[#0B3014] pb-3">
        <h3 className="font-black text-[#0B3014] text-sm uppercase tracking-tight font-headline">Oja Certified Path</h3>
        <span className="text-[9px] bg-[#FF4D00] text-white border-2 border-[#0B3014] font-black uppercase tracking-widest px-2 py-1 flex items-center gap-1 shadow-[2px_2px_0px_0px_#0B3014]">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          Live GPS
        </span>
      </div>

      <div className="relative border-l-4 border-[#0B3014] pl-6 ml-3 space-y-6 py-2">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Timeline Circle Node */}
            <div className={`absolute -left-[37px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#0B3014] transition-all ${
              step.isCompleted
                ? "bg-[#0B3014] text-white"
                : step.isCurrent
                  ? "bg-[#FF4D00] text-white animate-pulse"
                  : "bg-white text-[#0B3014]/40"
            }`}>
              <span className="material-symbols-outlined text-[13px] font-bold">
                {step.icon}
              </span>
            </div>

            {/* Content Card */}
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <h4 className={`text-xs font-black uppercase tracking-wider ${
                  step.isCurrent ? "text-[#FF4D00]" : "text-[#0B3014]"
                }`}>
                  {step.title}
                </h4>
                <span className="text-[9px] text-[#0B3014]/50 font-bold whitespace-nowrap">
                  {step.time}
                </span>
              </div>
              <p className="text-[11px] text-[#0B3014]/70 mt-1 leading-relaxed font-sans">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
