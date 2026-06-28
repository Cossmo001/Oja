#!/bin/bash
set -e

for app in admin-dashboard farm-dashboard; do
  echo "Setting up Electron for $app..."
  cd apps/$app
  
  # Remove the broken community plugin
  npm uninstall @capacitor-community/electron

  # Install standard Electron dependencies
  npm install -D electron electron-builder concurrently wait-on
  
  # Create electron folder
  mkdir -p electron
  
  cd ../..
done

echo "Electron setup complete!"
