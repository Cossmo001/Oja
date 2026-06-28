const fs = require('fs');
const path = require('path');

const apps = ['admin-dashboard', 'farm-dashboard'];

apps.forEach(app => {
  const pkgPath = path.join(__dirname, 'apps', app, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  pkg.main = "electron/main.cjs";
  
  if (!pkg.scripts) pkg.scripts = {};
  pkg.scripts["electron:start"] = "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"";
  pkg.scripts["electron:build"] = "npm run build && electron-builder";
  
  if (!pkg.build) {
    pkg.build = {
      appId: `com.oja.${app.split('-')[0]}`,
      directories: {
        output: "dist_electron"
      },
      files: [
        "dist/**/*",
        "electron/**/*"
      ],
      mac: { target: "dmg" },
      win: { target: "nsis" },
      linux: { target: "AppImage" }
    };
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log(`Patched ${app} package.json`);
});
