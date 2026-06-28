const fs = require('fs');
let content = fs.readFileSync('apps/mobile/src/MobileApp.tsx', 'utf8');

// 1. Fix array indexing
content = content.replace(/products\[2\]/g, 'products[0]');
content = content.replace(/products\[4\]/g, 'products[0]');
content = content.replace(/products\[13\]/g, 'products[0]');
content = content.replace(/products\[6\]/g, 'products[0]');
content = content.replace(/products\[3\]/g, 'products[0]');

// 2. Remove fake bezel & fix root container
content = content.replace(
  '<div className="w-full max-w-md bg-[#F5F5F0] border-4 border-[#0B3014] rounded-[36px] shadow-[12px_12px_0px_0px_#0B3014] relative overflow-hidden flex flex-col z-10 transition-all duration-300 font-sans"\n         style={{ height: "860px" }}>\n        \n        {/* Notch / Speaker and Camera Mock */}\n        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#0B3014] rounded-b-2xl z-50 flex items-center justify-center">\n          <div className="w-12 h-1 bg-neutral-800 rounded-full" />\n          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 ml-4 border border-neutral-800" />\n        </div>',
  '<div className="w-full h-full bg-[#F5F5F0] relative overflow-hidden flex flex-col z-10 font-sans">'
);

// 3. Remove pb-24 from scroll container
content = content.replace(
  '<div className="flex-1 overflow-y-auto pb-24 relative custom-scrollbar bg-[#F5F5F0]">',
  '<div className="flex-1 overflow-y-auto relative custom-scrollbar bg-[#F5F5F0]">'
);

// 4. Make home header sticky
content = content.replace(
  '{currentScreen === "home" && (\n            <div className="p-4 space-y-5 fade-in pt-12">',
  '{currentScreen === "home" && (\n            <div className="fade-in flex flex-col h-full">\n              <div className="sticky top-0 z-50 bg-[#F5F5F0]/95 backdrop-blur-sm pt-12 pb-4 px-4 space-y-4 border-b border-[#0B3014]/5 shadow-sm">'
);

// 5. Close sticky header and open scrollable content before AI banner
content = content.replace(
  '              {/* Persistent AI Prompt Assistant Banner */}',
  '              </div>\n              <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-8">\n              {/* Persistent AI Prompt Assistant Banner */}'
);

// 6. Close the scrollable content at the end of the home screen block
const homeBlockEnd = `            </div>
          )}

          {/* ==================== 5. VEGETABLES CATEGORY LIST SCREEN ==================== */}`;
const newHomeBlockEnd = `              </div>
            </div>
          )}

          {/* ==================== 5. VEGETABLES CATEGORY LIST SCREEN ==================== */}`;
content = content.replace(homeBlockEnd, newHomeBlockEnd);

fs.writeFileSync('apps/mobile/src/MobileApp.tsx', content, 'utf8');
console.log('MobileApp patched successfully.');
