#!/bin/bash
set -e

echo "Updating Capacitor in mobile..."
cd apps/mobile
npm install @capacitor/core@latest @capacitor/camera@latest @capacitor/geolocation@latest @capacitor/push-notifications@latest --legacy-peer-deps
npm install -D @capacitor/cli@latest @capacitor/ios@latest @capacitor/android@latest --legacy-peer-deps
npx cap sync ios
cd ../..

echo "Updating Capacitor in admin-dashboard..."
cd apps/admin-dashboard
npm install @capacitor/core@latest @capacitor/push-notifications@latest --legacy-peer-deps
npm install -D @capacitor/cli@latest @capacitor/ios@latest @capacitor/android@latest --legacy-peer-deps
npx cap sync ios
cd ../..

echo "Updating Capacitor in farm-dashboard..."
cd apps/farm-dashboard
npm install @capacitor/core@latest @capacitor/push-notifications@latest --legacy-peer-deps
npm install -D @capacitor/cli@latest @capacitor/ios@latest @capacitor/android@latest --legacy-peer-deps
npx cap sync ios
cd ../..

echo "Update complete!"
