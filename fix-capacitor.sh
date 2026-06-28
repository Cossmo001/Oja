#!/bin/bash
set -e

# Define versions
VERSION="8.1.1"

echo "Downgrading Capacitor to $VERSION in mobile..."
cd apps/mobile
npm install @capacitor/core@$VERSION @capacitor/camera@$VERSION @capacitor/geolocation@$VERSION @capacitor/push-notifications@$VERSION --legacy-peer-deps --save-exact
npm install -D @capacitor/cli@$VERSION @capacitor/ios@$VERSION @capacitor/android@$VERSION --legacy-peer-deps --save-exact
npx cap sync ios
cd ../..

echo "Downgrading Capacitor to $VERSION in admin-dashboard..."
cd apps/admin-dashboard
npm install @capacitor/core@$VERSION @capacitor/push-notifications@$VERSION --legacy-peer-deps --save-exact
npm install -D @capacitor/cli@$VERSION @capacitor/ios@$VERSION @capacitor/android@$VERSION --legacy-peer-deps --save-exact
npx cap sync ios
cd ../..

echo "Downgrading Capacitor to $VERSION in farm-dashboard..."
cd apps/farm-dashboard
npm install @capacitor/core@$VERSION @capacitor/push-notifications@$VERSION --legacy-peer-deps --save-exact
npm install -D @capacitor/cli@$VERSION @capacitor/ios@$VERSION @capacitor/android@$VERSION --legacy-peer-deps --save-exact
npx cap sync ios
cd ../..

echo "Fix complete!"
