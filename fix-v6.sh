#!/bin/bash
set -e

VERSION="^6.0.0"

echo "Downgrading to Capacitor v6 in mobile..."
cd apps/mobile
npm install @capacitor/core@$VERSION @capacitor/camera@$VERSION @capacitor/geolocation@$VERSION @capacitor/push-notifications@$VERSION --legacy-peer-deps
npm install -D @capacitor/cli@$VERSION @capacitor/ios@$VERSION @capacitor/android@$VERSION --legacy-peer-deps
npx cap sync ios
cd ../..

echo "Downgrading to Capacitor v6 in admin-dashboard..."
cd apps/admin-dashboard
npm install @capacitor/core@$VERSION @capacitor/push-notifications@$VERSION --legacy-peer-deps
npm install -D @capacitor/cli@$VERSION @capacitor/ios@$VERSION @capacitor/android@$VERSION --legacy-peer-deps
npx cap sync ios
cd ../..

echo "Downgrading to Capacitor v6 in farm-dashboard..."
cd apps/farm-dashboard
npm install @capacitor/core@$VERSION @capacitor/push-notifications@$VERSION --legacy-peer-deps
npm install -D @capacitor/cli@$VERSION @capacitor/ios@$VERSION @capacitor/android@$VERSION --legacy-peer-deps
npx cap sync ios
cd ../..

echo "v6 Downgrade complete!"
