#!/bin/bash
set -e

echo "Setting up Mobile App..."
cd apps/mobile
npm install @capacitor/core @capacitor/camera @capacitor/geolocation @capacitor/push-notifications --legacy-peer-deps
npm install -D @capacitor/cli @capacitor/ios @capacitor/android --legacy-peer-deps
npx cap init OjaMobile com.oja.mobile --web-dir dist
npx cap add ios
npx cap add android
cd ../..

echo "Setting up Admin Dashboard..."
cd apps/admin-dashboard
npm install @capacitor/core @capacitor/push-notifications --legacy-peer-deps
npm install -D @capacitor/cli @capacitor/ios @capacitor/android @capacitor-community/electron --legacy-peer-deps
npx cap init OjaAdmin com.oja.admin --web-dir dist
npx cap add ios
npx cap add android
npx cap add @capacitor-community/electron
cd ../..

echo "Setting up Farm Dashboard..."
cd apps/farm-dashboard
npm install @capacitor/core @capacitor/push-notifications --legacy-peer-deps
npm install -D @capacitor/cli @capacitor/ios @capacitor/android @capacitor-community/electron --legacy-peer-deps
npx cap init OjaFarm com.oja.farm --web-dir dist
npx cap add ios
npx cap add android
npx cap add @capacitor-community/electron
cd ../..

echo "Capacitor setup complete!"
