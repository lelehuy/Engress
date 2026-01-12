#!/bin/bash

# Engress macOS DMG Build Script

APP_NAME="Engress"
BUILD_DIR="build/bin"
DMG_NAME="Engress-Setup.dmg"
TEMP_DMG="temp.dmg"
VOLUME_NAME="Engress Installer"

echo "🚀 Starting Build Process for $APP_NAME..."

# 1. Build the Wails application
# This creates Engress.app in build/bin/
wails build -platform darwin/universal -clean

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "📦 Packaging into DMG..."

# 2. Preparation
rm -f "$DMG_NAME"
rm -rf "dist_temp"
mkdir "dist_temp"

# Copy the .app to the temp folder
cp -R "$BUILD_DIR/$APP_NAME.app" "dist_temp/"

# Create a symlink to Applications
ln -s /Applications "dist_temp/Applications"

# 3. Create the DMG
hdiutil create -volname "$VOLUME_NAME" -srcfolder "dist_temp" -ov -format UDZO "$DMG_NAME"

# 4. Cleanup
rm -rf "dist_temp"

echo "✅ DMG Created: $DMG_NAME"
echo "You can now distribute this file to other macOS users."
