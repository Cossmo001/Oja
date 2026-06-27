import React, { useState, useEffect } from "react";

interface DateRangePickerProps {
  onRangeChange: (start: Date, end: Date) => void;
  initialPreset?: "3days" | "7days" | "14days" | "custom";
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onRangeChange,
  initialPreset = "7days",
}) => {
  // Base current date for the dashboard is fixed at June 27, 2026 for consistent Lagos marketplace data
  const baseDate = new Date("2026-06-27T10:00:00");

  const [preset, setPreset] = useState<"3days" | "7days" | "14days" | "custom">(initialPreset);

  // Default dates in YYYY-MM-DD format
  const [startDateStr, setStartDateStr] = useState<string>("2026-06-21");
  const [endDateStr, setEndDateStr] = useState<string>("2026-06-27");

  // Format Date to YYYY-MM-DD
  const formatDateToInputString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const applyPreset = (selectedPreset: "3days" | "7days" | "14days") => {
    setPreset(selectedPreset);
    const end = new Date(baseDate);
    const start = new Date(baseDate);

    if (selectedPreset === "3days") {
      start.setDate(baseDate.getDate() - 2); // 3 days inclusive: 25, 26, 27
    } else if (selectedPreset === "7days") {
      start.setDate(baseDate.getDate() - 6); // 7 days inclusive: 21 to 27
    } else if (selectedPreset === "14days") {
      start.setDate(baseDate.getDate() - 13); // 14 days inclusive
    }

    const startStr = formatDateToInputString(start);
    const endStr = formatDateToInputString(end);
    
    setStartDateStr(startStr);
    setEndDateStr(endStr);
    onRangeChange(start, end);
  };

  const handleCustomDateChange = (type: "start" | "end", value: string) => {
    setPreset("custom");
    let start = new Date(startDateStr + "T00:00:00");
    let end = new Date(endDateStr + "T23:59:59");

    if (type === "start") {
      setStartDateStr(value);
      start = new Date(value + "T00:00:00");
    } else {
      setEndDateStr(value);
      end = new Date(value + "T23:59:59");
    }

    // Guard to ensure start is before end
    if (start > end) {
      if (type === "start") {
        end = new Date(start);
        end.setDate(start.getDate() + 1);
        setEndDateStr(formatDateToInputString(end));
      } else {
        start = new Date(end);
        start.setDate(end.getDate() - 1);
        setStartDateStr(formatDateToInputString(start));
      }
    }

    onRangeChange(start, end);
  };

  // Initial trigger
  useEffect(() => {
    applyPreset(initialPreset === "custom" ? "7days" : (initialPreset as any));
  }, []);

  return (
    <div id="date-range-picker" className="bg-white p-4 rounded-2xl border-4 border-[#0B3014] shadow-[4px_4px_0px_0px_#0B3014] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      
      {/* Label and Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#FF4D00] font-bold text-lg">calendar_month</span>
          <div>
            <h5 className="text-[11px] font-black uppercase text-[#0B3014] tracking-wider leading-none">
              Transaction Period
            </h5>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">
              Filter charts by selected date range
            </p>
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="hidden sm:block w-px h-8 bg-slate-200 mx-2" />

        {/* Preset Selector Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {(["3days", "7days", "14days"] as const).map((p) => {
            const label = p === "3days" ? "3 Days" : p === "7days" ? "7 Days" : "14 Days";
            const isActive = preset === p;
            return (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border-2 ${
                  isActive
                    ? "bg-[#0B3014] text-white border-[#0B3014] shadow-[2px_2px_0px_0px_#FF4D00]"
                    : "bg-[#F5F5F0] text-[#0B3014] border-transparent hover:border-[#0B3014]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Inputs */}
      <div className="flex items-center gap-2">
        {/* Start Date */}
        <div className="flex flex-col">
          <label className="text-[8px] font-extrabold text-[#0B3014] uppercase tracking-wider mb-1 pl-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDateStr}
            max="2026-12-31"
            onChange={(e) => handleCustomDateChange("start", e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border-2 border-[#0B3014] text-xs font-bold text-[#0B3014] bg-[#F5F5F0] focus:bg-white outline-none focus:shadow-[2px_2px_0px_0px_#FF4D00] transition-all"
          />
        </div>

        {/* Arrow/Indicator */}
        <span className="material-symbols-outlined text-slate-400 font-bold mt-4 text-xs">
          arrow_forward
        </span>

        {/* End Date */}
        <div className="flex flex-col">
          <label className="text-[8px] font-extrabold text-[#0B3014] uppercase tracking-wider mb-1 pl-1">
            End Date
          </label>
          <input
            type="date"
            value={endDateStr}
            max="2026-12-31"
            onChange={(e) => handleCustomDateChange("end", e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border-2 border-[#0B3014] text-xs font-bold text-[#0B3014] bg-[#F5F5F0] focus:bg-white outline-none focus:shadow-[2px_2px_0px_0px_#FF4D00] transition-all"
          />
        </div>

        {/* Dynamic Reset Indicator for custom values */}
        {preset === "custom" && (
          <button
            onClick={() => applyPreset("7days")}
            className="mt-4 p-1.5 rounded-lg border-2 border-[#FF4D00] text-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all flex items-center justify-center"
            title="Reset to default 7 days"
          >
            <span className="material-symbols-outlined text-sm font-bold">restart_alt</span>
          </button>
        )}
      </div>
    </div>
  );
};
